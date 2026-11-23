/**
 * CircleVote Engine — "The Decision Room"
 * Tagline: "Less debating. More eating."
 *
 * Implements:
 * 1. Voting session creation with up to 3 restaurant options.
 * 2. Deterministic AI compatibility summaries (dietary & budget compatibility).
 * 3. Atomic single-vote-per-member tracking with dynamic vote switching.
 * 4. Cutoff deadline enforcement.
 * 5. Strict 4-tier fair winner selection:
 *    - 1) Most votes
 *    - 2) Highest group compatibility score
 *    - 3) Lowest estimated group menu subtotal
 *    - 4) Deterministic lexicographical tie-break rule
 */

import type {
  CircleVoteSession,
  CircleVoteOption,
  CircleVote,
  CircleVoteResult,
  VoteOptionSource,
} from '../../types/circlevote';
import type { Restaurant, StudentProfile, Circle } from '../../types';

export interface CandidateRestaurantInput {
  restaurant: Restaurant;
  source: VoteOptionSource;
  compatibilityScore?: number;
  estimatedSubtotalPaise?: number;
}

/**
 * Generates an objective AI compatibility summary for a restaurant against group profiles.
 * Hard vegetarian constraints are NEVER overridden.
 */
export function generateRestaurantCompatibility(
  restaurant: Restaurant,
  members: StudentProfile[]
): {
  compatibilityScore: number;
  estimatedSubtotalPaise: number;
  dietarySummary: string;
  budgetSummary: string;
  priceRangeText: string;
  isDietaryViable: boolean;
} {
  const allDishes = restaurant.menu_categories.flatMap((cat) => cat.items);
  const vegDishes = allDishes.filter((d) => d.is_veg);
  const vegMembers = members.filter((m) => m.dietary_pref === 'VEG');

  // Hard dietary check: if there are vegetarian members, the restaurant MUST have vegetarian options
  const hasVegViolation = vegMembers.length > 0 && vegDishes.length === 0;

  // Calculate price stats
  const prices = allDishes.map((d) => d.price_paise);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 15000;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 35000;
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 22000;

  // Price range string
  const priceRangeText = `₹${Math.round(minPrice / 100)}–₹${Math.round(maxPrice / 100)} per person`;

  // Check budget matches
  let withinBudgetCount = 0;
  members.forEach((m) => {
    const budgetPaise = (m.preferred_budget || 200) * 100;
    const affordableDishes = (m.dietary_pref === 'VEG' ? vegDishes : allDishes).filter(
      (d) => d.price_paise <= budgetPaise
    );
    if (affordableDishes.length > 0) {
      withinBudgetCount++;
    }
  });

  // Calculate compatibility score (0-100)
  let score = 75; // base score

  if (hasVegViolation) {
    score = 15; // heavily penalized for dietary violation
  } else if (vegDishes.length >= 3 && vegMembers.length > 0) {
    score += 10;
  }

  const budgetRatio = members.length > 0 ? withinBudgetCount / members.length : 1;
  score = Math.round(score * 0.6 + budgetRatio * 40);
  score = Math.max(10, Math.min(98, score));

  // Estimated group subtotal
  const estimatedSubtotalPaise = avgPrice * Math.max(1, members.length);

  // Dietary explanation
  let dietarySummary = 'Diverse options available for all dietary preferences.';
  if (hasVegViolation) {
    dietarySummary = '⚠️ Caution: No vegetarian dishes found on the active menu.';
  } else if (vegMembers.length > 0) {
    dietarySummary = `Strictly verified: ${vegDishes.length} vegetarian dishes available for veg members.`;
  }

  // Budget explanation
  const budgetSummary =
    withinBudgetCount === members.length
      ? `100% of participants have affordable choices within their preferred budget.`
      : `${withinBudgetCount} of ${members.length} members have menu options within their current budget limit.`;

  return {
    compatibilityScore: score,
    estimatedSubtotalPaise,
    dietarySummary,
    budgetSummary,
    priceRangeText,
    isDietaryViable: !hasVegViolation,
  };
}

/**
 * Creates a new voting session for a circle with up to 3 candidate restaurants.
 */
export function createVoteSession(
  circle: Circle,
  createdByUserId: string,
  candidates: CandidateRestaurantInput[],
  members: StudentProfile[],
  cutoffMinutes = 15,
  title = 'Meal Decision Room'
): CircleVoteSession {
  if (candidates.length === 0) {
    throw new Error('At least one restaurant candidate is required for CircleVote.');
  }
  if (candidates.length > 3) {
    throw new Error('CircleVote supports a maximum of 3 restaurant candidates.');
  }

  const cutoffTime = new Date(Date.now() + cutoffMinutes * 60000).toISOString();
  const sessionId = `vote-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const options: CircleVoteOption[] = candidates.map((cand, idx) => {
    const analysis = generateRestaurantCompatibility(cand.restaurant, members);
    return {
      id: `opt-${sessionId}-${idx + 1}`,
      restaurant_id: cand.restaurant.id,
      restaurant_name: cand.restaurant.name,
      restaurant_image: cand.restaurant.image,
      cuisine: cand.restaurant.cuisine,
      price_range_text: analysis.priceRangeText,
      group_compatibility_score: cand.compatibilityScore ?? analysis.compatibilityScore,
      estimated_group_subtotal_paise: cand.estimatedSubtotalPaise ?? analysis.estimatedSubtotalPaise,
      dietary_summary: analysis.dietarySummary,
      budget_summary: analysis.budgetSummary,
      source: cand.source,
      vote_count: 0,
      voter_user_ids: [],
    };
  });

  return {
    id: sessionId,
    circle_id: circle.id,
    created_by: createdByUserId,
    title,
    status: 'active',
    cutoff_time: cutoffTime,
    options,
    votes: {},
    ai_summary: `CircleVote Decision Room: ${options.length} options evaluated for ${members.length} participating students.`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Casts or switches a member's vote in an active session.
 * Enforces:
 * 1. Session must be active.
 * 2. Cutoff time must not have passed.
 * 3. 1 vote per member: changing vote updates counts accurately without inflating total.
 */
export function castVote(
  session: CircleVoteSession,
  user: { id: string; name: string; avatar?: string },
  optionId: string
): CircleVoteSession {
  if (session.status !== 'active') {
    throw new Error(`Cannot vote: Decision Room session is ${session.status}.`);
  }

  if (new Date(session.cutoff_time).getTime() < Date.now()) {
    throw new Error('Cannot vote: Voting cutoff deadline has passed.');
  }

  const targetOption = session.options.find((o) => o.id === optionId);
  if (!targetOption) {
    throw new Error('Selected restaurant option does not exist.');
  }

  const updatedVotes = { ...session.votes };

  // Create new vote
  const newVote: CircleVote = {
    id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    session_id: session.id,
    option_id: optionId,
    user_id: user.id,
    user_name: user.name,
    user_avatar: user.avatar,
    voted_at: new Date().toISOString(),
  };

  updatedVotes[user.id] = newVote;

  // Re-calculate vote counts and voter IDs accurately
  const updatedOptions = session.options.map((opt) => {
    // If previously voted for this option and now changing away, remove user
    // If voting for this option, add user
    const voters = Object.values(updatedVotes)
      .filter((v) => v.option_id === opt.id)
      .map((v) => v.user_id);

    return {
      ...opt,
      vote_count: voters.length,
      voter_user_ids: voters,
    };
  });

  return {
    ...session,
    options: updatedOptions,
    votes: updatedVotes,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Resolves the fair winner following the strict 4-tier priority:
 * 1. Restaurant with most valid votes wins.
 * 2. If tied, select restaurant with highest verified group compatibility score.
 * 3. If still tied, choose lowest feasible estimated group menu subtotal.
 * 4. If still tied, documented deterministic tie-break rule (lexicographical sorting by restaurant_id).
 */
export function resolveVoteWinner(session: CircleVoteSession): CircleVoteResult {
  if (session.options.length === 0) {
    throw new Error('No options available in voting session.');
  }

  const totalVotesCast = Object.keys(session.votes).length;
  const voteBreakdown: Record<string, number> = {};
  session.options.forEach((opt) => {
    voteBreakdown[opt.id] = opt.vote_count;
  });

  // Sort candidates by the 4 deterministic criteria
  const sorted = [...session.options].sort((a, b) => {
    // Tier 1: Most votes
    if (b.vote_count !== a.vote_count) {
      return b.vote_count - a.vote_count;
    }

    // Tier 2: Highest verified group compatibility score
    if (b.group_compatibility_score !== a.group_compatibility_score) {
      return b.group_compatibility_score - a.group_compatibility_score;
    }

    // Tier 3: Lowest feasible estimated group menu subtotal
    if (a.estimated_group_subtotal_paise !== b.estimated_group_subtotal_paise) {
      return a.estimated_group_subtotal_paise - b.estimated_group_subtotal_paise;
    }

    // Tier 4: Documented deterministic tie-break: alphabetical by restaurant_id
    return a.restaurant_id.localeCompare(b.restaurant_id);
  });

  const winner = sorted[0];
  const runnerUp = sorted[1];

  let tieBreakCriteria: CircleVoteResult['tieBreakCriteria'] = 'most_votes';
  let isTieBroken = false;
  let reason = `${winner.restaurant_name} won with ${winner.vote_count} votes.`;

  if (runnerUp && runnerUp.vote_count === winner.vote_count) {
    isTieBroken = true;
    if (winner.group_compatibility_score !== runnerUp.group_compatibility_score) {
      tieBreakCriteria = 'highest_compatibility';
      reason = `Tie-break applied: Both restaurants received ${winner.vote_count} votes. ${winner.restaurant_name} selected due to higher group compatibility (${winner.group_compatibility_score}% vs ${runnerUp.group_compatibility_score}%).`;
    } else if (winner.estimated_group_subtotal_paise !== runnerUp.estimated_group_subtotal_paise) {
      tieBreakCriteria = 'lowest_subtotal';
      reason = `Tie-break applied: Compatibility scores matched. ${winner.restaurant_name} selected for lower estimated group menu subtotal (₹${Math.round(winner.estimated_group_subtotal_paise / 100)}).`;
    } else {
      tieBreakCriteria = 'deterministic_id';
      reason = `Tie-break applied: Multiple options tied across all metrics. Deterministic campus catalog order selected ${winner.restaurant_name}.`;
    }
  }

  return {
    winningOption: winner,
    reason,
    totalVotesCast,
    voteBreakdown,
    isTieBroken,
    tieBreakCriteria,
  };
}

/**
 * Completes a voting session and records the winning restaurant.
 */
export function completeVoteSession(
  session: CircleVoteSession,
  adminUserId: string,
  circleAdminId: string
): CircleVoteSession {
  if (adminUserId !== circleAdminId) {
    throw new Error('Only the circle admin can finalize the Decision Room voting session.');
  }

  const result = resolveVoteWinner(session);

  return {
    ...session,
    status: 'completed',
    winning_option_id: result.winningOption.id,
    winning_restaurant_id: result.winningOption.restaurant_id,
    winning_restaurant_name: result.winningOption.restaurant_name,
    winner_reason: result.reason,
    updated_at: new Date().toISOString(),
  };
}
