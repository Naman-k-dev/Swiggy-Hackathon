import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock audit trail for security history screen
    const mockAuditTrail = [
      {
        id: 'evt-1',
        action: 'Login Successful',
        resourceType: 'auth',
        severity: 'info',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
      },
      {
        id: 'evt-2',
        action: 'Circle Created',
        resourceType: 'circle',
        resourceId: 'circle-123',
        severity: 'info',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1d ago
      },
      {
        id: 'evt-3',
        action: 'BuddyMatch Discovery Opt-in',
        resourceType: 'buddy_match_preferences',
        severity: 'info',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12h ago
      },
      {
        id: 'evt-4',
        action: 'Join Request Approved',
        resourceType: 'circle_join_request',
        resourceId: 'req-456',
        severity: 'info',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30m ago
      },
      {
        id: 'evt-5',
        action: 'Suspicious IP Attempt Blocked',
        resourceType: 'auth',
        severity: 'warning',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2d ago
      }
    ];

    return NextResponse.json({
      success: true,
      events: mockAuditTrail,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
