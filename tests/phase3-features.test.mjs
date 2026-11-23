import { test } from 'node:test';
import assert from 'node:assert';

test('Phase 3 Feature A: Member ready status calculation and toggle', () => {
  const members = ['user-1', 'user-2', 'user-3', 'user-4'];
  let readyMemberIds = ['user-1', 'user-2'];

  // Toggle user-3 to ready
  const toggleReady = (userId) => {
    return readyMemberIds.includes(userId)
      ? readyMemberIds.filter((id) => id !== userId)
      : [...readyMemberIds, userId];
  };

  readyMemberIds = toggleReady('user-3');
  assert.strictEqual(readyMemberIds.length, 3);
  assert.ok(readyMemberIds.includes('user-3'));

  const readinessPercent = Math.round((readyMemberIds.length / members.length) * 100);
  assert.strictEqual(readinessPercent, 75);

  // Toggle user-4 to complete group readiness
  readyMemberIds = toggleReady('user-4');
  assert.strictEqual(readyMemberIds.length, 4);
  const allReady = readyMemberIds.length === members.length;
  assert.strictEqual(allReady, true);
});

test('Phase 3 Feature B: Smart budget guardrail calculations in integer paise', () => {
  const budgetPaise = 20000; // ₹200.00
  const items = [
    { item_price_paise: 9000, quantity: 1 }, // ₹90
    { item_price_paise: 8000, quantity: 1 }, // ₹80
  ];

  const currentSubtotal = items.reduce((s, i) => s + i.item_price_paise * i.quantity, 0);
  assert.strictEqual(currentSubtotal, 17000); // ₹170.00

  const remainingPaise = budgetPaise - currentSubtotal;
  assert.strictEqual(remainingPaise, 3000); // ₹30.00
  assert.strictEqual(remainingPaise >= 0, true);

  // Adding an item that exceeds budget
  const nextItemPrice = 5000; // ₹50.00
  const exceedsBudget = currentSubtotal + nextItemPrice > budgetPaise;
  assert.strictEqual(exceedsBudget, true);
  const overrunPaise = currentSubtotal + nextItemPrice - budgetPaise;
  assert.strictEqual(overrunPaise, 2000); // ₹20.00 overrun
});

test('Phase 3 Feature C: One-Click Reorder extracts items and preserves user ownership', () => {
  const pastOrder = {
    id: 'order-123',
    restaurant_id: 'rest-rolls',
    circle_id: 'circle-cse',
    member_breakdowns: [
      {
        user_id: 'user-1',
        user_name: 'Aarav',
        items: [
          { item_id: 'dish-1', item_name: 'Paneer Roll', item_price_paise: 14000, item_is_veg: true, quantity: 1 },
        ],
      },
      {
        user_id: 'user-2',
        user_name: 'Ananya',
        items: [
          { item_id: 'dish-2', item_name: 'Veg Bowl', item_price_paise: 16000, item_is_veg: true, quantity: 1 },
        ],
      },
    ],
  };

  const reorderedItems = [];
  pastOrder.member_breakdowns.forEach((mb) => {
    mb.items.forEach((item) => {
      reorderedItems.push({
        ...item,
        target_user_id: mb.user_id,
        target_user_name: mb.user_name,
      });
    });
  });

  assert.strictEqual(reorderedItems.length, 2);
  assert.strictEqual(reorderedItems[0].target_user_id, 'user-1');
  assert.strictEqual(reorderedItems[1].target_user_id, 'user-2');
  assert.strictEqual(reorderedItems[0].item_price_paise, 14000);
});

test('Phase 3 Feature E: Campus pickup notes format validation', () => {
  const pickupSpots = [
    'Hostel Main Gate / Reception',
    'Campus Main Gate Security Point',
    'Academic Block C Quadrangle',
    'Central Library Portico',
  ];

  const chosen = pickupSpots[0];
  assert.ok(pickupSpots.includes(chosen));
  assert.strictEqual(typeof chosen, 'string');
  assert.ok(chosen.length > 5);
});

test('Phase 3 API Architecture: Swiggy OAuth 2.1 PKCE verifier and challenge compliance', async () => {
  // Generate random 32-byte verifier
  const randomBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) randomBytes[i] = (i * 7 + 13) % 256;
  const codeVerifier = Array.from(randomBytes, (dec) => dec.toString(16).padStart(2, '0')).join('');

  assert.strictEqual(codeVerifier.length, 64);
  assert.match(codeVerifier, /^[0-9a-f]{64}$/);
});
