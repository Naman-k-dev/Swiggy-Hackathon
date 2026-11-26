-- ==============================================================================
-- SWIGGY CAMPUS CIRCLES - PHASE 8: CAMPUS BUDDYMATCH & CIRCLEGUARD
-- 1. BuddyMatch Preferences & Discovery Settings
-- 2. Circle Join Requests & Approval Workflow
-- 3. Security Audit Logging & Safety Controls
-- ==============================================================================

-- 1. BUDDYMATCH PREFERENCES
CREATE TABLE IF NOT EXISTS public.buddy_match_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_discovery_enabled BOOLEAN NOT NULL DEFAULT false,
  preferred_meal_window TEXT CHECK (preferred_meal_window IN ('Lunch', 'Dinner', 'Both', 'LateNight')),
  preferred_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  budget_range_min_paise INTEGER NOT NULL DEFAULT 15000,
  budget_range_max_paise INTEGER NOT NULL DEFAULT 35000,
  cuisine_interests TEXT[] DEFAULT '{}',
  dietary_safety_pref TEXT, -- e.g. "Pure Veg Only", "No Peanuts", etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_prefs UNIQUE (user_id)
);

-- 2. CIRCLE DISCOVERY SETTINGS
CREATE TABLE IF NOT EXISTS public.circle_discovery_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  is_discoverable BOOLEAN NOT NULL DEFAULT false,
  meal_window TEXT CHECK (meal_window IN ('Lunch', 'Dinner', 'Both', 'LateNight')),
  target_budget_min_paise INTEGER NOT NULL DEFAULT 20000,
  target_budget_max_paise INTEGER NOT NULL DEFAULT 30000,
  cuisine_tags TEXT[] DEFAULT '{}',
  member_capacity INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_circle_discovery UNIQUE (circle_id)
);

-- 3. CIRCLE JOIN REQUESTS
CREATE TABLE IF NOT EXISTS public.circle_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
  compatibility_score INTEGER, -- 0 to 100
  compatibility_explanation TEXT,
  note TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '48 hours'),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_pending_request UNIQUE (circle_id, user_id, status) WHERE (status = 'pending')
);

-- 4. USER BLOCKS (Safety)
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id)
);

-- 5. ABUSE REPORTS (Safety)
CREATE TABLE IF NOT EXISTS public.abuse_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('spam', 'inappropriate', 'harassment', 'fraud', 'other')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. SECURITY AUDIT EVENTS (CircleGuard Audit Trail)
CREATE TABLE IF NOT EXISTS public.security_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Actor
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_hash TEXT, -- Obfuscated IP for security detection
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_buddy_match_prefs_user ON public.buddy_match_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_discovery_circle ON public.circle_discovery_settings(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_join_requests_circle ON public.circle_join_requests(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_join_requests_user ON public.circle_join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_user ON public.security_audit_events(user_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.buddy_match_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_discovery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_events ENABLE ROW LEVEL SECURITY;

-- BuddyMatch Preferences: User controls their own
CREATE POLICY "Users can read their own preferences" ON public.buddy_match_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.buddy_match_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.buddy_match_preferences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- BuddyMatch Discovery: Viewable by anyone if enabled, but minimal data
CREATE POLICY "Discovery preferences viewable if opted-in" ON public.buddy_match_preferences
  FOR SELECT USING (is_discovery_enabled = true);

-- Circle Discovery Settings: Circle admin manages, everyone reads if discoverable
CREATE POLICY "Circle admins manage discovery settings" ON public.circle_discovery_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.circles WHERE circles.id = circle_discovery_settings.circle_id AND circles.admin_id = auth.uid())
  );

CREATE POLICY "Anyone can read discoverable circles" ON public.circle_discovery_settings
  FOR SELECT USING (is_discoverable = true);

-- Circle Join Requests
CREATE POLICY "Users can see their own join requests" ON public.circle_join_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Circle admins see requests for their circles" ON public.circle_join_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.circles WHERE circles.id = circle_join_requests.circle_id AND circles.admin_id = auth.uid())
  );

CREATE POLICY "Users can create join requests" ON public.circle_join_requests
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    status = 'pending' AND
    -- Must have discovery enabled for themselves
    EXISTS (SELECT 1 FROM public.buddy_match_preferences WHERE user_id = auth.uid() AND is_discovery_enabled = true) AND
    -- Target circle must be discoverable
    EXISTS (SELECT 1 FROM public.circle_discovery_settings WHERE circle_id = circle_join_requests.circle_id AND is_discoverable = true) AND
    -- Must not already be a member
    NOT EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = circle_join_requests.circle_id AND user_id = auth.uid()) AND
    -- Capacity check (basic)
    EXISTS (
      SELECT 1 FROM public.circle_discovery_settings ds
      LEFT JOIN public.circle_members cm ON cm.circle_id = ds.circle_id
      WHERE ds.circle_id = circle_join_requests.circle_id
      GROUP BY ds.circle_id, ds.member_capacity
      HAVING COUNT(cm.id) < ds.member_capacity
    )
  );

-- SECURE JOIN REQUEST APPROVAL FUNCTION
CREATE OR REPLACE FUNCTION public.approve_circle_join_request(
  p_request_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_circle_id UUID;
  v_user_id UUID;
  v_admin_id UUID;
  v_capacity INTEGER;
  v_current_members INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Get request details and verify circle admin
  SELECT circle_id, user_id INTO v_circle_id, v_user_id
  FROM public.circle_join_requests
  WHERE id = p_request_id AND status = 'pending';

  IF v_circle_id IS NULL THEN
    RAISE EXCEPTION 'Request not found or not pending';
  END IF;

  SELECT admin_id INTO v_admin_id FROM public.circles WHERE id = v_circle_id;

  IF v_admin_id != auth.uid() THEN
    RAISE EXCEPTION 'Only circle admins can approve requests';
  END IF;

  -- Capacity check
  SELECT member_capacity INTO v_capacity FROM public.circle_discovery_settings WHERE circle_id = v_circle_id;
  SELECT COUNT(*) INTO v_current_members FROM public.circle_members WHERE circle_id = v_circle_id;

  IF v_current_members >= v_capacity THEN
    RAISE EXCEPTION 'Circle is at full capacity';
  END IF;

  -- Approve request
  UPDATE public.circle_join_requests
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = p_request_id;

  -- Add member
  INSERT INTO public.circle_members (circle_id, user_id, role)
  VALUES (v_circle_id, v_user_id, 'member')
  ON CONFLICT (circle_id, user_id) DO NOTHING;

  -- Audit log
  INSERT INTO public.security_audit_events (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), 'approve_join_request', 'circle_join_request', p_request_id::text, jsonb_build_object('circle_id', v_circle_id, 'member_id', v_user_id));

  RETURN TRUE;
END;
$$;

-- SECURITY AUDIT LOGGING
CREATE POLICY "Users can view their own audit trail" ON public.security_audit_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Circle admins can view audit trail for their circles" ON public.security_audit_events
  FOR SELECT USING (
    resource_type IN ('circle', 'ordering_session', 'circle_join_request') AND
    EXISTS (
      SELECT 1 FROM public.circles
      WHERE circles.id::text = resource_id AND circles.admin_id = auth.uid()
    )
  );

-- REALTIME REPLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.buddy_match_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_discovery_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_join_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_audit_events;
