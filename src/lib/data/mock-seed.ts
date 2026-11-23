import { Circle, CircleMember, OrderingSession, CartItem, StudentProfile, DemoOrder } from '@/types';

export const DEFAULT_CAMPUS_NAME =
  process.env.NEXT_PUBLIC_CAMPUS_NAME || 'PW Institute of Innovation Noida';

export const DEMO_PERSONAS: StudentProfile[] = [
  {
    id: 'student-demo-1',
    full_name: 'Campus Member',
    email: 'member@campus.edu',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    college: DEFAULT_CAMPUS_NAME,
    academic_year: '3rd Year B.Tech CSE',
    dietary_pref: 'BOTH',
    preferred_budget: 250,
  },
  {
    id: 'student-demo-2',
    full_name: 'Hostel Mate',
    email: 'mate@campus.edu',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    college: DEFAULT_CAMPUS_NAME,
    academic_year: '3rd Year B.Tech CSE',
    dietary_pref: 'VEG',
    preferred_budget: 180,
  },
];

export const INITIAL_CIRCLES: Circle[] = [
  {
    id: 'circle-cse-lunch-squad',
    name: 'CSE Lunch Squad',
    type: 'Classmates',
    college: DEFAULT_CAMPUS_NAME,
    description: 'Daily lunch & post-lab food coordination for CSE Batch 2024. Save delivery charges & split seamlessly.',
    emoji: '🍱',
    banner_gradient: 'from-orange-500 to-amber-500',
    invite_code: 'CAMPUS24',
    preferred_budget: 250,
    admin_id: 'student-demo-1',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    member_count: 4,
  },
  {
    id: 'circle-hostel-block-c',
    name: 'Hostel Block-C 3rd Floor',
    type: 'Hostel',
    college: DEFAULT_CAMPUS_NAME,
    description: 'Late night maggi, chai & midnight biryani runs for Room 301-320.',
    emoji: '🌙',
    banner_gradient: 'from-indigo-600 to-violet-600',
    invite_code: 'NIGHT300',
    preferred_budget: 180,
    admin_id: 'student-demo-3',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    member_count: 3,
  },
];

export const INITIAL_CIRCLE_MEMBERS: CircleMember[] = [
  {
    id: 'cm-1',
    circle_id: 'circle-cse-lunch-squad',
    user_id: 'student-demo-1',
    role: 'admin',
    joined_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'cm-2',
    circle_id: 'circle-cse-lunch-squad',
    user_id: 'student-demo-2',
    role: 'member',
    joined_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'cm-3',
    circle_id: 'circle-cse-lunch-squad',
    user_id: 'student-demo-3',
    role: 'member',
    joined_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'cm-4',
    circle_id: 'circle-cse-lunch-squad',
    user_id: 'student-demo-4',
    role: 'member',
    joined_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'cm-5',
    circle_id: 'circle-hostel-block-c',
    user_id: 'student-demo-3',
    role: 'admin',
    joined_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'cm-6',
    circle_id: 'circle-hostel-block-c',
    user_id: 'student-demo-1',
    role: 'member',
    joined_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 'cm-7',
    circle_id: 'circle-hostel-block-c',
    user_id: 'student-demo-2',
    role: 'member',
    joined_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

export const INITIAL_SESSIONS: OrderingSession[] = [
  {
    id: 'sess-cse-active',
    circle_id: 'circle-cse-lunch-squad',
    created_by: 'student-demo-1',
    restaurant_id: 'rest-rolls-bowls',
    restaurant_name: 'Rolls & Bowls Co.',
    restaurant_image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    status: 'open',
    cutoff_time: new Date(Date.now() + 45 * 60000).toISOString(),
    delivery_location: 'Hostel Block C - Ground Floor Reception',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
];

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 'cart-1',
    session_id: 'sess-cse-active',
    circle_id: 'circle-cse-lunch-squad',
    user_id: 'student-demo-1',
    user_name: 'Circle Admin',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    item_id: 'dish-paneer-roll',
    item_name: 'Double Paneer Kathi Roll',
    item_price_paise: 17900,
    item_is_veg: true,
    quantity: 1,
    customization: 'Extra mint dip',
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'cart-2',
    session_id: 'sess-cse-active',
    circle_id: 'circle-cse-lunch-squad',
    user_id: 'student-demo-2',
    user_name: 'Campus Peer',
    user_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    item_id: 'dish-mexican-bowl',
    item_name: 'Fiesta Veg Burrito Bowl',
    item_price_paise: 19900,
    item_is_veg: true,
    quantity: 1,
    customization: 'No raw onion',
    created_at: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: 'cart-3',
    session_id: 'sess-cse-active',
    circle_id: 'circle-cse-lunch-squad',
    user_id: 'student-demo-3',
    user_name: 'Hostel Roommate',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    item_id: 'dish-chicken-roll',
    item_name: 'Butter Chicken Loaded Roll',
    item_price_paise: 21900,
    item_is_veg: false,
    quantity: 1,
    customization: 'Extra spicy',
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
];

export const INITIAL_DEMO_ORDERS: DemoOrder[] = [
  {
    id: 'order-demo-1',
    order_code: 'SW-CAMPUS-7821',
    circle_id: 'circle-cse-lunch-squad',
    circle_name: 'CSE Lunch Squad',
    session_id: 'sess-cse-past',
    placed_by_id: 'student-demo-1',
    placed_by_name: 'Circle Admin',
    restaurant_name: 'Biryani Central',
    restaurant_id: 'rest-biryani-central',
    subtotal_paise: 64700, // ₹647
    delivery_fee_paise: 0, // Waived on circle order!
    platform_fee_paise: 500, // ₹5
    discount_paise: 5000, // ₹50 circle discount
    total_paise: 60200, // ₹602
    total_items_count: 3,
    status: 'delivered',
    delivery_location: 'Hostel Block C - Gate 2',
    delivery_instructions: 'Call when arrived at pickup point',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    member_breakdowns: [
      {
        user_id: 'student-demo-1',
        user_name: 'Circle Admin',
        user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        items_count: 1,
        subtotal_paise: 23900,
        share_paise: 22200,
        items: [],
      },
      {
        user_id: 'student-demo-2',
        user_name: 'Campus Peer',
        user_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        items_count: 1,
        subtotal_paise: 21900,
        share_paise: 20400,
        items: [],
      },
      {
        user_id: 'student-demo-3',
        user_name: 'Hostel Roommate',
        user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        items_count: 1,
        subtotal_paise: 18900,
        share_paise: 17600,
        items: [],
      },
    ],
  },
];

import { RecurringMealWindow, CircleVoteSession } from '@/types';

export const INITIAL_MEAL_WINDOWS: RecurringMealWindow[] = [];
export const INITIAL_VOTE_SESSIONS: CircleVoteSession[] = [];
