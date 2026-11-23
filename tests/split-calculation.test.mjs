import test from 'node:test';
import assert from 'node:assert/strict';

// Test integer paise formatting and split logic directly
function formatPaise(paise, showDecimalsIfZero = false) {
  const rupees = paise / 100;
  if (showDecimalsIfZero || paise % 100 !== 0) {
    return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₹${rupees.toLocaleString('en-IN')}`;
}

function calculateMemberSplit(items, deliveryFeePaise, platformFeePaise, discountPaise) {
  const memberMap = new Map();

  for (const item of items) {
    const itemTotal = item.item_price_paise * item.quantity;

    const existing = memberMap.get(item.user_id) || {
      user_id: item.user_id,
      user_name: item.user_name,
      items_count: 0,
      subtotal_paise: 0,
      share_paise: 0,
    };

    existing.items_count += item.quantity;
    existing.subtotal_paise += itemTotal;
    memberMap.set(item.user_id, existing);
  }

  const memberCount = memberMap.size;
  if (memberCount === 0) return [];

  const netExtrasPaise = deliveryFeePaise + platformFeePaise - discountPaise;
  const perMemberExtra = Math.round(netExtrasPaise / memberCount);

  return Array.from(memberMap.values()).map((m) => ({
    ...m,
    share_paise: Math.max(0, m.subtotal_paise + perMemberExtra),
  }));
}

function generateInviteCode(length = 6) {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

test('formatPaise formats integer paise to Indian Rupee strings accurately', () => {
  assert.equal(formatPaise(17900), '₹179');
  assert.equal(formatPaise(17950), '₹179.50');
  assert.equal(formatPaise(0), '₹0');
  assert.equal(formatPaise(50000), '₹500');
});

test('calculateMemberSplit handles 3 members with free delivery and platform fee', () => {
  const items = [
    { user_id: 'u1', user_name: 'Aarav', item_price_paise: 17900, quantity: 1 },
    { user_id: 'u2', user_name: 'Ananya', item_price_paise: 19900, quantity: 1 },
    { user_id: 'u3', user_name: 'Rohan', item_price_paise: 21900, quantity: 1 },
  ];

  // Delivery fee 0, platform fee ₹5 (500 paise), discount ₹50 (5000 paise)
  const deliveryFee = 0;
  const platformFee = 500;
  const discount = 5000;

  const splits = calculateMemberSplit(items, deliveryFee, platformFee, discount);

  assert.equal(splits.length, 3);

  // Net extras = 0 + 500 - 5000 = -4500 paise (-₹45).
  // Per member extra = -4500 / 3 = -1500 paise (-₹15 discount per student).
  const aarav = splits.find((s) => s.user_id === 'u1');
  const ananya = splits.find((s) => s.user_id === 'u2');
  const rohan = splits.find((s) => s.user_id === 'u3');

  assert.equal(aarav.subtotal_paise, 17900);
  assert.equal(aarav.share_paise, 17900 - 1500); // 16400 (₹164)

  assert.equal(ananya.subtotal_paise, 19900);
  assert.equal(ananya.share_paise, 19900 - 1500); // 18400 (₹184)

  assert.equal(rohan.subtotal_paise, 21900);
  assert.equal(rohan.share_paise, 21900 - 1500); // 20400 (₹204)
});

test('calculateMemberSplit correctly sums multiple quantities per student', () => {
  const items = [
    { user_id: 'u1', user_name: 'Aarav', item_price_paise: 10000, quantity: 2 },
    { user_id: 'u2', user_name: 'Ananya', item_price_paise: 15000, quantity: 1 },
  ];

  const splits = calculateMemberSplit(items, 0, 0, 0);
  const aarav = splits.find((s) => s.user_id === 'u1');
  assert.equal(aarav.items_count, 2);
  assert.equal(aarav.subtotal_paise, 20000);
});

test('generateInviteCode produces 6-character uppercase alphanumeric string', () => {
  const code = generateInviteCode(6);
  assert.equal(code.length, 6);
  assert.match(code, /^[A-Z0-9]{6}$/);
});
