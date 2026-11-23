'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Star,
  ShoppingBag,
} from 'lucide-react';
import { SwiggyCartSyncModal } from '@/components/circles/SwiggyCartSyncModal';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store/demo-context';
import {
  MemberMealPreference,
  GroupPlanRecommendation,
  CravingType,
  HungerLevel,
  MemberMealPlan,
  MealItemRecommendation,
} from '@/types/circlematch';
import { findGroupMatches } from '@/lib/circlematch/group-matcher';
import { analyticsService } from '@/lib/analytics/analytics-service';
import { formatPaise } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface CircleMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
}

const AVAILABLE_CRAVINGS: CravingType[] = [
  'Spicy',
  'Comfort food',
  'Light meal',
  'High protein',
  'South Indian',
  'North Indian',
  'Chinese',
  'Fast food',
  'Surprise me',
];

export function CircleMatchModal({ isOpen, onClose, circleId }: CircleMatchModalProps) {
  const {
    getCircle,
    getCircleMembers,
    restaurants,
    currentUser,
    startSession,
    getSession,
    addToCart,
    cartItems,
  } = useApp();

  const circle = getCircle(circleId);
  const members = getCircleMembers(circleId);

  // Workflow Stages: 1 = Setup, 2 = Computing, 3 = Results, 4 = Detail, 5 = Applied
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Member Preferences Map (keyed by userId)
  const [memberPrefs, setMemberPrefs] = useState<Record<string, MemberMealPreference>>({});

  // Computed AI Recommendations
  const [recommendations, setRecommendations] = useState<GroupPlanRecommendation[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<GroupPlanRecommendation | null>(null);

  // Editable Member Meal Plans for Customization (Screen 4)
  const [customizedPlans, setCustomizedPlans] = useState<MemberMealPlan[]>([]);
  const [swappingUser, setSwappingUser] = useState<string | null>(null);

  // Phase 4: Data Source Selection (Swiggy Food MCP Live vs Campus Verified Demo)
  const [dataSourceMode, setDataSourceMode] = useState<'live' | 'demo'>('live');
  const [showSwiggyCartSync, setShowSwiggyCartSync] = useState(false);

  // Initialize Member Preferences based on their profiles
  useEffect(() => {
    if (!isOpen || !members || members.length === 0) return;

    // Only initialize if we don't have preferences for these members yet
    // or if the member count changed significantly
    const currentPrefIds = Object.keys(memberPrefs);
    if (currentPrefIds.length === members.length && members.every(m => currentPrefIds.includes(m.user_id))) {
      return;
    }

    const initialPrefs: Record<string, MemberMealPreference> = {};

    members.forEach((m) => {
      // Set distinct realistic cravings based on persona defaults
      let defaultCravings: string[] = ['Comfort food'];
      let defaultHunger: HungerLevel = 'regular';

      if (m.user_id.endsWith('1')) {
        defaultCravings = ['North Indian', 'High protein'];
        defaultHunger = 'regular';
      } else if (m.user_id.endsWith('2')) {
        defaultCravings = ['Comfort food', 'Light meal'];
        defaultHunger = 'light';
      } else if (m.user_id.endsWith('3')) {
        defaultCravings = ['Spicy', 'Fast food'];
        defaultHunger = 'hungry';
      } else if (m.user_id.endsWith('4')) {
        defaultCravings = ['South Indian', 'Surprise me'];
        defaultHunger = 'regular';
      }

      initialPrefs[m.user_id] = {
        userId: m.user_id,
        userName: m.profile.full_name,
        userAvatar: m.profile.avatar_url,
        budgetPaise: (m.profile.preferred_budget || 200) * 100, // in integer paise
        dietaryPref: m.profile.dietary_pref || 'BOTH',
        cravings: defaultCravings,
        hungerLevel: defaultHunger,
        exclusions: [],
        isReady: true,
      };
    });

    setMemberPrefs(initialPrefs);
  }, [isOpen, circleId, members, memberPrefs]);

  // Handle Preference Change for a specific student
  const updateStudentPref = (
    userId: string,
    updates: Partial<MemberMealPreference>
  ) => {
    setMemberPrefs((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        ...updates,
      },
    }));
  };

  // Toggle Craving for student
  const toggleCraving = (userId: string, craving: string) => {
    const student = memberPrefs[userId];
    if (!student) return;
    const exists = student.cravings.includes(craving);
    const updated = exists
      ? student.cravings.filter((c) => c !== craving)
      : [...student.cravings, craving];
    updateStudentPref(userId, { cravings: updated });
  };

  // Launch AI Matching
  const handleStartMatching = async () => {
    analyticsService.trackEvent('circlematch_started', circleId, undefined, currentUser.id, {
      memberCount: members.length,
      dataSourceMode,
    });
    analyticsService.trackEvent('preferences_completed', circleId, undefined, currentUser.id);

    setCurrentStep(2); // Show progressive matching animation

    // Fetch candidate restaurants based on chosen data source
    let candidateRestaurants = restaurants;
    if (dataSourceMode === 'live') {
      try {
        const res = await fetch('/api/mcp/restaurants?mode=live');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.restaurants) && data.restaurants.length > 0) {
            candidateRestaurants = data.restaurants;
          }
        }
      } catch {
        // Fallback to local demo restaurants
      }
    }

    setTimeout(() => {
      // Deterministic optimization run
      const prefsList = Object.values(memberPrefs);
      let matchResult = findGroupMatches(prefsList, candidateRestaurants);

      // If live yielded no feasible restaurants, gracefully fall back to verified campus catalog
      if (matchResult.recommendations.length === 0 && candidateRestaurants !== restaurants) {
        matchResult = findGroupMatches(prefsList, restaurants);
      }

      setRecommendations(matchResult.recommendations);
      analyticsService.trackEvent('recommendations_generated', circleId, undefined, currentUser.id, {
        count: matchResult.recommendations.length,
        topScore: matchResult.recommendations[0]?.groupSatisfactionScore || 0,
        dataSource: dataSourceMode,
      });

      if (matchResult.recommendations.length > 0) {
        setSelectedPlan(matchResult.recommendations[0]);
        setCustomizedPlans(
          matchResult.recommendations[0].memberPlans.map((mp) => ({
            ...mp,
            accepted: true,
          }))
        );
      }

      setCurrentStep(3); // Show Results Cards
    }, 1200);
  };

  // Select a plan to view in Screen 4
  const handleSelectPlanForCustomization = (plan: GroupPlanRecommendation) => {
    setSelectedPlan(plan);
    setCustomizedPlans(
      plan.memberPlans.map((mp) => ({
        ...mp,
        accepted: true,
      }))
    );
    analyticsService.trackEvent('recommendation_viewed', circleId, undefined, currentUser.id, {
      planType: plan.type,
      restaurantId: plan.restaurantId,
    });
    setCurrentStep(4);
  };

  // Swap dish for a member in Screen 4
  const handleSwapDish = (userId: string, newDish: MealItemRecommendation) => {
    setCustomizedPlans((prev) =>
      prev.map((plan) => {
        if (plan.userId !== userId) return plan;
        return {
          ...plan,
          recommendedDish: newDish,
          dishCostPaise: newDish.pricePaise,
        };
      })
    );
    analyticsService.trackEvent('dish_replaced', circleId, undefined, userId, {
      newDishId: newDish.dishId,
      newDishPrice: newDish.pricePaise,
    });
    setSwappingUser(null);
  };

  // Accept/Toggle individual meal
  const toggleMealAcceptance = (userId: string) => {
    setCustomizedPlans((prev) =>
      prev.map((plan) => {
        if (plan.userId !== userId) return plan;
        return { ...plan, accepted: !plan.accepted };
      })
    );
  };

  // Commit Accepted Meals to the Shared Group Cart
  const handleApplyToCart = () => {
    if (!selectedPlan) return;

    // Check if there is an active session, or create one for this restaurant
    let session = getSession(circleId);
    if (!session || session.restaurant_id !== selectedPlan.restaurantId) {
      session = startSession(circleId, selectedPlan.restaurantId, 30);
    }

    // Add accepted dishes to each member's portion
    let itemsAddedCount = 0;
    const acceptedPlans = customizedPlans.filter((p) => p.accepted);

    for (const plan of acceptedPlans) {
      // Duplicate prevention: check if user already has identical item in cart
      const existingInCart = cartItems.find(
        (ci) =>
          ci.session_id === session!.id &&
          ci.user_id === plan.userId &&
          ci.item_id === plan.recommendedDish.dishId
      );

      if (!existingInCart) {
        addToCart(
          session.id,
          circleId,
          {
            id: plan.recommendedDish.dishId,
            name: plan.recommendedDish.dishName,
            price_paise: plan.recommendedDish.pricePaise,
            is_veg: plan.recommendedDish.isVeg,
          },
          'Matched by CircleMatch AI',
          plan.userId
        );
        itemsAddedCount++;
      }
    }

    analyticsService.trackEvent('recommendation_accepted', circleId, session.id, currentUser.id, {
      planType: selectedPlan.type,
      acceptedMembersCount: acceptedPlans.length,
    });

    analyticsService.trackEvent('cart_added_from_ai', circleId, session.id, currentUser.id, {
      itemsAdded: itemsAddedCount,
      totalPaise: selectedPlan.subtotalPaise,
    });

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#FC8019', '#00A343', '#FFD700', '#171717'],
    });

    setCurrentStep(5);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (currentStep === 1 || currentStep === 5) {
          analyticsService.trackEvent('circlematch_abandoned', circleId, undefined, currentUser.id);
        }
        onClose();
      }}
      className="max-w-4xl max-h-[92vh] p-4 sm:p-6"
    >
      {/* =========================================================================
          SCREEN 1: GROUP PREFERENCE SETUP
         ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-charcoal-100 pb-4 pr-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-swiggy-light text-swiggy-dark font-extrabold text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-swiggy-orange animate-pulse" />
                CircleMatch AI
              </span>
              <span className="text-xs text-charcoal-400">•</span>
              <span className="text-xs font-bold text-charcoal-700">{circle?.name}</span>
            </div>
            <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">
              Group Cravings & Budget Setup
            </h2>
            <p className="text-xs text-charcoal-500 mt-1">
              Confirm each student&apos;s budget and cravings. The AI optimizer finds a single campus restaurant that satisfies everyone.
            </p>

            {/* Phase 4 Live MCP vs Demo Switcher */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-charcoal-100/60">
              <span className="text-[11px] font-bold text-charcoal-500">Live Menu Provider:</span>
              <button
                type="button"
                onClick={() => setDataSourceMode(dataSourceMode === 'live' ? 'demo' : 'live')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 border ${
                  dataSourceMode === 'live'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-orange-50 text-orange-800 border-orange-200'
                }`}
                title="Click to toggle between Swiggy Live Food MCP and Verified Campus Demo menus"
              >
                <span className={`w-2 h-2 rounded-full ${dataSourceMode === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-swiggy-orange'}`} />
                <span>{dataSourceMode === 'live' ? '🟢 Swiggy Food MCP (Live)' : '🏷️ Campus Verified Catalog'}</span>
              </button>
            </div>
          </div>

          {/* Members Preferences Grid */}
          <div className="space-y-4 max-h-[52vh] overflow-y-auto pr-1">
            {members.map((member) => {
              const pref = memberPrefs[member.user_id];
              if (!pref) return null;
              const isCurrentUser = member.user_id === currentUser.id;

              return (
                <div
                  key={member.id}
                  className={`p-4 rounded-2xl border transition ${
                    isCurrentUser
                      ? 'border-orange-300 bg-orange-50/40 shadow-xs'
                      : 'border-charcoal-100 bg-white'
                  }`}
                >
                  {/* Member Card Top */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-100/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden relative border border-white shadow-xs flex-shrink-0">
                        <Image
                          src={member.profile.avatar_url || ''}
                          alt={member.profile.full_name}
                          width={40}
                          height={40}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm text-charcoal-900">
                            {member.profile.full_name}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="orange" size="sm" className="text-[9px] py-0">
                              You
                            </Badge>
                          )}
                          <Badge
                            variant={pref.dietaryPref === 'VEG' ? 'success' : 'default'}
                            size="sm"
                            className="text-[9px] py-0"
                          >
                            {pref.dietaryPref === 'VEG' ? 'Strictly Veg' : 'Non-Veg Allowed'}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-charcoal-500">
                          {member.profile.academic_year}
                        </p>
                      </div>
                    </div>

                    {/* Budget Preset Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-charcoal-500 mr-1">
                        Budget:
                      </span>
                      {[130, 180, 220, 260].map((b) => {
                        const isSelected = pref.budgetPaise === b * 100;
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => updateStudentPref(member.user_id, { budgetPaise: b * 100 })}
                            className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                              isSelected
                                ? 'bg-charcoal-900 text-white shadow-xs'
                                : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
                            }`}
                          >
                            ₹{b}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cravings Selector */}
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-charcoal-700 text-[11px]">
                        What is {member.profile.full_name.split(' ')[0]} craving?
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-charcoal-400 font-semibold">Hunger:</span>
                        {(['light', 'regular', 'hungry'] as HungerLevel[]).map((hl) => (
                          <button
                            key={hl}
                            type="button"
                            onClick={() => updateStudentPref(member.user_id, { hungerLevel: hl })}
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold capitalize transition ${
                              pref.hungerLevel === hl
                                ? 'bg-swiggy-orange text-white'
                                : 'bg-charcoal-100 text-charcoal-600'
                            }`}
                          >
                            {hl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_CRAVINGS.map((craving) => {
                        const active = pref.cravings.includes(craving);
                        return (
                          <button
                            key={craving}
                            type="button"
                            onClick={() => toggleCraving(member.user_id, craving)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                              active
                                ? 'border-swiggy-orange bg-swiggy-light text-swiggy-dark font-bold'
                                : 'border-charcoal-200 bg-white text-charcoal-600 hover:bg-charcoal-50'
                            }`}
                          >
                            {craving}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Allergy Safety Notice */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Allergen Notice:</strong> Recommendations filter declared menu ingredients, but demo campus canteens cannot be guaranteed allergen or cross-contact safe.
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-charcoal-100">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>

            <Button
              size="lg"
              className="rounded-2xl font-black text-xs sm:text-sm gap-2 shadow-md px-6 bg-swiggy-orange hover:bg-swiggy-hover text-white"
              onClick={handleStartMatching}
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Group Matches</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: MATCHING EXPERIENCE (COMPUTATION ANIMATION)
         ========================================================================= */}
      {currentStep === 2 && (
        <div className="py-16 text-center space-y-6 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-swiggy-orange to-amber-500 text-white flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
            ✨
          </div>

          <div>
            <h3 className="text-2xl font-black text-charcoal-900 tracking-tight">
              CircleMatch AI is Optimizing...
            </h3>
            <p className="text-xs text-charcoal-500 mt-1">
              Evaluating multi-member constraints across 6 campus restaurants
            </p>
          </div>

          {/* Real progressive stages */}
          <div className="space-y-3 text-left p-4 rounded-2xl bg-charcoal-50 border border-charcoal-100 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Read preferences for {members.length} participating students</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Strict vegetarian boundary isolation enforced</span>
            </div>
            <div className="flex items-center gap-2 text-swiggy-dark font-bold animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-swiggy-orange border-t-transparent animate-spin" />
              <span>Evaluating individual budget limits & calculating group fairness...</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: AI RECOMMENDATION RESULTS (3 DISTINCT PLANS)
         ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="border-b border-charcoal-100 pb-3 pr-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="orange" size="sm" className="font-extrabold uppercase">
                  Top 3 AI Matches
                </Badge>
                <span className="text-xs text-charcoal-500 font-medium">
                  for {circle?.name} ({members.length} members)
                </span>
              </div>
              <h2 className="text-2xl font-black text-charcoal-900 tracking-tight mt-1">
                Recommended Group Meal Plans
              </h2>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(1)}
              className="rounded-xl text-xs font-bold gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Edit Cravings</span>
            </Button>
          </div>

          {recommendations.length === 0 ? (
            <div className="p-8 text-center space-y-3 bg-red-50 rounded-2xl border border-red-200">
              <p className="text-2xl">⚠️</p>
              <h4 className="font-bold text-red-900">No Single Restaurant Matched All Constraints</h4>
              <p className="text-xs text-red-700 max-w-md mx-auto">
                The current combination of student budgets and strict cravings is too tight across all 6 campus menus. Try slightly increasing budgets or relaxing cravings.
              </p>
              <Button size="sm" onClick={() => setCurrentStep(1)}>
                Adjust Preferences
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[58vh] overflow-y-auto pr-1">
              {recommendations.map((plan) => {
                const isBestOverall = plan.type === 'best_overall';

                return (
                  <div
                    key={plan.id}
                    className={`rounded-3xl border p-5 flex flex-col justify-between transition-all group ${
                      isBestOverall
                        ? 'border-swiggy-orange bg-gradient-to-b from-orange-50/50 to-white shadow-md ring-1 ring-orange-200'
                        : 'border-charcoal-200 bg-white hover:border-charcoal-300 hover:shadow-card'
                    }`}
                  >
                    <div>
                      {/* Plan Category Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            isBestOverall
                              ? 'bg-swiggy-orange text-white'
                              : plan.type === 'budget_friendly'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {plan.title}
                        </span>

                        <div className="flex items-center gap-1 text-xs font-black text-charcoal-900 bg-charcoal-100 px-2 py-0.5 rounded-lg">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{plan.groupSatisfactionScore}% match</span>
                        </div>
                      </div>

                      {/* Restaurant Image & Info */}
                      <div className="h-28 w-full rounded-2xl overflow-hidden relative mb-3 bg-charcoal-100">
                        <Image
                          src={plan.restaurantImage}
                          alt={plan.restaurantName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                          <p className="text-white font-extrabold text-sm drop-shadow-sm">
                            {plan.restaurantName}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed mb-3">
                        {plan.aiExplanation}
                      </p>

                      {/* Per-member Meal Snapshot */}
                      <div className="space-y-1.5 py-2 border-t border-charcoal-100/80">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
                          Recommended Dishes:
                        </p>
                        {plan.memberPlans.map((mp) => (
                          <div
                            key={mp.userId}
                            className="flex items-center justify-between text-xs py-0.5"
                          >
                            <span className="text-charcoal-700 truncate max-w-[130px] font-medium flex items-center gap-1">
                              {mp.recommendedDish.isVeg ? (
                                <span className="veg-icon !w-2.5 !h-2.5 scale-75" />
                              ) : (
                                <span className="non-veg-icon !w-2.5 !h-2.5 scale-75" />
                              )}
                              <span>{mp.recommendedDish.dishName}</span>
                            </span>
                            <span className="font-mono text-charcoal-900 font-bold text-[11px]">
                              {formatPaise(mp.dishCostPaise)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer: Total & CTA */}
                    <div className="mt-4 pt-3 border-t border-charcoal-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-charcoal-500 font-medium">Group Subtotal</p>
                        <p className="text-base font-black text-charcoal-900">
                          {formatPaise(plan.subtotalPaise)}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant={isBestOverall ? 'primary' : 'outline'}
                        className="rounded-xl font-bold text-xs gap-1 shadow-xs"
                        onClick={() => handleSelectPlanForCustomization(plan)}
                      >
                        <span>View Plan</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SCREEN 4: DETAILED GROUP MEAL PLAN & INDIVIDUAL CUSTOMIZATION
         ========================================================================= */}
      {currentStep === 4 && selectedPlan && (
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-charcoal-100 pb-3 pr-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-bold text-swiggy-orange hover:underline flex items-center gap-1"
                >
                  ← Back to 3 Recommendations
                </button>
                <span className="text-xs text-charcoal-400">•</span>
                <span className="text-xs font-bold text-charcoal-700">
                  {selectedPlan.restaurantName} ({selectedPlan.title})
                </span>
              </div>
              <h2 className="text-2xl font-black text-charcoal-900 tracking-tight mt-1">
                Personalized Dishes & Acceptance
              </h2>
            </div>

            <Badge variant="success" size="sm" className="font-bold">
              {selectedPlan.groupSatisfactionScore}% Satisfaction
            </Badge>
          </div>

          {/* Member Interactive Cards */}
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {customizedPlans.map((plan) => {
              const isCurrentUser = plan.userId === currentUser.id;

              return (
                <div
                  key={plan.userId}
                  className={`p-4 rounded-2xl border transition ${
                    plan.accepted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-charcoal-200 bg-charcoal-50 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden relative border border-white shadow-xs flex-shrink-0">
                        <Image
                          src={plan.userAvatar || ''}
                          alt={plan.userName}
                          width={40}
                          height={40}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm text-charcoal-900">
                            {plan.userName}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="orange" size="sm" className="text-[9px] py-0">
                              You
                            </Badge>
                          )}
                          <span className="text-xs text-charcoal-400">
                            Budget: {formatPaise(plan.budgetPaise)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          {plan.recommendedDish.isVeg ? (
                            <span className="veg-icon" />
                          ) : (
                            <span className="non-veg-icon" />
                          )}
                          <span className="font-bold text-sm text-charcoal-900">
                            {plan.recommendedDish.dishName}
                          </span>
                          <span className="font-black text-sm text-swiggy-orange">
                            {formatPaise(plan.dishCostPaise)}
                          </span>
                        </div>

                        <p className="text-[11px] text-charcoal-500 mt-0.5">
                          ✨ Why: {plan.recommendedDish.matchReason}
                        </p>
                      </div>
                    </div>

                    {/* Member Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {plan.alternativeDishes.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSwappingUser(plan.userId)}
                          className="text-xs font-bold rounded-xl"
                        >
                          Swap Dish ({plan.alternativeDishes.length})
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant={plan.accepted ? 'primary' : 'outline'}
                        onClick={() => toggleMealAcceptance(plan.userId)}
                        className="rounded-xl text-xs font-bold gap-1"
                      >
                        {plan.accepted ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Accepted</span>
                          </>
                        ) : (
                          <span>Accept</span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Swap Alternative Dish Modal */}
          {swappingUser && (
            <Modal
              isOpen={true}
              onClose={() => setSwappingUser(null)}
              title="Select Alternative Dish"
              description="Pick from other validated dishes within student budget & dietary constraints."
            >
              <div className="space-y-3 pt-2">
                {customizedPlans
                  .find((p) => p.userId === swappingUser)
                  ?.alternativeDishes.map((alt) => (
                    <div
                      key={alt.dishId}
                      className="p-3 rounded-2xl border border-charcoal-200 hover:border-swiggy-orange flex items-center justify-between cursor-pointer transition"
                      onClick={() => handleSwapDish(swappingUser, alt)}
                    >
                      <div className="flex items-center gap-2">
                        {alt.isVeg ? <span className="veg-icon" /> : <span className="non-veg-icon" />}
                        <div>
                          <p className="font-bold text-xs text-charcoal-900">{alt.dishName}</p>
                          <p className="text-[10px] text-charcoal-500">{alt.matchReason}</p>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-charcoal-900">
                        {formatPaise(alt.pricePaise)}
                      </span>
                    </div>
                  ))}
              </div>
            </Modal>
          )}

          {/* Total & Commit to Cart */}
          <div className="pt-3 border-t border-charcoal-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-charcoal-500 font-semibold">
                Circle Total ({customizedPlans.filter((p) => p.accepted).length} accepted)
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-black text-charcoal-900">
                  {formatPaise(
                    customizedPlans
                      .filter((p) => p.accepted)
                      .reduce((s, p) => s + p.dishCostPaise, 0)
                  )}
                </p>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  FREE Group Delivery
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full sm:w-auto rounded-2xl font-bold text-sm shadow-md gap-2"
              onClick={handleApplyToCart}
              disabled={customizedPlans.filter((p) => p.accepted).length === 0}
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Add Accepted Meals to Circle Cart</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 5: CART SUCCESS & CONFIRMATION
         ========================================================================= */}
      {currentStep === 5 && selectedPlan && (
        <div className="py-12 text-center space-y-5 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-md">
            ✓
          </div>

          <div>
            <h3 className="text-2xl font-black text-charcoal-900 tracking-tight">
              Added to Circle Cart!
            </h3>
            <p className="text-xs text-charcoal-500 mt-1">
              Dishes for {customizedPlans.filter((p) => p.accepted).length} students from{' '}
              <strong>{selectedPlan.restaurantName}</strong> are now live in the collaborative group cart.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-charcoal-200 text-xs text-left space-y-1.5">
            <p className="font-bold text-charcoal-800">Next Step:</p>
            <p className="text-charcoal-600">
              Review your shared cart with your circle mates, and have your Circle Admin lock and finalize the simulated order.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              size="lg"
              className="w-full rounded-2xl font-bold text-sm shadow-md"
              onClick={onClose}
            >
              Open Group Cart Now
            </Button>
            <Button
              variant="outline"
              size="md"
              className="w-full rounded-2xl font-bold text-xs border-orange-200 text-swiggy-dark hover:bg-orange-50 flex items-center justify-center gap-2"
              onClick={() => setShowSwiggyCartSync(true)}
            >
              <ShoppingBag className="w-4 h-4 text-swiggy-orange" />
              <span>Sync to Swiggy App Cart (Food MCP)</span>
            </Button>
          </div>
        </div>
      )}

      {showSwiggyCartSync && selectedPlan && (
        <SwiggyCartSyncModal
          isOpen={showSwiggyCartSync}
          onClose={() => setShowSwiggyCartSync(false)}
          restaurantId={selectedPlan.restaurantId}
          restaurantName={selectedPlan.restaurantName}
          cartItems={cartItems}
          circleId={circleId}
        />
      )}
    </Modal>
  );
}
