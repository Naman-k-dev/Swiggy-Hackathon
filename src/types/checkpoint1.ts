export interface PickupPassItem {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  item_name: string;
  quantity: number;
  is_collected: boolean;
  collected_at?: string;
}

export interface PickupPass {
  id: string;
  order_id: string;
  circle_id: string;
  session_identifier: string; // opaque time-limited identifier
  collection_code: string; // short collection code e.g. "SW-9281"
  delivery_location: string;
  organizer_id: string;
  items: PickupPassItem[];
  total_meals_count: number;
  collected_meals_count: number;
  created_at: string;
}

export type SettlementStatus = 'pending' | 'sent' | 'confirmed';

export interface SettlementRecord {
  id: string;
  order_id: string;
  circle_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  share_paise: number;
  status: SettlementStatus;
  sent_at?: string;
  confirmed_at?: string;
  confirmed_by?: string;
  audit_history: {
    status: SettlementStatus;
    changed_by: string;
    timestamp: string;
  }[];
}
