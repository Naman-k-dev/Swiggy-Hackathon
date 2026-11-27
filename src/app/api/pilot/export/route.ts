import { NextRequest, NextResponse } from 'next/server';
import { pilotLabService } from '@/lib/pilot/pilot-lab-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDemo = searchParams.get('includeDemo') === 'true';

    // Generate strict RFC 4180 CSV
    const csvData = pilotLabService.exportResearchDataCSV(includeDemo);

    const filename = includeDemo
      ? 'swiggy_campus_pilot_research_demo_simulated.csv'
      : 'swiggy_campus_pilot_research_real_consented.csv';

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
