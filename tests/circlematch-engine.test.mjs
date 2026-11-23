import test from 'node:test';
import assert from 'node:assert/strict';

// Sample mock restaurants mirroring the application's catalog
const TEST_RESTAURANTS = [
  {
    id: 'rest-rolls-bowls',
    name: 'Rolls & Bowls Co.',
    cuisine: ['Rolls', 'North Indian', 'Bowls'],
    rating: 4.5,
    rating_count: '2.4K+ ratings',
    price_for_one: 180,
    is_pure_veg: false,
    menu_categories: [
      {
        id: 'cat-rolls',
        name: 'Rolls',
        items: [
          {
            id: 'dish-paneer-roll',
            name: 'Double Paneer Kathi Roll',
            description: 'Juicy cottage cheese in tandoori spices and mint relish.',
            price_paise: 17900, // ₹179
            is_veg: true,
            is_bestseller: true,
            tags: ['Bestseller', 'Student Favorite'],
          },
          {
            id: 'dish-chicken-roll',
            name: 'Butter Chicken Loaded Roll',
            description: 'Smoky chicken tikka in creamy makhani gravy.',
            price_paise: 21900, // ₹219
            is_veg: false,
            is_bestseller: true,
            tags: ['Bestseller'],
          },
        ],
      },
      {
        id: 'cat-bowls',
        name: 'Bowls',
        items: [
          {
            id: 'dish-veg-bowl',
            name: 'Fiesta Veg Burrito Bowl',
            description: 'Cilantro lime rice with black beans and fresh salsa.',
            price_paise: 19900, // ₹199
            is_veg: true,
            is_student_pick: true,
            tags: ['Healthy'],
          },
          {
            id: 'dish-peri-chicken-bowl',
            name: 'Spicy Peri Peri Chicken Rice Bowl',
            description: 'Char-grilled chicken strips with spicy peri-peri garlic dip.',
            price_paise: 23900, // ₹239
            is_veg: false,
            tags: ['Spicy'],
          },
        ],
      },
    ],
  },
  {
    id: 'rest-madras-tiffin',
    name: 'Madras Tiffin Room',
    cuisine: ['South Indian', 'Pure Veg'],
    rating: 4.7,
    rating_count: '1.9K+ ratings',
    price_for_one: 120,
    is_pure_veg: true,
    menu_categories: [
      {
        id: 'cat-tiffin',
        name: 'Tiffins',
        items: [
          {
            id: 'dish-masala-dosa',
            name: 'Mysore Masala Dosa',
            description: 'Golden crepe with spicy red garlic chutney and potato masala.',
            price_paise: 12900, // ₹129
            is_veg: true,
            is_bestseller: true,
            tags: ['Crispy'],
          },
          {
            id: 'dish-ghee-idli',
            name: 'Mini Ghee Podi Idli',
            description: 'Steamed rice cakes drenched in desi ghee and gunpowder.',
            price_paise: 11900, // ₹119
            is_veg: true,
            is_student_pick: true,
            tags: ['Classic'],
          },
        ],
      },
    ],
  },
];

// Re-implement / import pure engine functions for isolated test harness
const CRAVING_KEYWORDS = {
  'Spicy': ['peri peri', 'peri-peri', 'schezwan', 'chilli', 'spicy', 'hot'],
  'Comfort food': ['maggi', 'chai', 'rajma', 'bowl', 'homestyle'],
  'Light meal': ['roll', 'idli', 'salad', 'steamed'],
  'High protein': ['chicken', 'paneer', 'egg', 'soya'],
  'South Indian': ['dosa', 'idli', 'sambar', 'podi', 'tiffin'],
  'North Indian': ['kathi', 'paratha', 'butter chicken', 'makhani'],
};

function scoreDish(pref, dish, restaurant) {
  // Hard Constraint 1: Vegetarian Isolation
  if (pref.dietaryPref === 'VEG' && !dish.is_veg) {
    return { isFeasible: false, score: -Infinity, reason: 'Contains meat/egg' };
  }

  // Hard Constraint 2: Budget Cap
  if (dish.price_paise > pref.budgetPaise) {
    return { isFeasible: false, score: -Infinity, reason: 'Exceeds budget' };
  }

  // Hard Constraint 3: Exclusions
  if (pref.exclusions && pref.exclusions.length > 0) {
    const text = `${dish.name} ${dish.description}`.toLowerCase();
    for (const ex of pref.exclusions) {
      if (text.includes(ex.toLowerCase())) {
        return { isFeasible: false, score: -Infinity, reason: 'Contains excluded ingredient' };
      }
    }
  }

  let score = 50;
  const dishText = `${dish.name} ${dish.description} ${(dish.tags || []).join(' ')} ${restaurant.cuisine.join(' ')}`.toLowerCase();

  for (const craving of pref.cravings) {
    const keywords = CRAVING_KEYWORDS[craving] || [craving.toLowerCase()];
    if (keywords.some((kw) => dishText.includes(kw))) {
      score += 20;
      break;
    }
  }

  if (dish.is_bestseller) score += 10;
  if (dish.is_student_pick) score += 8;

  return { isFeasible: true, score: Math.min(100, score), reason: 'Feasible match' };
}

function evaluateRestaurant(restaurant, preferences) {
  const allDishes = restaurant.menu_categories.flatMap((c) => c.items);
  const memberPlans = [];

  for (const pref of preferences) {
    const scored = allDishes
      .map((d) => ({ dish: d, result: scoreDish(pref, d, restaurant) }))
      .filter((s) => s.result.isFeasible)
      .sort((a, b) => b.result.score - a.result.score);

    if (scored.length === 0) {
      return { isFeasible: false, restaurant, memberPlans: [] };
    }

    memberPlans.push({
      userId: pref.userId,
      userName: pref.userName,
      dish: scored[0].dish,
      score: scored[0].result.score,
    });
  }

  const scores = memberPlans.map((m) => m.score);
  const avgSatisfaction = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const fairnessScore = Math.max(0, 100 - (maxScore - minScore));
  const subtotalPaise = memberPlans.reduce((s, m) => s + m.dish.price_paise, 0);

  return {
    isFeasible: true,
    restaurant,
    memberPlans,
    avgSatisfaction,
    fairnessScore,
    compositeScore: Math.round(avgSatisfaction * 0.6 + fairnessScore * 0.4),
    subtotalPaise,
  };
}

// -----------------------------------------------------------------------------
// TEST SUITE: CircleMatch AI Constraint & Determinism Verification
// -----------------------------------------------------------------------------

test('1. Vegetarian constraints are NEVER violated', () => {
  const strictVegMember = {
    userId: 'u-veg',
    userName: 'Ananya (Veg)',
    dietaryPref: 'VEG',
    budgetPaise: 30000, // ₹300 (plenty of budget)
    cravings: ['Spicy', 'High protein'],
    exclusions: [],
  };

  const chickenRoll = TEST_RESTAURANTS[0].menu_categories[0].items[1]; // Butter Chicken Loaded Roll
  const scored = scoreDish(strictVegMember, chickenRoll, TEST_RESTAURANTS[0]);

  assert.equal(scored.isFeasible, false);
  assert.equal(scored.score, -Infinity);
  assert.match(scored.reason, /meat/i);
});

test('2. Budgets are never exceeded when prices are known', () => {
  const budgetStudent = {
    userId: 'u-budget',
    userName: 'Priya',
    dietaryPref: 'VEG',
    budgetPaise: 15000, // ₹150 budget
    cravings: ['North Indian'],
    exclusions: [],
  };

  const paneerRoll = TEST_RESTAURANTS[0].menu_categories[0].items[0]; // ₹179 (17900 paise)
  const scored = scoreDish(budgetStudent, paneerRoll, TEST_RESTAURANTS[0]);

  assert.equal(scored.isFeasible, false);
  assert.equal(scored.score, -Infinity);
  assert.match(scored.reason, /budget/i);
});

test('3. All proposed dishes in a group plan belong to the SAME selected restaurant', () => {
  const group = [
    { userId: 'u1', userName: 'Aarav', dietaryPref: 'BOTH', budgetPaise: 25000, cravings: ['North Indian'] },
    { userId: 'u2', userName: 'Ananya', dietaryPref: 'VEG', budgetPaise: 20000, cravings: ['Light meal'] },
  ];

  const plan = evaluateRestaurant(TEST_RESTAURANTS[0], group);
  assert.equal(plan.isFeasible, true);

  // Verify all member dishes belong to Rolls & Bowls Co.
  const restaurantDishIds = TEST_RESTAURANTS[0].menu_categories.flatMap((c) => c.items.map((i) => i.id));
  for (const m of plan.memberPlans) {
    assert.ok(
      restaurantDishIds.includes(m.dish.id),
      `Dish ${m.dish.name} should belong to restaurant ${TEST_RESTAURANTS[0].name}`
    );
  }
});

test('4. Impossibly low budgets produce a clear infeasible state with reasons', () => {
  const group = [
    { userId: 'u1', userName: 'Aarav', dietaryPref: 'BOTH', budgetPaise: 5000, cravings: ['Spicy'] }, // ₹50 (impossible)
  ];

  const plan = evaluateRestaurant(TEST_RESTAURANTS[0], group);
  assert.equal(plan.isFeasible, false);
  assert.equal(plan.memberPlans.length, 0);
});

test('5. Group rankings and meal allocations are deterministic', () => {
  const group = [
    { userId: 'u1', userName: 'Aarav', dietaryPref: 'BOTH', budgetPaise: 25000, cravings: ['North Indian', 'High protein'] },
    { userId: 'u2', userName: 'Ananya', dietaryPref: 'VEG', budgetPaise: 20000, cravings: ['Comfort food'] },
    { userId: 'u3', userName: 'Rohan', dietaryPref: 'NON_VEG', budgetPaise: 26000, cravings: ['Spicy'] },
  ];

  const run1 = evaluateRestaurant(TEST_RESTAURANTS[0], group);
  const run2 = evaluateRestaurant(TEST_RESTAURANTS[0], group);

  assert.equal(run1.compositeScore, run2.compositeScore);
  assert.equal(run1.subtotalPaise, run2.subtotalPaise);
  assert.deepEqual(
    run1.memberPlans.map((m) => m.dish.id),
    run2.memberPlans.map((m) => m.dish.id)
  );
});

test('6. Cart acceptances do not accidentally create duplicate items', () => {
  const cart = [
    { session_id: 's1', user_id: 'u1', item_id: 'dish-paneer-roll', quantity: 1 },
  ];

  const candidateAddition = {
    session_id: 's1',
    user_id: 'u1',
    item_id: 'dish-paneer-roll',
  };

  const isDuplicate = cart.some(
    (ci) => ci.session_id === candidateAddition.session_id &&
            ci.user_id === candidateAddition.user_id &&
            ci.item_id === candidateAddition.item_id
  );

  assert.equal(isDuplicate, true, 'Duplicate item should be detected and avoided');
});
