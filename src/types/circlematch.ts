export type DietaryPref = 'VEG' | 'NON_VEG' | 'BOTH';

export type HungerLevel = 'light' | 'regular' | 'hungry';

export type CravingType =
  | 'Spicy'
  | 'Comfort food'
  | 'Light meal'
  | 'High protein'
  | 'South Indian'
  | 'North Indian'
  | 'Chinese'
  | 'Fast food'
  | 'Surprise me';

export interface MemberMealPreference {
  userId: string;
  userName: string;
  userAvatar?: string;
  budgetPaise: number; // in integer paise (e.g. 20000 for ₹200)
  dietaryPref: DietaryPref;
  cravings: string[];
  hungerLevel: HungerLevel;
  exclusions: string[];
  isReady: boolean;
}

export interface MealItemRecommendation {
  dishId: string;
  dishName: string;
  dishDescription: string;
  pricePaise: number; // in integer paise
  isVeg: boolean;
  image?: string;
  tags?: string[];
  matchReason: string;
}

export interface MemberMealPlan {
  userId: string;
  userName: string;
  userAvatar?: string;
  recommendedDish: MealItemRecommendation;
  alternativeDishes: MealItemRecommendation[];
  satisfactionScore: number; // 0 to 100
  withinBudget: boolean;
  budgetPaise: number;
  dishCostPaise: number;
  accepted: boolean;
}

export type GroupPlanType = 'best_overall' | 'budget_friendly' | 'crowd_pleaser';

export interface GroupPlanRecommendation {
  id: string;
  type: GroupPlanType;
  title: string;
  tagline: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  restaurantCuisine: string[];
  memberPlans: MemberMealPlan[];
  groupSatisfactionScore: number; // 0 to 100
  fairnessScore: number; // 0 to 100 (equity between members)
  subtotalPaise: number;
  estimatedDeliveryFeePaise: number;
  estimatedTotalPaise: number;
  aiExplanation: string;
  highlights: string[];
}

export interface CircleMatchSession {
  id: string;
  circleId: string;
  createdBy: string;
  status: 'preferences' | 'matching' | 'results' | 'applied';
  memberPreferences: Record<string, MemberMealPreference>;
  recommendations: GroupPlanRecommendation[];
  selectedPlanId?: string;
  createdAt: string;
  updatedAt: string;
}

export type AnalyticsEventType =
  | 'circle_created'
  | 'member_joined'
  | 'meal_session_scheduled'
  | 'member_joined_meal'
  | 'member_skipped_meal'
  | 'circlematch_started'
  | 'preferences_completed'
  | 'recommendations_generated'
  | 'recommendation_viewed'
  | 'recommendation_accepted'
  | 'dish_replaced'
  | 'cart_added_from_ai'
  | 'cart_completed'
  | 'cart_finalized_after_ai'
  | 'order_finalized'
  | 'swiggy_cart_synced'
  | 'circlematch_abandoned';

export type EventSource = 'live_campus_pilot' | 'seeded_baseline';

export interface AnalyticsEvent {
  id: string;
  event: AnalyticsEventType;
  circleId: string;
  sessionId?: string;
  userId?: string;
  source: EventSource; // clearly distinguishes live campus pilot events from seeded baseline
  properties?: Record<string, unknown>;
  timestamp: string;
}

export interface CampusPilotRecordedSession {
  sessionId: string;
  circleId: string;
  participantCount: number;
  decisionTimeSeconds: number;
  recommendationAccepted: boolean;
  cartCompleted: boolean;
  estimatedMenuSubtotalPaise: number;
  repeatParticipationCount: number;
  source: EventSource;
  timestamp: string;
}

export interface BusinessAnalyticsSummary {
  // Live genuine pilot metrics
  liveRecordedSessions: number;
  liveAcceptanceRatePct: number | null;
  liveCartCompletionRatePct: number | null;
  liveAvgDecisionTimeSec: number | null;
  liveAvgOrderValuePaise: number | null;
  liveRepeatParticipantCount: number;

  // Target pilot research hypotheses & benchmarks
  targetAcceptanceRatePct: number;
  targetCartCompletionRatePct: number;
  targetDecisionTimeSec: number;
  targetAOVPaise: number;

  // Overall session counters & log
  totalEventsCount: number;
  totalMatchSessions: number;
  recommendationsGenerated: number;
  recommendationsAccepted: number;
  acceptanceRatePct: number;
  cartConversionRatePct: number;
  medianTimeToMatchSec: number;
  avgOrderValuePaiseWithAI: number;
  recentEvents: AnalyticsEvent[];
}
