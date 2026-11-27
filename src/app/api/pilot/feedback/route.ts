import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pilotLabService } from '@/lib/pilot/pilot-lab-service';
import { sanitizeInputString } from '@/lib/security/circleguard';

const FeedbackSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  circleId: z.string().min(1, 'Circle ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  wasFlowEasy: z.boolean(),
  satisfactionScore: z.number().min(1).max(5),
  confusingStep: z.string().optional(),
  wouldUseAgain: z.boolean(),
  improvementSuggestions: z.string().max(800).optional(),
  isSimulatedDemo: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = FeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid post-order feedback payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const sanitizedComments = data.improvementSuggestions
      ? sanitizeInputString(data.improvementSuggestions)
      : undefined;

    const record = pilotLabService.submitSessionFeedback({
      orderId: data.orderId,
      circleId: data.circleId,
      userId: data.userId,
      wasFlowEasy: data.wasFlowEasy,
      satisfactionScore: data.satisfactionScore,
      confusingStep: data.confusingStep ? sanitizeInputString(data.confusingStep) : undefined,
      wouldUseAgain: data.wouldUseAgain,
      improvementSuggestions: sanitizedComments,
      isSimulatedDemo: Boolean(data.isSimulatedDemo),
    });

    return NextResponse.json({
      success: true,
      message: 'Post-order pilot feedback submitted successfully.',
      feedbackId: record.id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Feedback submission failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDemo = searchParams.get('includeDemo') === 'true';
    const feedbackList = pilotLabService.getSessionFeedback(includeDemo);

    return NextResponse.json({
      success: true,
      count: feedbackList.length,
      feedback: feedbackList,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve feedback list';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
