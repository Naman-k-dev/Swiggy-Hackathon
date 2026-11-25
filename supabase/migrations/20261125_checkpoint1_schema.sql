-- ==============================================================================
-- SWIGGY CAMPUS CIRCLES - CHECKPOINT 1 SCHEMA EXTENSION
-- Campus Pickup Pass & CirclePay Settlement Tracker
-- ==============================================================================

-- 1. PICKUP PASSES
CREATE TABLE IF NOT EXISTS public.pickup_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.demo_orders(id) ON DELETE CASCADE,
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.ordering_sessions(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL,
  pickup_code TEXT UNIQUE NOT NULL, -- Opaque short code for QR (e.g. "PKP-ABC123")
  pickup_code_expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'expired')) DEFAULT 'active',
  total_meals INTEGER NOT NULL DEFAULT 0,
  collected_meals INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. PICKUP CONFIRMATIONS (Per-meal collection tracking)
CREATE TABLE IF NOT EXISTS public.pickup_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_pass_id UUID NOT NULL REFERENCES public.pickup_passes(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.demo_order_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Student who ordered the meal
  user_name TEXT NOT NULL,
  dish_name TEXT NOT NULL,
  dish_quantity INTEGER NOT NULL DEFAULT 1,
  dish_is_veg BOOLEAN NOT NULL DEFAULT true,
  collected BOOLEAN NOT NULL DEFAULT false,
  collected_by UUID, -- Organizer who marked as collected
  collected_at TIMESTAMPTZ,
  qr_token TEXT UNIQUE NOT NULL, -- Opaque token for student's QR
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_pass_item UNIQUE (pickup_pass_id, order_item_id)
);

-- 3. SETTLEMENT RECORDS (CirclePay Tracker)
CREATE TABLE IF NOT EXISTS public.settlement_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.demo_orders(id) ON DELETE CASCADE,
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  item_subtotal_paise INTEGER NOT NULL,
  fee_share_paise INTEGER NOT NULL DEFAULT 0,
  total_contribution_paise INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'marked_sent', 'confirmed', 'disputed')) DEFAULT 'pending',
  marked_sent_at TIMESTAMPTZ,
  confirmed_by UUID,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_order_user UNIQUE (order_id, user_id)
);

-- 4. SETTLEMENT EVENTS (Audit history)
CREATE TABLE IF NOT EXISTS public.settlement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_record_id UUID NOT NULL REFERENCES public.settlement_records(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('marked_sent', 'confirmed', 'unconfirmed', 'disputed', 'resolved')),
  previous_status TEXT,
  new_status TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_pickup_passes_order ON public.pickup_passes(order_id);
CREATE INDEX IF NOT EXISTS idx_pickup_passes_circle ON public.pickup_passes(circle_id);
CREATE INDEX IF NOT EXISTS idx_pickup_passes_code ON public.pickup_passes(pickup_code);
CREATE INDEX IF NOT EXISTS idx_pickup_confirmations_pass ON public.pickup_confirmations(pickup_pass_id);
CREATE INDEX IF NOT EXISTS idx_pickup_confirmations_user ON public.pickup_confirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_pickup_confirmations_token ON public.pickup_confirmations(qr_token);
CREATE INDEX IF NOT EXISTS idx_settlement_records_order ON public.settlement_records(order_id);
CREATE INDEX IF NOT EXISTS idx_settlement_records_user ON public.settlement_records(user_id);
CREATE INDEX IF NOT EXISTS idx_settlement_events_record ON public.settlement_events(settlement_record_id);

-- ROW LEVEL SECURITY
ALTER TABLE public.pickup_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_events ENABLE ROW LEVEL SECURITY;

-- PICKUP PASSES POLICIES
-- Viewable by circle members and organizer
CREATE POLICY "Pickup passes viewable by circle members" ON public.pickup_passes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_members.circle_id = pickup_passes.circle_id
        AND circle_members.user_id = auth.uid()
    ) OR organizer_id = auth.uid()
  );

-- Only organizer can create
CREATE POLICY "Organizer creates pickup pass" ON public.pickup_passes
  FOR INSERT WITH CHECK (
    auth.uid() = organizer_id AND
    EXISTS (
      SELECT 1 FROM public.circles
      WHERE circles.id = pickup_passes.circle_id AND circles.admin_id = auth.uid()
    )
  );

-- Only organizer can update (mark collected, complete)
CREATE POLICY "Organizer updates pickup pass" ON public.pickup_passes
  FOR UPDATE USING (
    auth.uid() = organizer_id
  )
  WITH CHECK (
    auth.uid() = organizer_id
  );

-- PICKUP CONFIRMATIONS POLICIES
-- Viewable by circle members, the affected user, and organizer
CREATE POLICY "Pickup confirmations viewable by circle" ON public.pickup_confirmations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pickup_passes pp
      JOIN public.circle_members cm ON cm.circle_id = pp.circle_id
      WHERE pp.id = pickup_confirmations.pickup_pass_id
        AND cm.user_id = auth.uid()
    ) OR user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.pickup_passes pp WHERE pp.id = pickup_confirmations.pickup_pass_id AND pp.organizer_id = auth.uid()
    )
  );

-- Organizer can update collection status (mark collected)
CREATE POLICY "Organizer marks meals collected" ON public.pickup_confirmations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.pickup_passes pp
      WHERE pp.id = pickup_confirmations.pickup_pass_id
        AND pp.organizer_id = auth.uid()
        AND pp.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pickup_passes pp
      WHERE pp.id = pickup_confirmations.pickup_pass_id
        AND pp.organizer_id = auth.uid()
    )
  );

-- SETTLEMENT RECORDS POLICIES
-- Viewable by circle members and the user
CREATE POLICY "Settlement records viewable by circle members" ON public.settlement_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_members.circle_id = settlement_records.circle_id
        AND circle_members.user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

-- Users can insert their own settlement record on order finalization (handled by app)
-- Actually, settlement records are created automatically when order is finalized
-- Users can only mark their own as sent
CREATE POLICY "Users mark own settlement sent" ON public.settlement_records
  FOR UPDATE USING (
    auth.uid() = user_id AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id AND status IN ('marked_sent', 'pending')
  );

-- Organizer can confirm received
CREATE POLICY "Organizer confirms settlement received" ON public.settlement_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.circles
      WHERE circles.id = settlement_records.circle_id
        AND circles.admin_id = auth.uid()
    ) AND status = 'marked_sent'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.circles
      WHERE circles.id = settlement_records.circle_id
        AND circles.admin_id = auth.uid()
    ) AND status = 'confirmed'
  );

-- SETTLEMENT EVENTS POLICIES
CREATE POLICY "Settlement events viewable by circle" ON public.settlement_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.settlement_records sr
      JOIN public.circle_members cm ON cm.circle_id = sr.circle_id
      WHERE sr.id = settlement_events.settlement_record_id
        AND cm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.settlement_records sr
      WHERE sr.id = settlement_events.settlement_record_id
        AND sr.user_id = auth.uid()
    )
  );

-- App inserts events
CREATE POLICY "App inserts settlement events" ON public.settlement_events
  FOR INSERT WITH CHECK (true);

-- REALTIME REPLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.pickup_passes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pickup_confirmations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settlement_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settlement_events;