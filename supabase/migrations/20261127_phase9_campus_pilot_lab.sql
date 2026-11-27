-- ==============================================================================
-- SWIGGY CAMPUS CIRCLES: Phase 9 Migration
-- Campus Pilot Lab Research Schema, Survey Telemetry & Participant Privacy RLS
-- Campus: PW Institute of Innovation Noida
-- ==============================================================================

-- 1. Pilot Participants & Research Consent Table
CREATE TABLE IF NOT EXISTS public.pilot_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT,
    consent_given BOOLEAN NOT NULL DEFAULT true,
    study_cohort TEXT NOT NULL DEFAULT 'PW IOI Noida - Batch 2026',
    consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    withdrawn_at TIMESTAMPTZ,
    CONSTRAINT uq_pilot_participant UNIQUE (user_id)
);

-- 2. Student Feedback Research Survey Responses
CREATE TABLE IF NOT EXISTS public.pilot_survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ordering_frequency TEXT NOT NULL,
    friends_ordering_frequency TEXT NOT NULL,
    coordination_problems TEXT[] DEFAULT '{}',
    typical_budget_range TEXT NOT NULL,
    time_spent_choosing_mins TEXT NOT NULL,
    splitting_difficulty INT NOT NULL CHECK (splitting_difficulty BETWEEN 1 AND 5),
    delivery_coordination_difficulty INT NOT NULL CHECK (delivery_coordination_difficulty BETWEEN 1 AND 5),
    willingness_to_reuse INT NOT NULL CHECK (willingness_to_reuse BETWEEN 1 AND 5),
    most_useful_feature TEXT NOT NULL,
    least_useful_feature TEXT NOT NULL,
    written_suggestions TEXT,
    is_simulated_demo BOOLEAN NOT NULL DEFAULT false,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Post-Order In-App Session Feedback
CREATE TABLE IF NOT EXISTS public.pilot_session_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL,
    circle_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    was_flow_easy BOOLEAN NOT NULL DEFAULT true,
    satisfaction_score INT NOT NULL CHECK (satisfaction_score BETWEEN 1 AND 5),
    confusing_step TEXT,
    would_use_again BOOLEAN NOT NULL DEFAULT true,
    improvement_suggestions TEXT,
    is_simulated_demo BOOLEAN NOT NULL DEFAULT false,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Ordering Experiment Runs (WhatsApp Baseline vs Campus Circles)
CREATE TABLE IF NOT EXISTS public.pilot_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_type TEXT NOT NULL CHECK (experiment_type IN ('whatsapp_baseline', 'campus_circles')),
    group_name TEXT NOT NULL,
    participant_count INT NOT NULL DEFAULT 4,
    restaurant_choice_duration_sec INT NOT NULL,
    food_selection_duration_sec INT NOT NULL,
    coordination_issues_count INT NOT NULL DEFAULT 0,
    completed_draft_order BOOLEAN NOT NULL DEFAULT true,
    satisfaction_rating INT NOT NULL CHECK (satisfaction_rating BETWEEN 1 AND 5),
    notes TEXT,
    recorded_by TEXT NOT NULL DEFAULT 'automatic_telemetry',
    is_simulated_demo BOOLEAN NOT NULL DEFAULT false,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.pilot_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_experiments ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view and update their own consent record
CREATE POLICY "pilot_participants_owner_select"
    ON public.pilot_participants FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "pilot_participants_owner_insert"
    ON public.pilot_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pilot_participants_owner_update"
    ON public.pilot_participants FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Students can insert their own survey responses
CREATE POLICY "pilot_survey_owner_insert"
    ON public.pilot_survey_responses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Students can read only their own survey response
CREATE POLICY "pilot_survey_owner_select"
    ON public.pilot_survey_responses FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: In-app session feedback owner access
CREATE POLICY "pilot_feedback_owner_insert"
    ON public.pilot_session_feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pilot_feedback_owner_select"
    ON public.pilot_session_feedback FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Experiments viewable by authenticated users for transparency
CREATE POLICY "pilot_experiments_auth_select"
    ON public.pilot_experiments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "pilot_experiments_auth_insert"
    ON public.pilot_experiments FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ==============================================================================
-- SECURITY DEFINER ATOMIC CONSENT WITHDRAWAL FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.withdraw_pilot_consent(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verify caller matches target or has service role
    IF auth.uid() <> target_user_id THEN
        RAISE EXCEPTION 'Unauthorized consent withdrawal attempt.';
    END IF;

    -- Update consent status
    UPDATE public.pilot_participants
    SET consent_given = false,
        withdrawn_at = now()
    WHERE user_id = target_user_id;

    -- Delete associated survey responses to protect participant privacy
    DELETE FROM public.pilot_survey_responses
    WHERE user_id = target_user_id;

    -- Anonymize session feedback
    DELETE FROM public.pilot_session_feedback
    WHERE user_id = target_user_id;

    RETURN true;
END;
$$;
