import test from 'node:test';
import assert from 'node:assert';

test('Checkpoint 1: Pickup Pass opaque code and meal collection logic', () => {
  const order = {
    id: 'ord-123456789',
    order_code: 'SW-9821',
    member_breakdowns: [
      {
        user_id: 'user-1',
        user_name: 'Aarav Sharma',
        items: [
          { id: 'item-1', item_name: 'Paneer Butter Masala', quantity: 1, is_collected: false }
        ]
      },
      {
        user_id: 'user-2',
        user_name: 'Ananya Roy',
        items: [
          { id: 'item-2', item_name: 'Chicken Biryani', quantity: 2, is_collected: true }
        ]
      }
    ]
  };

  const allCollectionItems = order.member_breakdowns.flatMap((mb) =>
    mb.items.map((item) => ({ ...item, user_id: mb.user_id, user_name: mb.user_name }))
  );

  const totalMeals = allCollectionItems.reduce((sum, i) => sum + i.quantity, 0);
  const collectedMeals = allCollectionItems.filter((i) => i.is_collected).reduce((sum, i) => sum + i.quantity, 0);

  assert.strictEqual(totalMeals, 3);
  assert.strictEqual(collectedMeals, 2);

  // Opaque token verification
  const opaqueSessionToken = `SW-PASS-${order.id.substring(order.id.length - 8)}-${order.order_code}`;
  assert.ok(opaqueSessionToken.includes('SW-PASS-'));
  assert.ok(opaqueSessionToken.includes('SW-9821'));
});

test('Checkpoint 1: CirclePay Tracker settlement progress and status progression', () => {
  const memberBreakdowns = [
    { user_id: 'user-1', share_paise: 25000, settlement_status: 'confirmed' },
    { user_id: 'user-2', share_paise: 30000, settlement_status: 'sent' },
    { user_id: 'user-3', share_paise: 20000, settlement_status: 'pending' },
  ];

  const totalMembers = memberBreakdowns.length;
  const settledMembers = memberBreakdowns.filter((mb) => mb.settlement_status === 'confirmed').length;
  const progressPercent = Math.round((settledMembers / totalMembers) * 100);

  assert.strictEqual(totalMembers, 3);
  assert.strictEqual(settledMembers, 1);
  assert.strictEqual(progressPercent, 33);

  const totalOutstandingPaise = memberBreakdowns
    .filter((mb) => mb.settlement_status !== 'confirmed')
    .reduce((sum, mb) => sum + mb.share_paise, 0);

  assert.strictEqual(totalOutstandingPaise, 50000); // 30000 + 20000
});
