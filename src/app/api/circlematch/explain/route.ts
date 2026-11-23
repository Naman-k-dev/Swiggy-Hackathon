import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { geminiService } from '@/lib/services/gemini-service';

const RequestSchema = z.object({
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

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = RequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { restaurantName, planType, groupSatisfactionScore, totalRupees, memberPlans } =
      parsed.data;

    // 1. Attempt Gemini 1.5 Flash via dedicated service client
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
