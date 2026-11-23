export type DietaryPref = 'VEG' | 'NON_VEG' | 'BOTH';
export type CircleType = 'Classmates' | 'Hostel' | 'Friends' | 'Club' | 'Other';
export type MemberRole = 'admin' | 'member';
export type SessionStatus = 'open' | 'locked' | 'finalized' | 'cancelled';
export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';

export * from './circlematch';

export interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  college: string;
  academic_year: string;
  dietary_pref: DietaryPref;
  preferred_budget: number; // in Rupees
  created_at?: string;
  updated_at?: string;
}

export interface Circle {
  id: string;
  name: string;
  type: CircleType;
  college: string;
  description: string;
  emoji: string;
  banner_gradient: string;
  invite_code: string;
  preferred_budget: number; // in Rupees
  admin_id: string;
  created_at: string;
  updated_at?: string;
  member_count?: number;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  profile?: StudentProfile;
}

export interface OrderingSession {
  id: string;
  circle_id: string;
  created_by: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_image?: string;
  status: SessionStatus;
  cutoff_time?: string;
  delivery_location: string;
  pickup_note?: string;
  ready_member_ids?: string[];
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  session_id: string;
  circle_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  item_id: string;
  item_name: string;
  item_price_paise: number; // Integer paise (e.g. 18000 for ₹180)
  item_is_veg: boolean;
  quantity: number;
  customization?: string;
  created_at: string;
  updated_at?: string;
}

export interface MemberBreakdown {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  items_count: number;
  subtotal_paise: number;
  share_paise: number;
  items: CartItem[];
}

export interface DemoOrderItem {
  id: string;
  order_id: string;
  user_id: string;
  user_name: string;
  item_name: string;
  item_price_paise: number;
  quantity: number;
  total_paise: number;
  is_veg: boolean;
}

export interface DemoOrder {
  id: string;
  order_code: string;
  circle_id: string;
  circle_name: string;
  session_id?: string;
  placed_by_id: string;
  placed_by_name: string;
  restaurant_name: string;
  restaurant_id: string;
  subtotal_paise: number;
  delivery_fee_paise: number;
  platform_fee_paise: number;
  discount_paise: number;
  total_paise: number;
  total_items_count: number;
  status: OrderStatus;
  delivery_location: string;
  delivery_instructions?: string;
  member_breakdowns: MemberBreakdown[];
  items?: DemoOrderItem[];
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price_paise: number; // Integer paise
  is_veg: boolean;
  is_bestseller?: boolean;
  is_student_pick?: boolean;
  image?: string;
  tags?: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  image: string;
  cuisine: string[];
  rating: number;
  rating_count: string;
  delivery_time_min: number;
  price_for_one: number; // in Rupees
  is_pure_veg: boolean;
  offer?: string;
  menu_categories: MenuCategory[];
}
