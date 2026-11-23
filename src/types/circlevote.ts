export type VoteOptionSource = 'circlematch_ai' | 'campus_catalog' | 'swiggy_mcp_verified';

export interface CircleVoteOption {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_image: string;
  cuisine: string[];
  price_range_text: string;
  group_compatibility_score: number; // 0 to 100
  estimated_group_subtotal_paise: number;
  dietary_summary: string;
  budget_summary: string;
  source: VoteOptionSource;
  vote_count: number;
  voter_user_ids: string[];
}

export interface CircleVote {
  id: string;
  session_id: string;
  option_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  voted_at: string;
}

export type CircleVoteSessionStatus = 'active' | 'completed' | 'cancelled';

export interface CircleVoteSession {
  id: string;
  circle_id: string;
  meal_session_id?: string;
  created_by: string;
  title: string;
  status: CircleVoteSessionStatus;
  cutoff_time: string; // ISO 8601 string
  options: CircleVoteOption[];
  votes: Record<string, CircleVote>; // user_id -> CircleVote
  winning_option_id?: string;
  winning_restaurant_id?: string;
  winning_restaurant_name?: string;
  winner_reason?: string;
  ai_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface CircleVoteResult {
  winningOption: CircleVoteOption;
  reason: string;
  totalVotesCast: number;
  voteBreakdown: Record<string, number>;
  isTieBroken: boolean;
  tieBreakCriteria?: 'most_votes' | 'highest_compatibility' | 'lowest_subtotal' | 'deterministic_id';
}
