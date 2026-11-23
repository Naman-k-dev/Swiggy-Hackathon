import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key is available, invoke server-side Gemini API
    if (apiKey) {
      try {
        const prompt = `You are CircleMatch AI, an intelligent dining assistant for Indian college students.
Explain why "${restaurantName}" was selected for this group in 2-3 friendly, student-focused sentences.
Context:
- Plan Category: ${planType}
- Group Satisfaction: ${groupSatisfactionScore}%
- Total Cost: ₹${totalRupees}
- Member Choices:
${memberPlans
  .map(
    (m) =>
      `  * ${m.userName} (${m.dietaryPref}, Budget ₹${m.budgetRupees}): Recommended "${m.dishName}" at ₹${m.dishPriceRupees} (${m.matchReason})`
  )
  .join('\n')}

Rules:
1. Mention individual students by name, confirming their dietary restrictions (especially vegetarians) and budgets were strictly respected.
2. Emphasize why this restaurant balances everyone's cravings without budget overruns.
3. Keep it under 65 words. Do not invent any new dishes or prices.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                maxOutputTokens: 120,
                temperature: 0.3,
              },
            }),
            signal: AbortSignal.timeout(4000), // 4 second hard timeout
          }
        );

        if (response.ok) {
          const data = await response.json();
          const generatedText =
            data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

          if (generatedText) {
            return NextResponse.json({
              explanation: generatedText,
              provider: 'gemini',
            });
          }
        }
      } catch {
        // Fall through to deterministic generator on timeout or API error
      }
    }

    // Graceful, Grounded Deterministic Fallback
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
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', message: errMsg },
      { status: 500 }
    );
  }
}
