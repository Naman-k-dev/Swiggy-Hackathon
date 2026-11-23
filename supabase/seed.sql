-- ==============================================================================
-- SWIGGY CAMPUS CIRCLES - SEED DATA
-- Fictional college community data for BITS Pilani / IIT Delhi campus prototype
-- ==============================================================================

-- 1. SEED PROFILES (4 Student Personas)
INSERT INTO public.profiles (id, full_name, email, avatar_url, college, academic_year, dietary_pref, preferred_budget)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Aarav Sharma', 'aarav.sharma@campus.edu', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'BITS Pilani - Hyderabad Campus', '3rd Year B.Tech CSE', 'BOTH', 250),
  ('a0000000-0000-0000-0000-000000000002', 'Ananya Iyer', 'ananya.iyer@campus.edu', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'BITS Pilani - Hyderabad Campus', '3rd Year B.Tech CSE', 'VEG', 180),
  ('a0000000-0000-0000-0000-000000000003', 'Rohan Mehta', 'rohan.mehta@campus.edu', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'BITS Pilani - Hyderabad Campus', '3rd Year B.Tech CSE', 'NON_VEG', 220),
  ('a0000000-0000-0000-0000-000000000004', 'Priya Nair', 'priya.nair@campus.edu', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'BITS Pilani - Hyderabad Campus', '2nd Year B.Tech ECE', 'VEG', 160)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED CIRCLE: "CSE Lunch Squad"
INSERT INTO public.circles (id, name, type, college, description, emoji, banner_gradient, invite_code, preferred_budget, admin_id)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'CSE Lunch Squad', 'Classmates', 'BITS Pilani - Hyderabad Campus', 'Daily lunch & post-lab food coordination for CSE Batch 2024. Save delivery charges & split seamlessly.', '🍱', 'from-orange-500 to-amber-500', 'CAMPUS24', 250, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED CIRCLE MEMBERS
INSERT INTO public.circle_members (circle_id, user_id, role)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'admin'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'member'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'member'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'member')
ON CONFLICT DO NOTHING;

-- 4. SEED AN ACTIVE ORDERING SESSION
INSERT INTO public.ordering_sessions (id, circle_id, created_by, restaurant_id, restaurant_name, restaurant_image, status, cutoff_time, delivery_location)
VALUES
  ('s0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'rest-rolls-bowls', 'Rolls & Bowls Co.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', 'open', timezone('utc'::text, now() + interval '30 minutes'), 'Hostel Block C - Ground Floor Reception')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED CART ITEMS
INSERT INTO public.cart_items (session_id, circle_id, user_id, user_name, user_avatar, item_id, item_name, item_price_paise, item_is_veg, quantity, customization)
VALUES
  ('s0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Aarav Sharma', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'dish-paneer-roll', 'Double Paneer Kathi Roll', 17900, true, 1, 'Extra mint chutney'),
  ('s0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Ananya Iyer', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'dish-mexican-bowl', 'Fiesta Veg Burrito Bowl', 19900, true, 1, 'No onions'),
  ('s0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Rohan Mehta', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'dish-chicken-roll', 'Butter Chicken Loaded Roll', 21900, false, 1, 'Spicy')
ON CONFLICT (id) DO NOTHING;
