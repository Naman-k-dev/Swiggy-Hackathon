import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pilotLabService } from '@/lib/pilot/pilot-lab-service';
import { sanitizeInputString } from '@/lib/security/circleguard';

const SurveySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  studentName: z.string().min(1, 'Student name is required'),
  orderingFrequency: z.enum(['daily', 'multiple_times_week', 'once_a_week', 'rarely']),
  friendsOrderingFrequency: z.enum(['daily', 'multiple_times_week', 'once_a_week', 'rarely']),
  coordinationProblems: z.array(z.string()).min(1, 'Select at least one option'),
  typicalBudgetRange: z.enum(['under_150', '150_250', '250_400', 'above_400']),
  timeSpentChoosingMins: z.enum(['under_5', '5_15', '15_30', 'above_30']),
  splittingDifficultyScore: z.number().min(1).max(5),
  deliveryCoordinationDifficulty: z.number().min(1).max(5),
  willingnessToReuse: z.number().min(1).max(5),
  mostUsefulFeature: z.string().min(1, 'Feature selection is required'),
  leastUsefulFeature: z.string().min(1, 'Feature selection is required'),
  writtenSuggestions: z.string().max(1000).optional(),
  isSimulatedDemo: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SurveySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid survey submission', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Sanitize user-provided text against XSS
    const sanitizedStudentName = sanitizeInputString(data.studentName);
    const sanitizedSuggestions = data.writtenSuggestions
      ? sanitizeInputString(data.writtenSuggestions)
      : undefined;

    // Record survey
    const newSurvey = pilotLabService.submitSurvey({
      userId: data.userId,
      studentName: sanitizedStudentName,
      orderingFrequency: data.orderingFrequency,
      friendsOrderingFrequency: data.friendsOrderingFrequency,
      coordinationProblems: data.coordinationProblems.map((p) => sanitizeInputString(p)),
      typicalBudgetRange: data.typicalBudgetRange,
      timeSpentChoosingMins: data.timeSpentChoosingMins,
      splittingDifficultyScore: data.splittingDifficultyScore,
      deliveryCoordinationDifficulty: data.deliveryCoordinationDifficulty,
      willingnessToReuse: data.willingnessToReuse,
      mostUsefulFeature: sanitizeInputString(data.mostUsefulFeature),
      leastUsefulFeature: sanitizeInputString(data.leastUsefulFeature),
      writtenSuggestions: sanitizedSuggestions,
      isSimulatedDemo: Boolean(data.isSimulatedDemo),
    });

    return NextResponse.json({
      success: true,
      message: 'Student research survey recorded with informed consent.',
      surveyId: newSurvey.id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Survey submission failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDemo = searchParams.get('includeDemo') === 'true';
    const summary = pilotLabService.getSummary(includeDemo);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve survey summary';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
