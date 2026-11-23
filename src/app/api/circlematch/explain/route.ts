import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { geminiService } from '@/lib/services/gemini-service';

const GroupPlanSchema = z.object({
  action: z.literal('group_plan').optional(),
  restaurantName: z.string(),
  planType: z.enum(['best_overall', 'budget_friendly', 'crowd_pleaser']),
  groupSatisfactionScore: z.number().min(0).max(100),
  totalRupees: z.number(),
  memberPlans: z.array(
    z.object({
      userName: z.string(),
      dietaryPref: z.string(),
      budgetRupees: z.number(),
      dishName: z.string(),
      dishPriceRupees: z.number(),
      matchReason: z.string(),
    })
  ),
});

const VoteDecisionSchema = z.object({
  action: z.literal('vote_decision'),
  winningRestaurantName: z.string(),
  voteCount: z.number().min(0),
  totalVotes: z.number().min(0),
  groupCompatibilityScore: z.number().min(0).max(100),
  subtotalRupees: z.number(),
  dietaryNotes: z.string(),
  isTieBreak: z.boolean(),
  tieBreakReason: z.string().optional(),
});

const OrderRescueSchema = z.object({
  action: z.literal('order_rescue'),
  issueType: z.enum(['dish_unavailable', 'budget_exceeded', 'dietary_conflict', 'member_selection_change']),
  restaurantName: z.string(),
  affectedStudentName: z.string(),
  dietaryPref: z.string(),
  originalDishName: z.string(),
  replacementDishName: z.string(),
  priceDiffRupees: z.number(),
  safetyNote: z.string(),
});

const RequestUnionSchema = z.discriminatedUnion('action', [
  VoteDecisionSchema,
  OrderRescueSchema,
]);

/**
 * GET: Safe server-side health check verifying Gemini authentication without leaking credentials.
 */
export async function GET() {
  const result = await geminiService.testAuthentication();
  return NextResponse.json({
    status: result.authenticated ? 'ready' : 'fallback',
    authenticated: result.authenticated,
    modelUsed: result.modelUsed,
    message: result.message,
    code: result.errorCode,
  });
}

/**
 * POST: Handles contextual explanations for Group Plans, CircleVote, and Order Rescue.
 */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    // Check for Vote Decision or Order Rescue action
    if (json.action === 'vote_decision' || json.action === 'order_rescue') {
      const parsed = RequestUnionSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid payload', details: parsed.error.format() },
          { status: 400 }
        );
      }

      if (parsed.data.action === 'vote_decision') {
        const d = parsed.data;
        const geminiResult = await geminiService.generateVoteExplanation(d);
        if (geminiResult.success && geminiResult.explanation) {
          return NextResponse.json({
            explanation: geminiResult.explanation,
            provider: 'gemini',
            modelUsed: geminiResult.modelUsed,
          });
        }

        // Deterministic fallback for CircleVote
        const fallbackText = d.isTieBreak && d.tieBreakReason
          ? `Democratic Decision: ${d.winningRestaurantName} emerged victorious with ${d.voteCount} votes. ${d.tieBreakReason} ${d.dietaryNotes}`
          : `${d.winningRestaurantName} won the circle vote with ${d.voteCount} of ${d.totalVotes} votes. It satisfies group preferences with ${d.groupCompatibilityScore}% compatibility at ₹${d.subtotalRupees} subtotal.`;

        return NextResponse.json({
          explanation: fallbackText,
          provider: 'deterministic',
          diagnostics: geminiResult.error ? { geminiError: geminiResult.error, code: geminiResult.errorCode } : undefined,
        });
      }

      if (parsed.data.action === 'order_rescue') {
        const d = parsed.data;
        const geminiResult = await geminiService.generateRescueExplanation(d);
        if (geminiResult.success && geminiResult.explanation) {
          return NextResponse.json({
            explanation: geminiResult.explanation,
            provider: 'gemini',
            modelUsed: geminiResult.modelUsed,
          });
        }

        // Deterministic fallback for Order Rescue
        const diffText = d.priceDiffRupees === 0
          ? 'at the exact same price'
          : d.priceDiffRupees > 0
          ? `for an additional ₹${d.priceDiffRupees}`
          : `saving ₹${Math.abs(d.priceDiffRupees)}`;

        const fallbackText = `Order Rescued: "${d.replacementDishName}" replaces "${d.originalDishName}" from ${d.restaurantName} ${diffText}. ${d.safetyNote} Keeps delivery unified for the circle.`;

        return NextResponse.json({
          explanation: fallbackText,
          provider: 'deterministic',
          diagnostics: geminiResult.error ? { geminiError: geminiResult.error, code: geminiResult.errorCode } : undefined,
        });
      }
    }

    // Default: Group Plan Explanation (backwards compatible)
    const parsed = GroupPlanSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { restaurantName, planType, groupSatisfactionScore, totalRupees, memberPlans } =
      parsed.data;

    // 1. Attempt Gemini Flash via official SDK
    const geminiResult = await geminiService.generateGroupExplanation({
      restaurantName,
      planType,
      groupSatisfactionScore,
      totalRupees,
      memberPlans,
    });

    if (geminiResult.success && geminiResult.explanation) {
      return NextResponse.json({
        explanation: geminiResult.explanation,
        provider: 'gemini',
        modelUsed: geminiResult.modelUsed,
      });
    }

    // 2. Grounded, Deterministic Fallback Engine
    const vegStudents = memberPlans.filter((m) => m.dietaryPref === 'VEG');
    const vegText =
      vegStudents.length > 0
        ? `Strict vegetarian boundaries for ${vegStudents.map((v) => v.userName).join(', ')} are 100% preserved.`
        : 'All dietary choices are fully satisfied.';

    let fallbackText = '';
    if (planType === 'best_overall') {
      fallbackText = `${restaurantName} achieves a standout ${groupSatisfactionScore}% group satisfaction. ${vegText} Every student's dish stays within pocket-friendly limits, coming to an overall ₹${totalRupees} group total.`;
    } else if (planType === 'budget_friendly') {
      fallbackText = `At just ₹${totalRupees} for the entire circle, ${restaurantName} is the most economical choice. ${vegText} Each student gets a filling portion without stretching their allowance.`;
    } else {
      fallbackText = `${restaurantName} delivers maximum fairness across the squad. No single member is forced to compromise on taste or budget, giving everyone an equitable ${groupSatisfactionScore}% satisfaction rating.`;
    }

    return NextResponse.json({
      explanation: fallbackText,
      provider: 'deterministic',
      diagnostics: geminiResult.error ? { geminiError: geminiResult.error, code: geminiResult.errorCode } : undefined,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', message: errMsg },
      { status: 500 }
    );
  }
}
