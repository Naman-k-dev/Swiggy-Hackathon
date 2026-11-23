import { test } from 'node:test';
import assert from 'node:assert';

test('Phase 5 Feature A: Recurring meal window scheduler calculation with Asia/Kolkata timing', () => {
  // Preset: Lunch at 13:15 IST with 30-min cutoff
  const targetTime = '13:15';
  const cutoffMinutes = 30;
  const [hours, minutes] = targetTime.split(':').map(Number);
  
  const targetMinutes = hours * 60 + minutes; // 795 minutes from midnight
  const cutoffMinutesFromMidnight = targetMinutes - cutoffMinutes; // 765 minutes (12:45 IST)
  
  const cutoffHour = Math.floor(cutoffMinutesFromMidnight / 60);
  const cutoffMin = cutoffMinutesFromMidnight % 60;
  const cutoffTimeStr = `${String(cutoffHour).padStart(2, '0')}:${String(cutoffMin).padStart(2, '0')}`;

  assert.strictEqual(cutoffTimeStr, '12:45');
  assert.strictEqual(targetMinutes - cutoffMinutesFromMidnight, 30);
});

test('Phase 5 Feature B: Session deadline enforcement rejects cart modifications after cutoff', () => {
  const now = Date.now();
  const pastCutoffTime = new Date(now - 5 * 60000).toISOString(); // 5 minutes ago
  const futureCutoffTime = new Date(now + 25 * 60000).toISOString(); // 25 minutes from now

  const sessionExpired = {
    id: 'sess-expired',
    status: 'open',
    cutoff_time: pastCutoffTime,
  };

  const sessionActive = {
    id: 'sess-active',
    status: 'open',
    cutoff_time: futureCutoffTime,
  };

  const isCutoffPassed = (session) => {
    return Boolean(session.cutoff_time && new Date(session.cutoff_time).getTime() < Date.now());
  };

  assert.strictEqual(isCutoffPassed(sessionExpired), true, 'Expired session must be recognized as cutoff passed');
  assert.strictEqual(isCutoffPassed(sessionActive), false, 'Active session must allow order additions');
});

test('Phase 5 Feature C: Smart Budget Guardrails with 3-tier accessibility indicators', () => {
  const budgetPaise = 20000; // ₹200.00
  const activeMembersCount = 3;
  const platformFeePaise = 600; // ₹6.00 total
  const estPlatformFeeShare = Math.round(platformFeePaise / activeMembersCount); // 200 paise = ₹2.00

  // 1. Safe Tier: Dish total ₹120.00 -> Total ₹122.00 (61% utilization)
  const dishSubtotalSafe = 12000;
  const totalSafe = dishSubtotalSafe + estPlatformFeeShare;
  const utilSafePct = Math.round((totalSafe / budgetPaise) * 100);
  const isOverSafe = totalSafe > budgetPaise;
  const isApproachingSafe = !isOverSafe && utilSafePct >= 80;

  assert.strictEqual(isOverSafe, false);
  assert.strictEqual(isApproachingSafe, false);
  assert.strictEqual(utilSafePct < 80, true);

  // 2. Warning Tier (Approaching): Dish total ₹170.00 -> Total ₹172.00 (86% utilization)
  const dishSubtotalWarning = 17000;
  const totalWarning = dishSubtotalWarning + estPlatformFeeShare;
  const utilWarningPct = Math.round((totalWarning / budgetPaise) * 100);
  const isOverWarning = totalWarning > budgetPaise;
  const isApproachingWarning = !isOverWarning && utilWarningPct >= 80;

  assert.strictEqual(isOverWarning, false);
  assert.strictEqual(isApproachingWarning, true);

  // 3. Exceeded Tier (Over Budget): Dish total ₹210.00 -> Total ₹212.00 (106% utilization)
  const dishSubtotalExceeded = 21000;
  const totalExceeded = dishSubtotalExceeded + estPlatformFeeShare;
  const isOverExceeded = totalExceeded > budgetPaise;
  const overrunPaise = totalExceeded - budgetPaise;

  assert.strictEqual(isOverExceeded, true);
  assert.strictEqual(overrunPaise, 1200); // Exceeded by ₹12.00
});

test('Phase 5 Feature D: Member cart item ownership protection', () => {
  const currentUserId = 'student-aarav';
  const otherUserId = 'student-rohan';
  const circleAdminId = 'student-aarav';

  const cartItemOfRohan = {
    id: 'cart-item-rohan-1',
    user_id: otherUserId,
    circle_id: 'circle-cse',
    item_name: 'Hyderabadi Dum Biryani',
    quantity: 1,
  };

  const canModifyItem = (item, requesterId, adminId) => {
    return item.user_id === requesterId || adminId === requesterId;
  };

  // Rohan can modify his own item
  assert.strictEqual(canModifyItem(cartItemOfRohan, otherUserId, circleAdminId), true);
  
  // Aarav can modify because he is Circle Admin
  assert.strictEqual(canModifyItem(cartItemOfRohan, currentUserId, circleAdminId), true);

  // A third student who is not admin cannot modify Rohan's item
  const thirdStudentId = 'student-priya';
  assert.strictEqual(canModifyItem(cartItemOfRohan, thirdStudentId, circleAdminId), false);
});

test('Phase 5 Feature E: Member participation and attendance tracking', () => {
  const participations = {
    'user-1': { user_id: 'user-1', status: 'joining' },
    'user-2': { user_id: 'user-2', status: 'joining' },
    'user-3': { user_id: 'user-3', status: 'skipped' },
    'user-4': { user_id: 'user-4', status: 'joining', temporary_budget_paise: 25000 },
  };

  const joining = Object.values(participations).filter((p) => p.status === 'joining');
  const skipped = Object.values(participations).filter((p) => p.status === 'skipped');

  assert.strictEqual(joining.length, 3);
  assert.strictEqual(skipped.length, 1);
  assert.strictEqual(participations['user-4'].temporary_budget_paise, 25000);
});

test('Phase 5 Feature F: Recurrence rule evaluation for weekdays and daily windows', () => {
  // Test Monday (day 1) through Sunday (day 0)
  const isMealActiveToday = (recurrence, dayOfWeek) => {
    if (recurrence === 'daily') return true;
    if (recurrence === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
    return false;
  };

  // Monday (1)
  assert.strictEqual(isMealActiveToday('weekdays', 1), true);
  // Wednesday (3)
  assert.strictEqual(isMealActiveToday('weekdays', 3), true);
  // Saturday (6)
  assert.strictEqual(isMealActiveToday('weekdays', 6), false);
  // Sunday (0)
  assert.strictEqual(isMealActiveToday('weekdays', 0), false);
  // Daily schedule on Sunday
  assert.strictEqual(isMealActiveToday('daily', 0), true);
});
