import { NextResponse } from 'next/server';
import { sanitizeInputString, generateSecurityAuditLog } from '@/lib/security/circleguard';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, isDiscoveryEnabled, preferredMealWindow, budgetMinPaise, budgetMaxPaise, cuisineInterests } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized user ID' }, { status: 401 });
    }

    const sanitizedInterests = Array.isArray(cuisineInterests)
      ? cuisineInterests.map((c: string) => sanitizeInputString(c))
      : [];

    // Log security audit event
    generateSecurityAuditLog({
      userId,
      action: 'update_buddymatch_preferences',
      resourceType: 'buddy_match_preferences',
      resourceId: userId,
      severity: 'info',
      metadata: { isDiscoveryEnabled, preferredMealWindow, budgetMinPaise, budgetMaxPaise }
    });

    return NextResponse.json({
      success: true,
      message: 'BuddyMatch preferences updated successfully',
      data: {
        userId,
        isDiscoveryEnabled,
        preferredMealWindow,
        budgetMinPaise,
        budgetMaxPaise,
        cuisineInterests: sanitizedInterests,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}
