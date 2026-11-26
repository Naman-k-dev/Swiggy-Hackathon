import { NextResponse } from 'next/server';
import { generateSecurityAuditLog } from '@/lib/security/circleguard';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, circleId, note, action } = body;

    if (!userId || !circleId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (action === 'approve') {
      // Audit approval
      generateSecurityAuditLog({
        userId,
        action: 'approve_join_request',
        resourceType: 'circle_join_request',
        resourceId: circleId,
        severity: 'info',
        metadata: { circleId }
      });

      return NextResponse.json({
        success: true,
        message: 'Join request approved successfully. Student added to circle.',
        status: 'approved',
      });
    }

    if (action === 'reject') {
      return NextResponse.json({
        success: true,
        message: 'Join request rejected.',
        status: 'rejected',
      });
    }

    // Default: create join request
    const requestId = `REQ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    generateSecurityAuditLog({
      userId,
      action: 'create_join_request',
      resourceType: 'circle_join_request',
      resourceId: requestId,
      severity: 'info',
      metadata: { circleId, note }
    });

    return NextResponse.json({
      success: true,
      message: 'Join request sent successfully to circle admin.',
      requestId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}
