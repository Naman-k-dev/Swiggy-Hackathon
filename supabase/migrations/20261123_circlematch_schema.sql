-- ==============================================================================
-- SWIGGY CAMPUS CIRCLES - CIRCLEMATCH AI DATABASE EXTENSION
-- Schema Migration for Intelligent Group Meal Matching
-- ==============================================================================

-- 1. MEMBER MEAL PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.member_meal_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  budget_paise INTEGER NOT NULL DEFAULT 20000, -- Integer paise (e.g. ₹200.00)
  dietary_pref TEXT NOT NULL CHECK (dietary_pref IN ('VEG', 'NON_VEG', 'BOTH')) DEFAULT 'BOTH',
  cravings TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  hunger_level TEXT NOT NULL CHECK (hunger_level IN ('light', 'regular', 'hungry')) DEFAULT 'regular',
  exclusions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_ready BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_circle_member_pref UNIQUE (circle_id, user_id)
);

-- 2. CIRCLE MATCH SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.circle_match_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('preferences', 'matching', 'results', 'applied')) DEFAULT 'preferences',
  selected_plan_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CIRCLE MATCH RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS public.circle_match_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.circle_match_sessions(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('best_overall', 'budget_friendly', 'crowd_pleaser')),
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  group_satisfaction_score INTEGER NOT NULL CHECK (group_satisfaction_score BETWEEN 0 AND 100),
  subtotal_paise INTEGER NOT NULL,
  ai_explanation TEXT NOT NULL,
  member_plans_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CIRCLE MATCH ACCEPTANCES TABLE
CREATE TABLE IF NOT EXISTS public.circle_match_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.circle_match_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  plan_type TEXT NOT NULL,
  dish_id TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_session_user_accept UNIQUE (session_id, user_id)
);

-- 5. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.circlematch_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  circle_id UUID NOT NULL,
  session_id UUID,
  user_id UUID,
  properties JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_member_pref_circle ON public.member_meal_preferences(circle_id);
CREATE INDEX IF NOT EXISTS idx_match_sessions_circle ON public.circle_match_sessions(circle_id);
CREATE INDEX IF NOT EXISTS idx_match_recs_session ON public.circle_match_recommendations(session_id);
CREATE INDEX IF NOT EXISTS idx_match_accept_session ON public.circle_match_acceptances(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_circle ON public.circlematch_analytics_events(circle_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.member_meal_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_match_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_match_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_match_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circlematch_analytics_events ENABLE ROW LEVEL SECURITY;

-- Preferences: circle members can view all circle preferences; users can insert/update only their own
CREATE POLICY "Circle members view preferences" ON public.member_meal_preferences
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.circle_members WHERE circle_members.circle_id = member_meal_preferences.circle_id AND circle_members.user_id = auth.uid())
  );

CREATE POLICY "Users manage own meal preferences" ON public.member_meal_preferences
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Match sessions: circle members can read and create sessions
CREATE POLICY "Circle members view sessions" ON public.circle_match_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.circle_members WHERE circle_members.circle_id = circle_match_sessions.circle_id AND circle_members.user_id = auth.uid())
  );

CREATE POLICY "Circle members create sessions" ON public.circle_match_sessions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.circle_members WHERE circle_members.circle_id = circle_match_sessions.circle_id AND circle_members.user_id = auth.uid())
  );

CREATE POLICY "Circle members update sessions" ON public.circle_match_sessions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.circle_members WHERE circle_members.circle_id = circle_match_sessions.circle_id AND circle_members.user_id = auth.uid())
  );

-- Recommendations: readable by session circle members
CREATE POLICY "View match recommendations" ON public.circle_match_recommendations
  FOR SELECT USING (true);

CREATE POLICY "Insert match recommendations" ON public.circle_match_recommendations
  FOR INSERT WITH CHECK (true);

-- Acceptances: users can accept their own recommendations
CREATE POLICY "View match acceptances" ON public.circle_match_acceptances
  FOR SELECT USING (true);

CREATE POLICY "Users insert own acceptance" ON public.circle_match_acceptances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics events: insertable by authenticated users, viewable by circle members
CREATE POLICY "Insert analytics events" ON public.circlematch_analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "View analytics events" ON public.circlematch_analytics_events
  FOR SELECT USING (true);

-- REALTIME REPLICATION ENABLEMENT
ALTER PUBLICATION supabase_realtime ADD TABLE public.member_meal_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_match_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_match_acceptances;
