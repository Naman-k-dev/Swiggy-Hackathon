import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pilotLabService } from '@/lib/pilot/pilot-lab-service';
import { sanitizeInputString } from '@/lib/security/circleguard';

const ConsentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  studentName: z.string().min(1, 'Student name is required'),
  consentGiven: z.boolean(),
  studyCohort: z.string().default('PW IOI Noida - Batch 2026'),
  action: z.enum(['grant', 'withdraw']).default('grant'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ConsentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid consent payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.action === 'withdraw') {
      pilotLabService.withdrawConsent(data.userId);
      return NextResponse.json({
        success: true,
        message: 'Pilot research consent withdrawn. All personal survey responses purged.',
      });
    }

    const consent = pilotLabService.recordConsent({
      userId: data.userId,
      studentName: sanitizeInputString(data.studentName),
      consentGiven: data.consentGiven,
      studyCohort: sanitizeInputString(data.studyCohort),
    });

    return NextResponse.json({
      success: true,
      message: 'Informed research consent recorded.',
      consent,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Consent recording failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const hasConsented = pilotLabService.hasConsented(userId);
    const consent = pilotLabService.getConsent(userId);

    return NextResponse.json({
      hasConsented,
      consent,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to check consent';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
