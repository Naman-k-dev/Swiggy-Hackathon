// ==============================================================================
// SWIGGY CAMPUS CIRCLES - CIRCLEGUARD SECURITY & AUDIT SYSTEM
// Provides secure backend helpers, authorization validation, and audit logging
// ==============================================================================

export interface SecurityAuditEvent {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  severity: 'info' | 'warning' | 'critical';
  metadata?: Record<string, unknown>;
}

export function validateCartItemOwnership(
  tokenUserId: string,
  itemUserId: string
): boolean {
  if (!tokenUserId || !itemUserId) return false;
  return tokenUserId === itemUserId;
}

export function validateAdminPrivilege(
  adminId: string,
  requesterId: string
): boolean {
  if (!adminId || !requesterId) return false;
  return adminId === requesterId;
}

export function sanitizeInputString(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .trim();
}

export function generateSecurityAuditLog(event: SecurityAuditEvent): {
  logId: string;
  timestamp: string;
  status: string;
} {
  const logId = `AUDIT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const timestamp = new Date().toISOString();

  // In production / database, this writes to security_audit_events table
  console.log(`[CircleGuard Audit] [${event.severity.toUpperCase()}] ${event.action} by ${event.userId} on ${event.resourceType}:${event.resourceId || 'N/A'}`, event.metadata || {});

  return {
    logId,
    timestamp,
    status: 'recorded',
  };
}
