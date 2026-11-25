-- ==============================================================================
-- SWIGGY CAMPUS CIRCLES - COMPETITION READINESS & SYNC HARDENING MIGRATION
-- Ensures idempotent RLS, Phase 5 meal windows/readiness columns,
-- atomic CircleVote vote counters, and recursion-safe membership checks.
-- ==============================================================================

-- 1. PHASE 5 ORDERING SESSION EXTENSIONS (Readiness, Pickup Note, Meal Windows)
ALTER TABLE public.ordering_sessions
  ADD COLUMN IF NOT EXISTS pickup_note TEXT,
  ADD COLUMN IF NOT EXISTS ready_member_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  ADD COLUMN IF NOT EXISTS meal_type TEXT CHECK (meal_type IN ('Lunch', 'Dinner', 'Snacks', 'Custom')),
  ADD COLUMN IF NOT EXISTS session_name TEXT,
  ADD COLUMN IF NOT EXISTS recurrence TEXT CHECK (recurrence IN ('none', 'daily', 'weekdays', 'custom_days')),
  ADD COLUMN IF NOT EXISTS participations JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. RECURRING CAMPUS MEAL WINDOWS TABLE
CREATE TABLE IF NOT EXISTS public.recurring_meal_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('Lunch', 'Dinner', 'Snacks', 'Custom')) DEFAULT 'Lunch',
  title TEXT NOT NULL,
  target_time TEXT NOT NULL,
  cutoff_minutes_before INTEGER NOT NULL DEFAULT 30,
  recurrence TEXT NOT NULL CHECK (recurrence IN ('none', 'daily', 'weekdays', 'custom_days')) DEFAULT 'weekdays',
  preferred_restaurant_id TEXT,
  preferred_restaurant_name TEXT,
  pickup_point TEXT NOT NULL DEFAULT 'Campus Main Reception',
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_meal_windows_circle ON public.recurring_meal_windows(circle_id);
ALTER TABLE public.recurring_meal_windows ENABLE ROW LEVEL SECURITY;

-- 3. RECURSION-SAFE MEMBERSHIP HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.is_circle_member(p_circle_id UUID, p_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE circle_id = p_circle_id AND user_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.circles
    WHERE id = p_circle_id AND admin_id = p_user_id
  );
$$;

-- Helper returning invite-preview lookup by invite_code ONLY for authenticated users
CREATE OR REPLACE FUNCTION public.lookup_circle_by_invite_code(p_invite_code TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  college TEXT,
  description TEXT,
  emoji TEXT,
  banner_gradient TEXT,
  invite_code TEXT,
  preferred_budget INTEGER,
  admin_id UUID,
  created_at TIMESTAMPTZ,
  member_count BIGINT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.id,
    c.name,
    c.type,
    c.college,
    c.description,
    c.emoji,
    c.banner_gradient,
    c.invite_code,
    c.preferred_budget,
    c.admin_id,
    c.created_at,
    (SELECT COUNT(*) FROM public.circle_members cm WHERE cm.circle_id = c.id) AS member_count
  FROM public.circles c
  WHERE auth.uid() IS NOT NULL
    AND UPPER(c.invite_code) = UPPER(TRIM(p_invite_code))
  LIMIT 1;
$$;

-- 4. HARDENED RLS POLICIES (Fixing missing creator INSERT on circle_members & tightening public reads)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Members viewable by circle members" ON public.circle_members;
CREATE POLICY "Members viewable by circle members" ON public.circle_members
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND public.is_circle_member(circle_id, auth.uid())
  );

DROP POLICY IF EXISTS "Admins can add initial admin membership" ON public.circle_members;
CREATE POLICY "Admins can add initial admin membership" ON public.circle_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    role = 'admin' AND
    EXISTS (
      SELECT 1 FROM public.circles
      WHERE circles.id = circle_members.circle_id AND circles.admin_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Circles viewable by members or admin" ON public.circles;
CREATE POLICY "Circles viewable by members or admin" ON public.circles
  FOR SELECT USING (
    auth.uid() = admin_id OR public.is_circle_member(id, auth.uid())
  );

DROP POLICY IF EXISTS "Demo orders viewable by circle members" ON public.demo_orders;
CREATE POLICY "Demo orders viewable by circle members" ON public.demo_orders
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND public.is_circle_member(circle_id, auth.uid())
  );

DROP POLICY IF EXISTS "Demo order items viewable by all" ON public.demo_order_items;
DROP POLICY IF EXISTS "Demo order items viewable by circle members" ON public.demo_order_items;
CREATE POLICY "Demo order items viewable by circle members" ON public.demo_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.demo_orders d
      WHERE d.id = demo_order_items.order_id AND public.is_circle_member(d.circle_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS "Demo order items insertable" ON public.demo_order_items;
DROP POLICY IF EXISTS "Demo order items insertable by order placer" ON public.demo_order_items;
CREATE POLICY "Demo order items insertable by order placer" ON public.demo_order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.demo_orders d
      WHERE d.id = demo_order_items.order_id
        AND d.placed_by_id = auth.uid()
        AND public.is_circle_member(d.circle_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS "Meal windows viewable by circle members" ON public.recurring_meal_windows;
CREATE POLICY "Meal windows viewable by circle members" ON public.recurring_meal_windows
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND public.is_circle_member(circle_id, auth.uid())
  );

DROP POLICY IF EXISTS "Circle admins manage meal windows" ON public.recurring_meal_windows;
CREATE POLICY "Circle admins manage meal windows" ON public.recurring_meal_windows
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.circles c WHERE c.id = recurring_meal_windows.circle_id AND c.admin_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.circles c WHERE c.id = recurring_meal_windows.circle_id AND c.admin_id = auth.uid())
  );

DROP POLICY IF EXISTS "View analytics events" ON public.circlematch_analytics_events;
CREATE POLICY "View analytics events" ON public.circlematch_analytics_events
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND public.is_circle_member(circle_id, auth.uid())
  );

DROP POLICY IF EXISTS "Insert analytics events" ON public.circlematch_analytics_events;
CREATE POLICY "Insert analytics events" ON public.circlematch_analytics_events
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid())
  );

-- 5. ATOMIC TRIGGER: SYNC circle_vote_options.vote_count ON circle_votes CHANGES
CREATE OR REPLACE FUNCTION public.sync_vote_option_counts()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  v_session_id := COALESCE(NEW.session_id, OLD.session_id);

  UPDATE public.circle_vote_options opt
  SET vote_count = (
    SELECT COUNT(*)
    FROM public.circle_votes v
    WHERE v.session_id = v_session_id AND v.option_id = opt.id
  )
  WHERE opt.session_id = v_session_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_vote_option_counts ON public.circle_votes;
CREATE TRIGGER trg_sync_vote_option_counts
AFTER INSERT OR UPDATE OR DELETE ON public.circle_votes
FOR EACH ROW EXECUTE FUNCTION public.sync_vote_option_counts();

-- 6. REALTIME PUBLICATION (Idempotent)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.recurring_meal_windows;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
