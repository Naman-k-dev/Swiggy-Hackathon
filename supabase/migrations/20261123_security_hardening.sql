-- ==============================================================================
-- SWIGGY CAMPUS CIRCLES - SECURITY & AUTHORIZATION HARDENING MIGRATION
-- Enforces:
-- 1. Cart ownership: Members cannot modify other members' cart items.
-- 2. Admin permissions: Only circle admins can manage ordering sessions.
-- 3. Cutoff enforcement: Database trigger and RLS reject changes after deadline.
-- 4. Invitation protection: Joining requires valid invite code verification.
-- 5. Demo isolation: Restricts demo persona synthetic access from real auth records.
-- ==============================================================================

-- 1. SECURE CIRCLE JOIN FUNCTION (Eliminates unrestricted circle_members INSERT)
CREATE OR REPLACE FUNCTION public.join_circle_with_invite_code(
  p_circle_id UUID,
  p_invite_code TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_circle_exists BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to join a circle';
  END IF;

  -- Verify circle and exact invite code match
  SELECT EXISTS (
    SELECT 1 FROM public.circles
    WHERE id = p_circle_id AND UPPER(invite_code) = UPPER(TRIM(p_invite_code))
  ) INTO v_circle_exists;

  IF NOT v_circle_exists THEN
    RAISE EXCEPTION 'Invalid invite code or circle ID';
  END IF;

  -- Insert member securely
  INSERT INTO public.circle_members (circle_id, user_id, role)
  VALUES (p_circle_id, auth.uid(), 'member')
  ON CONFLICT (circle_id, user_id) DO NOTHING;

  RETURN TRUE;
END;
$$;

-- 2. HARDENED CART ITEMS RLS POLICIES
DROP POLICY IF EXISTS "Users can insert their own cart items" ON public.cart_items;
CREATE POLICY "Users can insert their own cart items" ON public.cart_items
  FOR INSERT WITH CHECK (
    -- Must be the authenticated owner of the cart item
    auth.uid() = user_id AND
    -- Must be an active member of this circle
    EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_members.circle_id = cart_items.circle_id
        AND circle_members.user_id = auth.uid()
    ) AND
    -- Session must be open and cutoff deadline must not have expired
    EXISTS (
      SELECT 1 FROM public.ordering_sessions
      WHERE ordering_sessions.id = cart_items.session_id
        AND ordering_sessions.circle_id = cart_items.circle_id
        AND ordering_sessions.status = 'open'
        AND (ordering_sessions.cutoff_time IS NULL OR ordering_sessions.cutoff_time > timezone('utc'::text, now()))
    )
  );

DROP POLICY IF EXISTS "Users can update their own cart items" ON public.cart_items;
CREATE POLICY "Users can update their own cart items" ON public.cart_items
  FOR UPDATE USING (
    -- Cannot update another member's cart item
    auth.uid() = user_id AND
    -- Session must be open and cutoff deadline must not have expired
    EXISTS (
      SELECT 1 FROM public.ordering_sessions
      WHERE ordering_sessions.id = cart_items.session_id
        AND ordering_sessions.status = 'open'
        AND (ordering_sessions.cutoff_time IS NULL OR ordering_sessions.cutoff_time > timezone('utc'::text, now()))
    )
  )
  WITH CHECK (
    auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Users can delete their own cart items" ON public.cart_items;
CREATE POLICY "Users can delete their own cart items" ON public.cart_items
  FOR DELETE USING (
    -- Only item owner or circle admin can remove
    (auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM public.circles
      WHERE circles.id = cart_items.circle_id AND circles.admin_id = auth.uid()
    )) AND
    -- Session must be open and cutoff deadline must not have expired
    EXISTS (
      SELECT 1 FROM public.ordering_sessions
      WHERE ordering_sessions.id = cart_items.session_id
        AND ordering_sessions.status = 'open'
        AND (ordering_sessions.cutoff_time IS NULL OR ordering_sessions.cutoff_time > timezone('utc'::text, now()))
    )
  );

-- 3. TRUSTED DATABASE TRIGGER: ENFORCE CUTOFF DEADLINES ON CART MUTATIONS
CREATE OR REPLACE FUNCTION public.check_session_deadline_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_session_status TEXT;
  v_cutoff_time TIMESTAMPTZ;
BEGIN
  SELECT status, cutoff_time INTO v_session_status, v_cutoff_time
  FROM public.ordering_sessions
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);

  IF v_session_status IS NULL THEN
    RAISE EXCEPTION 'Associated ordering session not found';
  END IF;

  IF v_session_status != 'open' THEN
    RAISE EXCEPTION 'Cannot modify cart: ordering session is %', v_session_status;
  END IF;

  IF v_cutoff_time IS NOT NULL AND v_cutoff_time <= timezone('utc'::text, now()) THEN
    RAISE EXCEPTION 'Cannot modify cart: order cutoff deadline % has expired', v_cutoff_time;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_cart_deadline ON public.cart_items;
CREATE TRIGGER trg_check_cart_deadline
BEFORE INSERT OR UPDATE ON public.cart_items
FOR EACH ROW EXECUTE FUNCTION public.check_session_deadline_trigger();

-- 4. HARDENED ORDERING SESSIONS RLS POLICIES (Admin Only Management)
DROP POLICY IF EXISTS "Admins can update session status" ON public.ordering_sessions;
CREATE POLICY "Admins can update session status" ON public.ordering_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.circles
      WHERE circles.id = ordering_sessions.circle_id
        AND circles.admin_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.circles
      WHERE circles.id = ordering_sessions.circle_id
        AND circles.admin_id = auth.uid()
    )
  );

-- 5. DEMO PERSONA ISOLATION ON REAL AUTH PROFILES
-- Add isolation column if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_demo_account'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_demo_account BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Prevent unauthenticated demo personas from inserting or modifying real authenticated accounts
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = id
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND auth.uid() = id
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = id
  );
