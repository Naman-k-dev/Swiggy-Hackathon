-- ==============================================================================
-- SWIGGY CAMPUS CIRCLES - CIRCLEVOTE & ORDER RESCUE DATABASE EXTENSION
-- Schema Migration for Decision Room Voting and Autonomous Order Rescue AI
-- ==============================================================================

-- 1. CIRCLE VOTE SESSIONS
CREATE TABLE IF NOT EXISTS public.circle_vote_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  meal_session_id UUID REFERENCES public.ordering_sessions(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Lunch Decision Room',
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  cutoff_time TIMESTAMPTZ NOT NULL,
  winning_option_id UUID,
  winning_restaurant_id TEXT,
  winning_restaurant_name TEXT,
  winner_reason TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CIRCLE VOTE OPTIONS (Up to 3 restaurant options per session)
CREATE TABLE IF NOT EXISTS public.circle_vote_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.circle_vote_sessions(id) ON DELETE CASCADE,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  restaurant_image TEXT,
  cuisine TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  price_range_text TEXT NOT NULL DEFAULT '₹150–₹250 per person',
  group_compatibility_score INTEGER NOT NULL CHECK (group_compatibility_score BETWEEN 0 AND 100),
  estimated_group_subtotal_paise INTEGER NOT NULL DEFAULT 50000,
  dietary_summary TEXT NOT NULL DEFAULT 'Suitable meals for all group members',
  budget_summary TEXT NOT NULL DEFAULT 'Fits student budget preferences',
  source TEXT NOT NULL CHECK (source IN ('circlematch_ai', 'campus_catalog', 'swiggy_mcp_verified')) DEFAULT 'campus_catalog',
  vote_count INTEGER NOT NULL DEFAULT 0 CHECK (vote_count >= 0)
);

-- 3. CIRCLE VOTES (One active vote per student per voting session)
CREATE TABLE IF NOT EXISTS public.circle_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.circle_vote_sessions(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.circle_vote_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_vote_per_session UNIQUE (session_id, user_id)
);

-- 4. ORDER RESCUE EVENTS
CREATE TABLE IF NOT EXISTS public.order_rescue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.ordering_sessions(id) ON DELETE CASCADE,
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  scenario TEXT NOT NULL CHECK (scenario IN ('dish_unavailable', 'budget_exceeded', 'dietary_conflict', 'member_selection_change')),
  original_dish_id TEXT NOT NULL,
  original_dish_name TEXT NOT NULL,
  original_price_paise INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('detected', 'resolved', 'dismissed')) DEFAULT 'detected',
  suggested_alternatives JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_replacement_id TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_vote_sessions_circle ON public.circle_vote_sessions(circle_id);
CREATE INDEX IF NOT EXISTS idx_vote_sessions_status ON public.circle_vote_sessions(status);
CREATE INDEX IF NOT EXISTS idx_vote_options_session ON public.circle_vote_options(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_session ON public.circle_votes(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON public.circle_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_order_rescue_session ON public.order_rescue_events(session_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.circle_vote_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_vote_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_rescue_events ENABLE ROW LEVEL SECURITY;

-- Vote Sessions: Viewable by circle members
CREATE POLICY "Vote sessions viewable by circle members" ON public.circle_vote_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_members.circle_id = circle_vote_sessions.circle_id
        AND circle_members.user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Circle admins create vote sessions" ON public.circle_vote_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.circles
      WHERE circles.id = circle_vote_sessions.circle_id
        AND circles.admin_id = auth.uid()
    )
  );

CREATE POLICY "Circle admins update vote sessions" ON public.circle_vote_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.circles
      WHERE circles.id = circle_vote_sessions.circle_id
        AND circles.admin_id = auth.uid()
    )
  );

-- Vote Options: Viewable by members of the session's circle
CREATE POLICY "Vote options viewable by circle members" ON public.circle_vote_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.circle_vote_sessions
      JOIN public.circle_members ON circle_members.circle_id = circle_vote_sessions.circle_id
      WHERE circle_vote_sessions.id = circle_vote_options.session_id
        AND circle_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins insert vote options" ON public.circle_vote_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.circle_vote_sessions
      JOIN public.circles ON circles.id = circle_vote_sessions.circle_id
      WHERE circle_vote_sessions.id = circle_vote_options.session_id
        AND circles.admin_id = auth.uid()
    )
  );

-- Votes: Members can view votes in their circle
CREATE POLICY "Votes viewable by circle members" ON public.circle_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.circle_vote_sessions
      JOIN public.circle_members ON circle_members.circle_id = circle_vote_sessions.circle_id
      WHERE circle_vote_sessions.id = circle_votes.session_id
        AND circle_members.user_id = auth.uid()
    )
  );

-- Votes: Members can insert or update only their own vote before cutoff
CREATE POLICY "Members cast own vote" ON public.circle_votes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.circle_vote_sessions
      JOIN public.circle_members ON circle_members.circle_id = circle_vote_sessions.circle_id
      WHERE circle_vote_sessions.id = circle_votes.session_id
        AND circle_members.user_id = auth.uid()
        AND circle_vote_sessions.status = 'active'
        AND circle_vote_sessions.cutoff_time > timezone('utc'::text, now())
    )
  );

CREATE POLICY "Members update own vote" ON public.circle_votes
  FOR UPDATE USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.circle_vote_sessions
      WHERE circle_vote_sessions.id = circle_votes.session_id
        AND circle_vote_sessions.status = 'active'
        AND circle_vote_sessions.cutoff_time > timezone('utc'::text, now())
    )
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- Order Rescue Events: Viewable by circle members
CREATE POLICY "Rescue events viewable by circle members" ON public.order_rescue_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_members.circle_id = order_rescue_events.circle_id
        AND circle_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users or admins manage rescue events" ON public.order_rescue_events
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.circles
      WHERE circles.id = order_rescue_events.circle_id
        AND circles.admin_id = auth.uid()
    )
  );

-- 5. TRIGGER: PREVENT VOTING AFTER CUTOFF
CREATE OR REPLACE FUNCTION public.check_vote_cutoff_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_session_status TEXT;
  v_cutoff_time TIMESTAMPTZ;
BEGIN
  SELECT status, cutoff_time INTO v_session_status, v_cutoff_time
  FROM public.circle_vote_sessions
  WHERE id = NEW.session_id;

  IF v_session_status != 'active' THEN
    RAISE EXCEPTION 'Cannot vote: decision room session is %', v_session_status;
  END IF;

  IF v_cutoff_time <= timezone('utc'::text, now()) THEN
    RAISE EXCEPTION 'Cannot vote: voting cutoff % has passed', v_cutoff_time;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_vote_cutoff ON public.circle_votes;
CREATE TRIGGER trg_check_vote_cutoff
BEFORE INSERT OR UPDATE ON public.circle_votes
FOR EACH ROW EXECUTE FUNCTION public.check_vote_cutoff_trigger();

-- 6. IMMUTABLE FINALIZED ORDERS TRIGGER
CREATE OR REPLACE FUNCTION public.enforce_order_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IN ('delivered', 'out_for_delivery') AND NEW.status != OLD.status THEN
    -- Status can advance, but items and monetary values cannot change
    IF NEW.subtotal_paise != OLD.subtotal_paise OR
       NEW.total_paise != OLD.total_paise OR
       NEW.delivery_fee_paise != OLD.delivery_fee_paise THEN
      RAISE EXCEPTION 'Cannot alter financial totals of an in-flight or finalized order';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_order_immutability ON public.demo_orders;
CREATE TRIGGER trg_enforce_order_immutability
BEFORE UPDATE ON public.demo_orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_order_immutability();

-- REALTIME REPLICATION ENABLEMENT
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_vote_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_vote_options;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_rescue_events;
