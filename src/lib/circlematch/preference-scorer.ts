import { MenuItem, Restaurant } from '@/types';
import { MemberMealPreference } from '@/types/circlematch';

const CRAVING_KEYWORDS: Record<string, string[]> = {
  'Spicy': ['peri peri', 'peri-peri', 'schezwan', 'chilli', 'spicy', 'tadka', 'pepper', 'mirchi', 'masala', 'hot'],
  'Comfort food': ['maggi', 'chai', 'rajma', 'bun maska', 'comfort', 'noodles', 'dal', 'homestyle', 'jamun'],
  'Light meal': ['roll', 'fries', 'idli', 'chai', 'lemonade', 'salad', 'shikanji', 'coffee', 'steamed', 'momos'],
  'High protein': ['chicken', 'paneer', 'egg', 'soya', 'chaap', 'protein'],
  'South Indian': ['dosa', 'idli', 'coffee', 'sambar', 'podi', 'chutney', 'tiffin'],
  'North Indian': ['kathi', 'paratha', 'butter chicken', 'makhani', 'rajma', 'biryani', 'chaap', 'chawal', 'kulhad'],
  'Chinese': ['noodles', 'hakka', 'fried rice', 'momos', 'manchurian', 'wok', 'schezwan', 'garlic'],
  'Fast food': ['burger', 'fries', 'shake', 'roll', 'maggi', 'momos', 'wrap'],
};

export interface ScoredDishResult {
  dish: MenuItem;
  isFeasible: boolean;
  infeasibilityReason?: string;
  score: number; // 0 to 100
  matchReasons: string[];
}

/**
 * Score a dish against a member's preferences.
 * Hard constraints:
 * 1. Strict vegetarian students NEVER get non-veg dishes (score = -Infinity).
 * 2. Dish price MUST NOT exceed student's specified per-meal budget.
 * 3. Explicit ingredient exclusions are strictly enforced.
 */
export function scoreDishForMember(
  pref: MemberMealPreference,
  dish: MenuItem,
  restaurant: Restaurant
): ScoredDishResult {
  const matchReasons: string[] = [];

  // 1. HARD CONSTRAINT: Dietary Isolation
  if (pref.dietaryPref === 'VEG' && !dish.is_veg) {
    return {
      dish,
      isFeasible: false,
      infeasibilityReason: `Contains meat/egg, violates ${pref.userName}'s strict vegetarian preference.`,
      score: -Infinity,
      matchReasons: [],
    };
  }

  // 2. HARD CONSTRAINT: Individual Budget in Paise
  if (dish.price_paise > pref.budgetPaise) {
    return {
      dish,
      isFeasible: false,
      infeasibilityReason: `Cost (₹${dish.price_paise / 100}) exceeds ${pref.userName}'s budget of ₹${pref.budgetPaise / 100}.`,
      score: -Infinity,
      matchReasons: [],
    };
  }

  // 3. HARD CONSTRAINT: Explicit Exclusions (Allergens / Ingredients)
  if (pref.exclusions && pref.exclusions.length > 0) {
    const textToCheck = `${dish.name} ${dish.description} ${(dish.tags || []).join(' ')}`.toLowerCase();
    for (const exclusion of pref.exclusions) {
      const cleanEx = exclusion.trim().toLowerCase();
      if (cleanEx && textToCheck.includes(cleanEx)) {
        return {
          dish,
          isFeasible: false,
          infeasibilityReason: `Contains excluded ingredient: "${exclusion}".`,
          score: -Infinity,
          matchReasons: [],
        };
      }
    }
  }

  // DISH IS FEASIBLE -> Calculate Soft Preference Score (0 to 100)
  let score = 50; // Base score for a valid, affordable, dietary-compliant dish

  // A. Craving Compatibility (Up to +25 points)
  const dishText = `${dish.name} ${dish.description} ${(dish.tags || []).join(' ')} ${restaurant.cuisine.join(' ')}`.toLowerCase();

  let cravingMatched = false;
  for (const craving of pref.cravings) {
    if (craving === 'Surprise me') {
      if (dish.is_bestseller || dish.is_student_pick) {
        score += 15;
        matchReasons.push('Campus Bestseller surprise');
      }
      continue;
    }

    const keywords = CRAVING_KEYWORDS[craving] || [craving.toLowerCase()];
    const hasMatch = keywords.some((kw) => dishText.includes(kw));

    if (hasMatch) {
      score += 20;
      cravingMatched = true;
      matchReasons.push(`Satisfies "${craving}" craving`);
      break; // Award primary craving bonus
    }
  }

  if (!cravingMatched && pref.cravings.length > 0 && !pref.cravings.includes('Surprise me')) {
    score -= 5;
  }

  // B. Hunger Level Fit (Up to +15 points)
  const priceRupees = dish.price_paise / 100;
  if (pref.hungerLevel === 'light') {
    if (priceRupees <= 150) {
      score += 15;
      matchReasons.push('Perfect portion for light snack');
    } else {
      score -= 5;
    }
  } else if (pref.hungerLevel === 'regular') {
    if (priceRupees >= 120 && priceRupees <= 220) {
      score += 15;
      matchReasons.push('Standard hearty meal portion');
    } else {
      score += 5;
    }
  } else if (pref.hungerLevel === 'hungry') {
    if (priceRupees >= 170) {
      score += 15;
      matchReasons.push('Generous filling portion');
    } else {
      score -= 10;
    }
  }

  // C. Popularity & Student Value (Up to +15 points)
  if (dish.is_bestseller) {
    score += 10;
    matchReasons.push('Top Bestseller');
  }
  if (dish.is_student_pick) {
    score += 8;
    matchReasons.push('Student Favorite');
  }

  // D. Budget Efficiency (Up to +10 points)
  // Reward using 60%–95% of allocated budget (good value without overpaying or severely under-serving)
  const budgetRatio = dish.price_paise / pref.budgetPaise;
  if (budgetRatio >= 0.6 && budgetRatio <= 0.95) {
    score += 10;
    const savings = Math.round((pref.budgetPaise - dish.price_paise) / 100);
    matchReasons.push(`Saves ₹${savings} under budget`);
  } else if (budgetRatio < 0.6) {
    score += 5; // Very affordable
    matchReasons.push('Pocket-friendly choice');
  }

  // Cap normalized score to [10, 100]
  const normalizedScore = Math.max(10, Math.min(100, Math.round(score)));

  return {
    dish,
    isFeasible: true,
    score: normalizedScore,
    matchReasons: matchReasons.slice(0, 3),
  };
}
