/**
 * Order Rescue AI Engine — "Save the Group Order"
 * Tagline: "Plans change. Your food order doesn't have to fall apart."
 *
 * Implements:
 * 1. Scenario 1 — Dish unavailable
 * 2. Scenario 2 — Budget exceeded
 * 3. Scenario 3 — Vegetarian or dietary conflict
 * 4. Scenario 4 — Member changes their selection
 *
 * Strict Guardrails:
 * - Alternatives MUST belong to the SAME selected restaurant.
 * - Vegetarian constraints are NEVER violated.
 * - Budget caps strictly checked against integer paise.
 * - Clear no-match state if no safe alternative exists.
 * - Explicit student approval required before altering cart.
 * - Pre-seeded competition judge demo triggers.
 */

import type {
  OrderRescueScenario,
  OrderRescueIssue,
  OrderRescueAlternative,
} from '../../types/order-rescue';
import type { Restaurant, StudentProfile, CartItem } from '../../types';

/**
 * Evaluates candidate dishes from the SAME restaurant to produce up to 3 valid replacements.
 */
export function generateRescueAlternatives(
  restaurant: Restaurant,
  originalDishId: string,
  originalPricePaise: number,
  user: StudentProfile,
  currentCartItemsForUser: CartItem[],
  scenario: OrderRescueScenario,
  userCravings: string[] = []
): OrderRescueAlternative[] {
  const allDishes = restaurant.menu_categories.flatMap((cat) => cat.items);

  // Exclude the problematic dish itself
  const candidateDishes = allDishes.filter((d) => d.id !== originalDishId);

  // User budget in integer paise
  const userBudgetPaise = (user.preferred_budget || 200) * 100;

  // Calculate user spent so far excluding original dish
  const userSpentExcludingOriginal = currentCartItemsForUser
    .filter((ci) => ci.item_id !== originalDishId)
    .reduce((sum, item) => sum + item.item_price_paise * item.quantity, 0);

  const remainingAvailableBudget = Math.max(0, userBudgetPaise - userSpentExcludingOriginal);

  // Filter candidates strictly
  const validCandidates: OrderRescueAlternative[] = [];

  for (const dish of candidateDishes) {
    // Dietary constraint: if user is VEG, dish MUST be veg
    if (user.dietary_pref === 'VEG' && !dish.is_veg) {
      continue;
    }

    // Budget constraint: dish price cannot exceed remaining user budget
    if (dish.price_paise > remainingAvailableBudget) {
      continue;
    }

    // Calculate score based on price proximity, veg status, and cravings
    let matchScore = 70;
    const reasons: string[] = [];

    if (dish.is_veg && user.dietary_pref === 'VEG') {
      matchScore += 15;
      reasons.push('100% vegetarian verified');
    }

    // Price difference
    const priceDiffPaise = dish.price_paise - originalPricePaise;
    if (priceDiffPaise <= 0) {
      matchScore += 10;
      reasons.push(`Saves ₹${Math.abs(Math.round(priceDiffPaise / 100))}`);
    } else {
      reasons.push(`+₹${Math.round(priceDiffPaise / 100)} within budget`);
    }

    // Craving match
    const matchesCraving = userCravings.some(
      (c) =>
        dish.name.toLowerCase().includes(c.toLowerCase()) ||
        dish.description.toLowerCase().includes(c.toLowerCase())
    );
    if (matchesCraving) {
      matchScore += 15;
      reasons.push('Matches squad cravings');
    }

    matchScore = Math.min(99, Math.max(50, matchScore));

    validCandidates.push({
      dish_id: dish.id,
      dish_name: dish.name,
      price_paise: dish.price_paise,
      is_veg: dish.is_veg,
      match_score: matchScore,
      reason: reasons.join(' • '),
      price_diff_paise: priceDiffPaise,
      remaining_budget_paise: remainingAvailableBudget - dish.price_paise,
      tags: dish.is_veg ? ['Veg', 'Safe Choice'] : ['Non-Veg'],
      image: dish.image,
    });
  }

  // Sort by match score descending, then by lowest price difference
  validCandidates.sort((a, b) => {
    if (b.match_score !== a.match_score) {
      return b.match_score - a.match_score;
    }
    return a.price_diff_paise - b.price_diff_paise;
  });

  return validCandidates.slice(0, 3);
}

/**
 * Creates an Order Rescue issue for a detected group ordering problem.
 */
export function detectOrderIssue(
  scenario: OrderRescueScenario,
  sessionId: string,
  circleId: string,
  user: StudentProfile,
  originalDish: { id: string; name: string; price_paise: number },
  restaurant: Restaurant,
  currentCartItems: CartItem[],
  customReason?: string,
  isDemo = false
): OrderRescueIssue {
  let defaultReason = '';
  switch (scenario) {
    case 'dish_unavailable':
      defaultReason = `"${originalDish.name}" was marked out-of-stock by the kitchen. Replace it to keep the group order on schedule.`;
      break;
    case 'budget_exceeded':
      defaultReason = `Adding "${originalDish.name}" exceeds ${user.full_name}'s budget cap of ₹${user.preferred_budget || 200}. Choose an affordable alternative.`;
      break;
    case 'dietary_conflict':
      defaultReason = `"${originalDish.name}" contains non-vegetarian ingredients, which violates ${user.full_name}'s vegetarian preference.`;
      break;
    case 'member_selection_change':
      defaultReason = `${user.full_name} removed their selection. Here are recommended popular dishes from ${restaurant.name} to complete the squad cart.`;
      break;
  }

  const reason = customReason || defaultReason;
  const userCartItems = currentCartItems.filter((i) => i.user_id === user.id);

  const alternatives = generateRescueAlternatives(
    restaurant,
    originalDish.id,
    originalDish.price_paise,
    user,
    userCartItems,
    scenario
  );

  return {
    id: `rescue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    session_id: sessionId,
    circle_id: circleId,
    user_id: user.id,
    user_name: user.full_name,
    user_avatar: user.avatar_url,
    scenario,
    original_dish_id: originalDish.id,
    original_dish_name: originalDish.name,
    original_price_paise: originalDish.price_paise,
    reason,
    suggested_alternatives: alternatives,
    created_at: new Date().toISOString(),
    is_demo: isDemo,
  };
}

/**
 * Pre-seeded Competition Demo Scenarios for Judges
 */
export function getJudgeDemoRescueScenarios(
  sessionId: string,
  circleId: string,
  restaurant: Restaurant,
  members: StudentProfile[],
  currentCartItems: CartItem[]
): Record<string, OrderRescueIssue> {
  const vegMember = members.find((m) => m.dietary_pref === 'VEG') || members[0];
  const regularMember = members.find((m) => m.id !== vegMember.id) || members[0];

  const allDishes = restaurant.menu_categories.flatMap((cat) => cat.items);
  const nonVegDish = allDishes.find((d) => !d.is_veg) || {
    id: 'demo-dish-chicken',
    name: 'Butter Chicken Kathi Roll',
    price_paise: 26000,
    is_veg: false,
  };
  const expensiveDish = allDishes.find((d) => d.price_paise > 28000) || {
    id: 'demo-dish-expensive',
    name: 'Special Jumbo Combo Box',
    price_paise: 38000,
    is_veg: true,
  };
  const standardDish = allDishes[0] || {
    id: 'demo-dish-unavailable',
    name: 'Paneer Makhani Roll',
    price_paise: 18000,
    is_veg: true,
  };

  return {
    dietary_conflict: detectOrderIssue(
      'dietary_conflict',
      sessionId,
      circleId,
      vegMember,
      { id: nonVegDish.id, name: nonVegDish.name, price_paise: nonVegDish.price_paise },
      restaurant,
      currentCartItems,
      `[DEMO TRIAL] "${nonVegDish.name}" was added to vegetarian student ${vegMember.full_name}'s cart. Order Rescue AI intercepted the dietary mismatch.`,
      true
    ),
    budget_exceeded: detectOrderIssue(
      'budget_exceeded',
      sessionId,
      circleId,
      regularMember,
      { id: expensiveDish.id, name: expensiveDish.name, price_paise: expensiveDish.price_paise },
      restaurant,
      currentCartItems,
      `[DEMO TRIAL] "${expensiveDish.name}" (₹${Math.round(expensiveDish.price_paise / 100)}) exceeds ${regularMember.full_name}'s ₹${regularMember.preferred_budget || 200} budget limit.`,
      true
    ),
    dish_unavailable: detectOrderIssue(
      'dish_unavailable',
      sessionId,
      circleId,
      regularMember,
      { id: standardDish.id, name: standardDish.name, price_paise: standardDish.price_paise },
      restaurant,
      currentCartItems,
      `[DEMO TRIAL] Kitchen report: "${standardDish.name}" is currently 86'd / out-of-stock at ${restaurant.name}.`,
      true
    ),
  };
}
