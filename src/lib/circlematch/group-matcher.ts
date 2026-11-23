import { Restaurant } from '@/types';
import {
  MemberMealPreference,
  GroupPlanRecommendation,
} from '@/types/circlematch';
import { evaluateRestaurantForGroup, EvaluatedRestaurantPlan } from './budget-optimizer';

export interface GroupMatchResult {
  recommendations: GroupPlanRecommendation[];
  evaluatedCount: number;
  feasibleCount: number;
  infeasibleReasons: { restaurantName: string; reasons: string[] }[];
}

/**
 * Evaluates all candidate restaurants deterministically and produces 3 distinct group meal plans:
 * 1. Best Overall Match: Highest composite satisfaction & fairness
 * 2. Most Budget-Friendly: Lowest total group cost while preserving satisfaction
 * 3. Most Crowd-Pleasing: Highest floor satisfaction score (Maximin fairness)
 */
export function findGroupMatches(
  preferences: MemberMealPreference[],
  restaurants: Restaurant[]
): GroupMatchResult {
  if (!preferences || preferences.length === 0) {
    return {
      recommendations: [],
      evaluatedCount: 0,
      feasibleCount: 0,
      infeasibleReasons: [],
    };
  }

  // 1. Evaluate all candidate restaurants
  const evaluatedPlans: EvaluatedRestaurantPlan[] = restaurants.map((r) =>
    evaluateRestaurantForGroup(r, preferences)
  );

  const feasiblePlans = evaluatedPlans.filter((p) => p.isFeasible);
  const infeasiblePlans = evaluatedPlans.filter((p) => !p.isFeasible);

  const infeasibleReasons = infeasiblePlans.map((p) => ({
    restaurantName: p.restaurant.name,
    reasons: p.infeasibilityReasons,
  }));

  if (feasiblePlans.length === 0) {
    return {
      recommendations: [],
      evaluatedCount: restaurants.length,
      feasibleCount: 0,
      infeasibleReasons,
    };
  }

  // 2. Select 3 Distinct Plans
  const recommendations: GroupPlanRecommendation[] = [];
  const usedRestaurantIds = new Set<string>();

  // PLAN 1: Best Overall Match (Highest composite score)
  const sortedByComposite = [...feasiblePlans].sort(
    (a, b) => b.compositeScore - a.compositeScore || b.restaurant.rating - a.restaurant.rating
  );

  const bestOverall = sortedByComposite[0];
  usedRestaurantIds.add(bestOverall.restaurant.id);

  recommendations.push({
    id: `plan-best-overall-${bestOverall.restaurant.id}`,
    type: 'best_overall',
    title: 'Best Overall Match',
    tagline: 'Highest balanced group happiness, craving match & member fairness.',
    restaurantId: bestOverall.restaurant.id,
    restaurantName: bestOverall.restaurant.name,
    restaurantImage: bestOverall.restaurant.image,
    restaurantCuisine: bestOverall.restaurant.cuisine,
    memberPlans: bestOverall.memberPlans,
    groupSatisfactionScore: bestOverall.groupSatisfactionScore,
    fairnessScore: bestOverall.fairnessScore,
    subtotalPaise: bestOverall.subtotalPaise,
    estimatedDeliveryFeePaise: bestOverall.deliveryFeePaise,
    estimatedTotalPaise: bestOverall.totalPaise,
    aiExplanation: generateDeterministicExplanation(bestOverall, preferences, 'best_overall'),
    highlights: [
      `${bestOverall.groupSatisfactionScore}% Group Satisfaction`,
      `Includes all ${preferences.length} student cravings`,
      bestOverall.deliveryFeePaise === 0 ? 'FREE Group Delivery Unlocked' : 'Standard Delivery',
    ],
  });

  // PLAN 2: Most Budget-Friendly (Lowest total group cost)
  const candidateForBudget = [...feasiblePlans]
    .filter((p) => !usedRestaurantIds.has(p.restaurant.id))
    .sort((a, b) => a.totalPaise - b.totalPaise || b.compositeScore - a.compositeScore);

  const budgetPlan = candidateForBudget[0] || (feasiblePlans.length > 1 ? sortedByComposite[1] : null);

  if (budgetPlan && !usedRestaurantIds.has(budgetPlan.restaurant.id)) {
    usedRestaurantIds.add(budgetPlan.restaurant.id);
    recommendations.push({
      id: `plan-budget-${budgetPlan.restaurant.id}`,
      type: 'budget_friendly',
      title: 'Most Budget-Friendly',
      tagline: 'Lowest group total cost while fulfilling all student dietary needs.',
      restaurantId: budgetPlan.restaurant.id,
      restaurantName: budgetPlan.restaurant.name,
      restaurantImage: budgetPlan.restaurant.image,
      restaurantCuisine: budgetPlan.restaurant.cuisine,
      memberPlans: budgetPlan.memberPlans,
      groupSatisfactionScore: budgetPlan.groupSatisfactionScore,
      fairnessScore: budgetPlan.fairnessScore,
      subtotalPaise: budgetPlan.subtotalPaise,
      estimatedDeliveryFeePaise: budgetPlan.deliveryFeePaise,
      estimatedTotalPaise: budgetPlan.totalPaise,
      aiExplanation: generateDeterministicExplanation(budgetPlan, preferences, 'budget_friendly'),
      highlights: [
        `Save ₹${Math.round((bestOverall.totalPaise - budgetPlan.totalPaise) / 100)} vs Best Match`,
        `Avg ₹${Math.round(budgetPlan.subtotalPaise / preferences.length / 100)} per student`,
        '100% within student budgets',
      ],
    });
  }

  // PLAN 3: Most Crowd-Pleasing (Highest floor satisfaction / Rawlsian fairness)
  const candidateForCrowd = [...feasiblePlans]
    .filter((p) => !usedRestaurantIds.has(p.restaurant.id))
    .sort((a, b) => {
      const minA = Math.min(...a.memberPlans.map((m) => m.satisfactionScore));
      const minB = Math.min(...b.memberPlans.map((m) => m.satisfactionScore));
      return minB - minA || b.fairnessScore - a.fairnessScore;
    });

  const crowdPlan = candidateForCrowd[0];

  if (crowdPlan && !usedRestaurantIds.has(crowdPlan.restaurant.id)) {
    recommendations.push({
      id: `plan-crowd-${crowdPlan.restaurant.id}`,
      type: 'crowd_pleaser',
      title: 'Most Crowd-Pleasing',
      tagline: 'Maximum fairness across members so no single student is left unsatisfied.',
      restaurantId: crowdPlan.restaurant.id,
      restaurantName: crowdPlan.restaurant.name,
      restaurantImage: crowdPlan.restaurant.image,
      restaurantCuisine: crowdPlan.restaurant.cuisine,
      memberPlans: crowdPlan.memberPlans,
      groupSatisfactionScore: crowdPlan.groupSatisfactionScore,
      fairnessScore: crowdPlan.fairnessScore,
      subtotalPaise: crowdPlan.subtotalPaise,
      estimatedDeliveryFeePaise: crowdPlan.deliveryFeePaise,
      estimatedTotalPaise: crowdPlan.totalPaise,
      aiExplanation: generateDeterministicExplanation(crowdPlan, preferences, 'crowd_pleaser'),
      highlights: [
        `${crowdPlan.fairnessScore}% Group Equity Rating`,
        'Zero compromise for vegetarians',
        `${crowdPlan.restaurant.rating} ★ Rating (${crowdPlan.restaurant.rating_count})`,
      ],
    });
  }

  return {
    recommendations,
    evaluatedCount: restaurants.length,
    feasibleCount: feasiblePlans.length,
    infeasibleReasons,
  };
}

/**
 * Generate human-readable, grounded explanations for each group recommendation.
 */
function generateDeterministicExplanation(
  plan: EvaluatedRestaurantPlan,
  preferences: MemberMealPreference[],
  type: 'best_overall' | 'budget_friendly' | 'crowd_pleaser'
): string {
  const vegCount = preferences.filter((p) => p.dietaryPref === 'VEG').length;
  const avgCostRupees = Math.round(plan.subtotalPaise / preferences.length / 100);

  if (type === 'best_overall') {
    return `${plan.restaurant.name} delivers the highest composite group satisfaction (${plan.groupSatisfactionScore}%). It accommodates all ${preferences.length} members with authentic ${plan.restaurant.cuisine.slice(0, 2).join(' & ')} dishes, respecting dietary boundaries for ${vegCount} vegetarians while maintaining an average cost of ₹${avgCostRupees} per student.`;
  }

  if (type === 'budget_friendly') {
    return `${plan.restaurant.name} offers the lowest total cost (₹${plan.totalPaise / 100}) for the entire circle while ensuring every member receives a filling meal within their budget ceiling.`;
  }

  return `${plan.restaurant.name} achieves the highest equity score (${plan.fairnessScore}%), ensuring a balanced distribution of satisfaction without leaving any individual student compromised on portion or taste.`;
}
