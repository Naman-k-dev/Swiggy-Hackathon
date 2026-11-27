import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pilotLabService } from '@/lib/pilot/pilot-lab-service';
import { sanitizeInputString } from '@/lib/security/circleguard';

const ExperimentSchema = z.object({
  experimentType: z.enum(['whatsapp_baseline', 'campus_circles']),
  groupName: z.string().min(1, 'Group name is required'),
  participantCount: z.number().min(2).max(20),
  restaurantChoiceDurationSec: z.number().min(0),
  foodSelectionDurationSec: z.number().min(0),
  coordinationIssuesCount: z.number().min(0),
  completedDraftOrder: z.boolean(),
  satisfactionRating: z.number().min(1).max(5),
  notes: z.string().max(800).optional(),
  recordedBy: z.enum(['manual_researcher', 'automatic_telemetry']).default('automatic_telemetry'),
  isSimulatedDemo: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ExperimentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid experiment payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const sanitizedGroup = sanitizeInputString(data.groupName);
    const sanitizedNotes = data.notes ? sanitizeInputString(data.notes) : undefined;

    const record = pilotLabService.recordExperiment({
      experimentType: data.experimentType,
      groupName: sanitizedGroup,
      participantCount: data.participantCount,
      restaurantChoiceDurationSec: data.restaurantChoiceDurationSec,
      foodSelectionDurationSec: data.foodSelectionDurationSec,
      coordinationIssuesCount: data.coordinationIssuesCount,
      completedDraftOrder: data.completedDraftOrder,
      satisfactionRating: data.satisfactionRating,
      notes: sanitizedNotes,
      recordedBy: data.recordedBy,
      isSimulatedDemo: Boolean(data.isSimulatedDemo),
    });

    return NextResponse.json({
      success: true,
      message: 'Ordering experiment observation recorded.',
      experimentId: record.id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Experiment recording failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDemo = searchParams.get('includeDemo') === 'true';
    const experiments = pilotLabService.getExperiments(includeDemo);

    return NextResponse.json({
      success: true,
      count: experiments.length,
      experiments,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve experiments';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
