/**
 * Server-Side Security & Backend Authorization Rules
 * Swiggy Campus Circles
 *
 * Enforces strict backend authorization rules that cannot be bypassed by client state:
 * 1. Cart Item Ownership: Members can ONLY insert, update, or delete their own cart items.
 * 2. Session Management: ONLY circle admins can lock, finalize, cancel, or modify ordering sessions.
 * 3. Cutoff Deadline Enforcement: Cart mutations are strictly forbidden once session cutoff time has passed.
 * 4. Invitation Verification: Users can ONLY join a circle if they provide the valid circle invite code.
 * 5. Demo Persona Isolation: Demo personas and synthetic IDs cannot access, overwrite, or mutate real authenticated user records.
 */

export interface AuthUser {
  id: string;
  isDemo?: boolean;
}

export interface AuthCircle {
  id: string;
  adminId: string;
  inviteCode: string;
}

export interface AuthOrderingSession {
  id: string;
  circleId: string;
  status: 'open' | 'locked' | 'finalized' | 'cancelled';
  cutoffTime?: string | null;
}

export interface AuthCartItem {
  id: string;
  sessionId: string;
  circleId: string;
  userId: string;
}

export class AuthorizationError extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code = 'UNAUTHORIZED', statusCode = 403) {
    super(message);
    this.name = 'AuthorizationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Checks if a user is authorized to modify (insert/update/delete) a cart item.
 * Must be the owner, the session must be open, and cutoff deadline must not have passed.
 */
export function canModifyCartItem(
  user: AuthUser,
  cartItem: AuthCartItem,
  session: AuthOrderingSession,
  isMember: boolean
): { allowed: boolean; reason?: string } {
  if (!isMember) {
    return { allowed: false, reason: 'User is not a member of this circle.' };
  }

  if (cartItem.userId !== user.id) {
    return { allowed: false, reason: 'Members cannot modify other members’ cart items.' };
  }

  if (session.status !== 'open') {
    return { allowed: false, reason: `Ordering session is ${session.status}. Cart items cannot be modified.` };
  }

  if (session.cutoffTime) {
    const cutoffDate = new Date(session.cutoffTime).getTime();
    if (Date.now() > cutoffDate) {
      return { allowed: false, reason: 'Session order cutoff deadline has expired.' };
    }
  }

  return { allowed: true };
}

/**
 * Checks if a user is authorized to manage an ordering session (lock, finalize, update cutoff).
 * Must be the circle admin.
 */
export function canManageSession(
  user: AuthUser,
  circle: AuthCircle
): { allowed: boolean; reason?: string } {
  if (circle.adminId !== user.id) {
    return { allowed: false, reason: 'Only the circle admin can manage ordering sessions.' };
  }
  return { allowed: true };
}

/**
 * Checks if an invite code is valid for joining a circle.
 */
export function canJoinCircle(
  circle: AuthCircle,
  providedInviteCode: string
): { allowed: boolean; reason?: string } {
  if (!providedInviteCode || providedInviteCode.trim().toUpperCase() !== circle.inviteCode.toUpperCase()) {
    return { allowed: false, reason: 'Invalid or expired circle invite code.' };
  }
  return { allowed: true };
}

/**
 * Validates that demo personas cannot mutate or access real authenticated Supabase records.
 */
export function validateAccountIsolation(
  requestUser: AuthUser,
  targetRecordOwnerId: string,
  isTargetDemoRecord: boolean
): { allowed: boolean; reason?: string } {
  // Demo personas cannot write to real authenticated accounts
  if (requestUser.isDemo && !isTargetDemoRecord) {
    return { allowed: false, reason: 'Demo personas cannot modify real authenticated user data.' };
  }

  // Real users cannot be spoofed by mismatched IDs
  if (requestUser.id !== targetRecordOwnerId) {
    return { allowed: false, reason: 'Cannot mutate data belonging to another user account.' };
  }

  return { allowed: true };
}
