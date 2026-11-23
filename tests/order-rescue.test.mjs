import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRescueAlternatives,
  detectOrderIssue,
  getJudgeDemoRescueScenarios,
} from '../src/lib/rescue/order-rescue-engine.ts';

test('Order Rescue AI Engine Test Suite', async (t) => {
  const testRestaurant = {
    id: 'rest-rolls-bowls',
    name: 'Rolls & Bowls Co.',
    cuisine: ['Rolls', 'Bowls'],
    menu_categories: [
      {
        id: 'cat-rolls',
        name: 'Rolls',
        items: [
          { id: 'dish-paneer-roll', name: 'Paneer Makhani Roll', price_paise: 16000, is_veg: true, description: 'Cottage cheese wrap' },
          { id: 'dish-aloo-roll', name: 'Crispy Aloo Roll', price_paise: 12000, is_veg: true, description: 'Spiced potato roll' },
          { id: 'dish-chicken-roll', name: 'Chicken Tikka Roll', price_paise: 21000, is_veg: false, description: 'Grilled chicken roll' },
          { id: 'dish-mutton-roll', name: 'Mutton Boti Roll', price_paise: 28000, is_veg: false, description: 'Tender mutton roll' },
          { id: 'dish-jumbo-platter', name: 'Grand Feast Platter', price_paise: 45000, is_veg: true, description: 'Feast box' },
        ],
      },
    ],
  };

  const vegStudent = {
    id: 'student-veg-001',
    full_name: 'Ananya Iyer',
    college: 'PW Institute of Innovation Noida',
    academic_year: '3rd Year B.Tech',
    dietary_pref: 'VEG',
    preferred_budget: 200, // ₹200 (20000 paise)
  };

  const nonVegStudent = {
    id: 'student-nonveg-002',
    full_name: 'Rohan Mehta',
    college: 'PW Institute of Innovation Noida',
    academic_year: '3rd Year B.Tech',
    dietary_pref: 'NON_VEG',
    preferred_budget: 250, // ₹250 (25000 paise)
  };

  await t.test('1. Vegetarian restrictions are 100% enforced in suggested alternatives', () => {
    // Veg student attempted to add non-veg dish or had dietary conflict
    const alternatives = generateRescueAlternatives(
      testRestaurant,
      'dish-chicken-roll',
      21000,
      vegStudent,
      [],
      'dietary_conflict'
    );

    assert.ok(alternatives.length > 0, 'Should find veg alternatives');
    const allVeg = alternatives.every((alt) => alt.is_veg === true);
    assert.equal(allVeg, true, 'Every suggested rescue alternative for a vegetarian MUST be vegetarian');
    assert.ok(alternatives.every((alt) => alt.dish_id !== 'dish-chicken-roll'));
  });

  await t.test('2. Budget constraints strictly filter out expensive dishes', () => {
    // Veg student budget is ₹200 (20000 paise). 'dish-jumbo-platter' is 45000 paise and must be filtered out!
    const alternatives = generateRescueAlternatives(
      testRestaurant,
      'dish-paneer-roll',
      16000,
      vegStudent,
      [],
      'budget_exceeded'
    );

    const hasOverBudget = alternatives.some((alt) => alt.price_paise > 20000);
    assert.equal(hasOverBudget, false, 'No suggested alternative can exceed the student’s budget cap');
    assert.ok(alternatives.some((alt) => alt.dish_id === 'dish-aloo-roll'));
  });

  await t.test('3. Alternatives strictly belong to the SAME selected restaurant', () => {
    const issue = detectOrderIssue(
      'dish_unavailable',
      'sess-test-01',
      'circle-test-01',
      nonVegStudent,
      { id: 'dish-mutton-roll', name: 'Mutton Boti Roll', price_paise: 28000 },
      testRestaurant,
      []
    );

    assert.equal(issue.scenario, 'dish_unavailable');
    assert.ok(issue.suggested_alternatives.length > 0);

    const allDishesInRestaurant = testRestaurant.menu_categories.flatMap((c) => c.items).map((i) => i.id);
    const allBelong = issue.suggested_alternatives.every((alt) => allDishesInRestaurant.includes(alt.dish_id));
    assert.equal(allBelong, true, 'All suggested rescue dishes must belong to the same restaurant');
  });

  await t.test('4. Price differences and remaining budget are calculated in integer paise', () => {
    const alternatives = generateRescueAlternatives(
      testRestaurant,
      'dish-paneer-roll', // 16000 paise
      16000,
      vegStudent,
      [],
      'member_selection_change'
    );

    const alooRoll = alternatives.find((alt) => alt.dish_id === 'dish-aloo-roll');
    assert.ok(alooRoll);
    assert.equal(alooRoll.price_paise, 12000);
    assert.equal(alooRoll.price_diff_paise, -4000, 'Difference between ₹120 and ₹160 must be -₹40 (-4000 paise)');
    assert.equal(alooRoll.remaining_budget_paise, 8000, 'Remaining budget: 20000 - 12000 = 8000 paise');
  });

  await t.test('5. Pre-seeded Judge Demo Scenarios are correctly generated and marked is_demo', () => {
    const demoScenarios = getJudgeDemoRescueScenarios(
      'sess-demo-99',
      'circle-demo-99',
      testRestaurant,
      [vegStudent, nonVegStudent],
      []
    );

    assert.ok(demoScenarios.dietary_conflict, 'Must provide dietary conflict demo');
    assert.ok(demoScenarios.budget_exceeded, 'Must provide budget exceeded demo');
    assert.ok(demoScenarios.dish_unavailable, 'Must provide dish unavailable demo');

    assert.equal(demoScenarios.dietary_conflict.is_demo, true);
    assert.equal(demoScenarios.budget_exceeded.is_demo, true);
    assert.equal(demoScenarios.dish_unavailable.is_demo, true);
  });
});
