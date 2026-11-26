// ==============================================================================
// SWIGGY CAMPUS CIRCLES - PHASE 8 TEST SUITE
// Campus BuddyMatch Compatibility & CircleGuard Security Negative Tests
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert';
import { calculateBuddyMatchCompatibility } from '../src/lib/buddymatch/buddymatch-engine.ts';
import { validateCartItemOwnership, validateAdminPrivilege, sanitizeInputString } from '../src/lib/security/circleguard.ts';

test('BuddyMatch: Calculates high compatibility for matching campus, meal window, and budget', () => {
  const student = {
    userId: 'user-1',
    college: 'PW Institute of Innovation Noida',
    preferredMealWindow: 'Lunch',
    preferredDays: ['Monday'],
    budgetMinPaise: 20000,
    budgetMaxPaise: 30000,
    cuisineInterests: ['Biryani', 'North Indian'],
    dietaryPref: 'BOTH',
  };

  const circle = {
    circleId: 'circle-1',
    name: 'CSE Lunch Squad',
    college: 'PW Institute of Innovation Noida',
    mealWindow: 'Lunch',
    budgetMinPaise: 20000,
    budgetMaxPaise: 30000,
    cuisineTags: ['Biryani'],
    memberCount: 5,
    maxCapacity: 10,
    isDiscoverable: true,
  };

  const result = calculateBuddyMatchCompatibility(student, circle);
  assert.strictEqual(result.isCompatible, true);
  assert.ok(result.score >= 80, `Expected score >= 80, got ${result.score}`);
});

test('BuddyMatch: Rejects non-discoverable or private circles', () => {
  const student = {
    userId: 'user-1',
    college: 'PW Institute of Innovation Noida',
    preferredMealWindow: 'Lunch',
    preferredDays: ['Monday'],
    budgetMinPaise: 20000,
    budgetMaxPaise: 30000,
    cuisineInterests: ['Biryani'],
    dietaryPref: 'BOTH',
  };

  const circle = {
    circleId: 'circle-private',
    name: 'Secret VIP Circle',
    college: 'PW Institute of Innovation Noida',
    mealWindow: 'Lunch',
    budgetMinPaise: 20000,
    budgetMaxPaise: 30000,
    cuisineTags: ['Biryani'],
    memberCount: 3,
    maxCapacity: 5,
    isDiscoverable: false,
  };

  const result = calculateBuddyMatchCompatibility(student, circle);
  assert.strictEqual(result.isCompatible, false);
  assert.strictEqual(result.score, 0);
});

test('BuddyMatch: Rejects cross-campus circles', () => {
  const student = {
    userId: 'user-1',
    college: 'PW Institute of Innovation Noida',
    preferredMealWindow: 'Lunch',
    preferredDays: ['Monday'],
    budgetMinPaise: 20000,
    budgetMaxPaise: 30000,
    cuisineInterests: ['Biryani'],
    dietaryPref: 'BOTH',
  };

  const circle = {
    circleId: 'circle-other',
    name: 'Bangalore Campus Squad',
    college: 'Bangalore Tech Park Campus',
    mealWindow: 'Lunch',
    budgetMinPaise: 20000,
    budgetMaxPaise: 30000,
    cuisineTags: ['Biryani'],
    memberCount: 5,
    maxCapacity: 10,
    isDiscoverable: true,
  };

  const result = calculateBuddyMatchCompatibility(student, circle);
  assert.strictEqual(result.isCompatible, false);
  assert.strictEqual(result.score, 0);
});

test('CircleGuard: Validates cart item ownership strictly', () => {
  assert.strictEqual(validateCartItemOwnership('user-A', 'user-A'), true);
  assert.strictEqual(validateCartItemOwnership('user-A', 'user-B'), false);
  assert.strictEqual(validateCartItemOwnership('', 'user-A'), false);
});

test('CircleGuard: Validates admin privileges correctly', () => {
  assert.strictEqual(validateAdminPrivilege('admin-1', 'admin-1'), true);
  assert.strictEqual(validateAdminPrivilege('admin-1', 'member-2'), false);
});

test('CircleGuard: Sanitizes input strings against XSS injection', () => {
  const unsafe = '<script>alert("hack")</script>Delicious Biryani';
  const sanitized = sanitizeInputString(unsafe);
  assert.strictEqual(sanitized.includes('<script>'), false);
  assert.ok(sanitized.includes('Delicious Biryani'));
});
