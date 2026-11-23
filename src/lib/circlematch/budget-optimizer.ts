import { Restaurant } from '@/types';
import {
  MemberMealPreference,
  MemberMealPlan,
  MealItemRecommendation,
} from '@/types/circlematch';
import { scoreDishForMember, ScoredDishResult } from './preference-scorer';

export interface EvaluatedRestaurantPlan {
  restaurant: Restaurant;
  isFeasible: boolean;
  infeasibilityReasons: string[];
  memberPlans: MemberMealPlan[];
  groupSatisfactionScore: number; // 0 to 100 (Mean satisfaction)
  fairnessScore: number; // 0 to 100 (Lower standard deviation = higher fairness)
  compositeScore: number; // 0 to 100
  subtotalPaise: number;
  deliveryFeePaise: number;
  totalPaise: number;
}

/**
 * Evaluates candidate meals for all participating members at a specific restaurant.
 * Guarantees that:
 * 1. Every single member has at least one valid, affordable, dietary-compliant dish.
 * 2. Alternative dishes are strictly feasible and within budget.
 * 3. Fairness and composite satisfaction are computed deterministically.
 */
export function evaluateRestaurantForGroup(
  restaurant: Restaurant,
  preferences: MemberMealPreference[]
): EvaluatedRestaurantPlan {
  // Collect all dishes across all categories of this restaurant
  const allDishes = restaurant.menu_categories.flatMap((cat) => cat.items);

  const infeasibilityReasons: string[] = [];
  const memberPlans: MemberMealPlan[] = [];

  for (const pref of preferences) {
    // Score all dishes for this member
    const scoredDishes: ScoredDishResult[] = allDishes
      .map((dish) => scoreDishForMember(pref, dish, restaurant))
      .filter((res) => res.isFeasible)
      .sort((a, b) => b.score - a.score);

    if (scoredDishes.length === 0) {
      infeasibilityReasons.push(
        `No feasible meal for ${pref.userName} at ${restaurant.name} (Budget: ₹${pref.budgetPaise / 100}, Dietary: ${pref.dietaryPref}).`
      );
      continue;
    }

    const bestMatch = scoredDishes[0];
    const alternatives = scoredDishes.slice(1, 4).map((alt) => ({
      dishId: alt.dish.id,
      dishName: alt.dish.name,
      dishDescription: alt.dish.description,
      pricePaise: alt.dish.price_paise,
      isVeg: alt.dish.is_veg,
      image: alt.dish.image,
      tags: alt.dish.tags,
      matchReason: alt.matchReasons.join(' • '),
    }));

    const primaryRec: MealItemRecommendation = {
      dishId: bestMatch.dish.id,
      dishName: bestMatch.dish.name,
      dishDescription: bestMatch.dish.description,
      pricePaise: bestMatch.dish.price_paise,
      isVeg: bestMatch.dish.is_veg,
      image: bestMatch.dish.image,
      tags: bestMatch.dish.tags,
      matchReason: bestMatch.matchReasons.join(' • ') || 'Fits dietary profile and budget',
    };

    memberPlans.push({
      userId: pref.userId,
      userName: pref.userName,
      userAvatar: pref.userAvatar,
      recommendedDish: primaryRec,
      alternativeDishes: alternatives,
      satisfactionScore: bestMatch.score,
      withinBudget: true,
      budgetPaise: pref.budgetPaise,
      dishCostPaise: bestMatch.dish.price_paise,
      accepted: false,
    });
  }

  // If any member could not find a dish, the entire restaurant plan is infeasible for the group
  if (infeasibilityReasons.length > 0 || memberPlans.length !== preferences.length) {
    return {
      restaurant,
      isFeasible: false,
      infeasibilityReasons,
      memberPlans: [],
      groupSatisfactionScore: 0,
      fairnessScore: 0,
      compositeScore: 0,
      subtotalPaise: 0,
      deliveryFeePaise: 0,
      totalPaise: 0,
    };
  }

  // Calculate Group Totals in Integer Paise
  const subtotalPaise = memberPlans.reduce((sum, mp) => sum + mp.dishCostPaise, 0);

  // Group delivery threshold: Free delivery if subtotal > ₹400 (40000 paise)
  const deliveryFeePaise = subtotalPaise > 40000 ? 0 : 3000;
  const platformFeePaise = 500;
  const discountPaise = subtotalPaise > 50000 ? 5000 : 0;
  const totalPaise = subtotalPaise + deliveryFeePaise + platformFeePaise - discountPaise;

  // Compute Group Satisfaction Metrics
  const scores = memberPlans.map((mp) => mp.satisfactionScore);
  const avgSatisfaction = scores.reduce((a, b) => a + b, 0) / scores.length;

  // Fairness Score: Penalize high discrepancy between happiest and least-happy member
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const spread = maxScore - minScore;
  const fairnessScore = Math.max(0, Math.min(100, Math.round(100 - spread * 0.8)));

  // Composite Score (60% Average Satisfaction + 40% Fairness)
  const compositeScore = Math.round(avgSatisfaction * 0.6 + fairnessScore * 0.4);

  return {
    restaurant,
    isFeasible: true,
    infeasibilityReasons: [],
    memberPlans,
    groupSatisfactionScore: Math.round(avgSatisfaction),
    fairnessScore,
    compositeScore,
    subtotalPaise,
    deliveryFeePaise,
    totalPaise,
  };
}
