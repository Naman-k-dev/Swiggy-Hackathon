export type OrderRescueScenario =
  | 'dish_unavailable'
  | 'budget_exceeded'
  | 'dietary_conflict'
  | 'member_selection_change';

export interface OrderRescueAlternative {
  dish_id: string;
  dish_name: string;
  price_paise: number;
  is_veg: boolean;
  match_score: number; // 0 to 100
  reason: string;
  price_diff_paise: number; // relative to original dish (can be negative if cheaper)
  remaining_budget_paise: number;
  tags?: string[];
  image?: string;
}

export interface OrderRescueIssue {
  id: string;
  session_id: string;
  circle_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  scenario: OrderRescueScenario;
  original_dish_id: string;
  original_dish_name: string;
  original_price_paise: number;
  reason: string;
  suggested_alternatives: OrderRescueAlternative[];
  created_at: string;
  is_demo?: boolean;
}

export type OrderRescueStatus = 'detected' | 'resolved' | 'dismissed';

export interface OrderRescueEvent {
  id: string;
  issue: OrderRescueIssue;
  status: OrderRescueStatus;
  selected_replacement_id?: string;
  resolved_at?: string;
}
