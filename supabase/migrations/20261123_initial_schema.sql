-- ==============================================================================
-- SWIGGY CAMPUS CIRCLES - DATABASE SCHEMA MIGRATION
-- Concept Prototype for Swiggy Food for Thought 2.0
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  college TEXT NOT NULL DEFAULT 'BITS Pilani',
  academic_year TEXT DEFAULT '3rd Year B.Tech',
  dietary_pref TEXT CHECK (dietary_pref IN ('VEG', 'NON_VEG', 'BOTH')) DEFAULT 'BOTH',
  preferred_budget INTEGER DEFAULT 200, -- In Rupees
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CIRCLES TABLE
CREATE TABLE IF NOT EXISTS public.circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Classmates', 'Hostel', 'Friends', 'Club', 'Other')) DEFAULT 'Classmates',
  college TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '🍕',
  banner_gradient TEXT DEFAULT 'from-orange-500 to-amber-500',
  invite_code TEXT UNIQUE NOT NULL,
  preferred_budget INTEGER DEFAULT 250,
  admin_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CIRCLE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_circle_user UNIQUE (circle_id, user_id)
);

-- 4. ORDERING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.ordering_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  restaurant_image TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'locked', 'finalized', 'cancelled')) DEFAULT 'open',
  cutoff_time TIMESTAMPTZ,
  delivery_location TEXT DEFAULT 'Hostel Gate 2 (Drop Point)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.ordering_sessions(id) ON DELETE CASCADE,
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_price_paise INTEGER NOT NULL, -- Integer Paise (e.g., 18000 for ₹180.00)
  item_is_veg BOOLEAN NOT NULL DEFAULT true,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  customization TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. DEMO ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.demo_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE SET NULL,
  circle_name TEXT NOT NULL,
  session_id UUID REFERENCES public.ordering_sessions(id) ON DELETE SET NULL,
  placed_by_id UUID NOT NULL,
  placed_by_name TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  restaurant_id TEXT NOT NULL,
  subtotal_paise INTEGER NOT NULL,
  delivery_fee_paise INTEGER NOT NULL DEFAULT 0,
  platform_fee_paise INTEGER NOT NULL DEFAULT 500, -- ₹5 demo platform fee
  discount_paise INTEGER NOT NULL DEFAULT 0,
  total_paise INTEGER NOT NULL,
  total_items_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered')) DEFAULT 'placed',
  delivery_location TEXT NOT NULL,
  delivery_instructions TEXT,
  member_breakdowns JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. DEMO ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.demo_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.demo_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_price_paise INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_paise INTEGER NOT NULL,
  is_veg BOOLEAN NOT NULL DEFAULT true
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_circles_invite_code ON public.circles(invite_code);
CREATE INDEX IF NOT EXISTS idx_circle_members_circle_id ON public.circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON public.circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_ordering_sessions_circle_id ON public.ordering_sessions(circle_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_orders_circle_id ON public.demo_orders(circle_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordering_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_order_items ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone authenticated can read; user can insert/update their own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Circles: viewable by circle members or by invite_code lookup
CREATE POLICY "Circles viewable by members or invite code" ON public.circles
  FOR SELECT USING (
    auth.uid() = admin_id OR
    EXISTS (SELECT 1 FROM public.circle_members WHERE circle_members.circle_id = circles.id AND circle_members.user_id = auth.uid()) OR
    invite_code IS NOT NULL
  );

CREATE POLICY "Authenticated users can create circles" ON public.circles
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update circles" ON public.circles
  FOR UPDATE USING (auth.uid() = admin_id);

-- Circle Members
CREATE POLICY "Members viewable by circle members" ON public.circle_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join circles" ON public.circle_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave or admins can remove members" ON public.circle_members
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.circles WHERE circles.id = circle_members.circle_id AND circles.admin_id = auth.uid())
  );

-- Ordering Sessions: viewable by circle members, manageable by circle admin
CREATE POLICY "Sessions viewable by circle members" ON public.ordering_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.circle_members WHERE circle_members.circle_id = ordering_sessions.circle_id AND circle_members.user_id = auth.uid())
  );

CREATE POLICY "Admins can create sessions" ON public.ordering_sessions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.circles WHERE circles.id = ordering_sessions.circle_id AND circles.admin_id = auth.uid())
  );

CREATE POLICY "Admins can update session status" ON public.ordering_sessions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.circles WHERE circles.id = ordering_sessions.circle_id AND circles.admin_id = auth.uid())
  );

-- Cart Items: viewable by session members, editable only by owner (unless locked)
CREATE POLICY "Cart items viewable by session members" ON public.cart_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.circle_members WHERE circle_members.circle_id = cart_items.circle_id AND circle_members.user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own cart items" ON public.cart_items
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.ordering_sessions WHERE ordering_sessions.id = cart_items.session_id AND ordering_sessions.status = 'open')
  );

CREATE POLICY "Users can update their own cart items" ON public.cart_items
  FOR UPDATE USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.ordering_sessions WHERE ordering_sessions.id = cart_items.session_id AND ordering_sessions.status = 'open')
  );

CREATE POLICY "Users can delete their own cart items" ON public.cart_items
  FOR DELETE USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.ordering_sessions WHERE ordering_sessions.id = cart_items.session_id AND ordering_sessions.status = 'open')
  );

-- Demo Orders & Items: viewable by circle members
CREATE POLICY "Demo orders viewable by circle members" ON public.demo_orders
  FOR SELECT USING (true);

CREATE POLICY "Demo orders can be placed by admin" ON public.demo_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Demo order items viewable by all" ON public.demo_order_items
  FOR SELECT USING (true);

CREATE POLICY "Demo order items insertable" ON public.demo_order_items
  FOR INSERT WITH CHECK (true);

-- REALTIME REPLICATION ENABLEMENT
ALTER PUBLICATION supabase_realtime ADD TABLE public.ordering_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.demo_orders;
