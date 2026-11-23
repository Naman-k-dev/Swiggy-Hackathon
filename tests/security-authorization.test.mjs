import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canModifyCartItem,
  canManageSession,
  canJoinCircle,
  validateAccountIsolation,
} from '../src/lib/security/authorization.ts';

test('Security Authorization Suite', async (t) => {
  const adminUser = { id: 'user-admin-uuid-001', isDemo: false };
  const memberUserA = { id: 'user-member-uuid-002', isDemo: false };
  const memberUserB = { id: 'user-member-uuid-003', isDemo: false };
  const demoPersona = { id: 'user-aarav-patel', isDemo: true };

  const testCircle = {
    id: 'circle-uuid-101',
    adminId: 'user-admin-uuid-001',
    inviteCode: 'CAMPUS2026',
  };

  const openSession = {
    id: 'session-uuid-201',
    circleId: 'circle-uuid-101',
    status: 'open',
    cutoffTime: new Date(Date.now() + 60 * 60000).toISOString(), // 1 hour in future
  };

  const lockedSession = {
    id: 'session-uuid-202',
    circleId: 'circle-uuid-101',
    status: 'locked',
    cutoffTime: new Date(Date.now() + 60 * 60000).toISOString(),
  };

  const expiredSession = {
    id: 'session-uuid-203',
    circleId: 'circle-uuid-101',
    status: 'open',
    cutoffTime: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes in past
  };

  const userACartItem = {
    id: 'cart-item-1',
    sessionId: openSession.id,
    circleId: testCircle.id,
    userId: memberUserA.id,
  };

  // Rule 1: Members cannot modify other members' cart items
  await t.test('RULE 1: Member cannot modify another member cart item', () => {
    // User B attempts to modify User A's cart item
    const resB = canModifyCartItem(memberUserB, userACartItem, openSession, true);
    assert.equal(resB.allowed, false);
    assert.match(resB.reason, /Members cannot modify other members’ cart items/);

    // User A modifies their own cart item -> Allowed
    const resA = canModifyCartItem(memberUserA, userACartItem, openSession, true);
    assert.equal(resA.allowed, true);

    // Non-member attempts to modify their own cart item in foreign circle -> Rejected
    const resNonMember = canModifyCartItem(memberUserA, userACartItem, openSession, false);
    assert.equal(resNonMember.allowed, false);
    assert.match(resNonMember.reason, /User is not a member of this circle/);
  });

  // Rule 2: Only admins can manage Circle ordering sessions
  await t.test('RULE 2: Only admin can manage ordering sessions', () => {
    // Regular member attempts to lock or manage session -> Rejected
    const memberManage = canManageSession(memberUserA, testCircle);
    assert.equal(memberManage.allowed, false);
    assert.match(memberManage.reason, /Only the circle admin can manage ordering sessions/);

    // Circle admin attempts to manage session -> Allowed
    const adminManage = canManageSession(adminUser, testCircle);
    assert.equal(adminManage.allowed, true);
  });

  // Rule 3: Deadlines are strictly enforced
  await t.test('RULE 3: Cutoff deadline and locked status prevent cart modifications', () => {
    // Attempt modification on locked session -> Rejected
    const lockedRes = canModifyCartItem(memberUserA, userACartItem, lockedSession, true);
    assert.equal(lockedRes.allowed, false);
    assert.match(lockedRes.reason, /Ordering session is locked/);

    // Attempt modification on expired session (cutoff time elapsed) -> Rejected
    const expiredRes = canModifyCartItem(memberUserA, userACartItem, expiredSession, true);
    assert.equal(expiredRes.allowed, false);
    assert.match(expiredRes.reason, /cutoff deadline has expired/);
  });

  // Rule 4: Invalid invitations cannot bypass membership rules
  await t.test('RULE 4: Invitation code verification protects circle membership', () => {
    // Invalid invite code -> Rejected
    const invalidJoin = canJoinCircle(testCircle, 'WRONG_CODE_99');
    assert.equal(invalidJoin.allowed, false);
    assert.match(invalidJoin.reason, /Invalid or expired circle invite code/);

    // Empty invite code -> Rejected
    const emptyJoin = canJoinCircle(testCircle, '');
    assert.equal(emptyJoin.allowed, false);

    // Valid invite code (case-insensitive) -> Allowed
    const validJoin = canJoinCircle(testCircle, 'campus2026');
    assert.equal(validJoin.allowed, true);
  });

  // Rule 5: Demo personas cannot access or mutate real authenticated users' data
  await t.test('RULE 5: Demo personas cannot mutate real authenticated records', () => {
    // Demo persona attempts to overwrite a real authenticated user account
    const demoAttack = validateAccountIsolation(demoPersona, 'real-student-uuid-999', false);
    assert.equal(demoAttack.allowed, false);
    assert.match(demoAttack.reason, /Demo personas cannot modify real authenticated user data/);

    // Mismatched user IDs -> Rejected
    const spoofingAttempt = validateAccountIsolation(memberUserA, memberUserB.id, false);
    assert.equal(spoofingAttempt.allowed, false);
    assert.match(spoofingAttempt.reason, /Cannot mutate data belonging to another user account/);

    // Legitimate authenticated user updating own record -> Allowed
    const validUpdate = validateAccountIsolation(memberUserA, memberUserA.id, false);
    assert.equal(validUpdate.allowed, true);
  });
});
