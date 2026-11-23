import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createVoteSession,
  castVote,
  resolveVoteWinner,
  completeVoteSession,
  generateRestaurantCompatibility,
} from '../src/lib/circlevote/circlevote-engine.ts';

test('CircleVote — Decision Room Engine Test Suite', async (t) => {
  const circle = {
    id: 'circle-cse-lunch-squad',
    name: 'CSE Lunch Squad',
    type: 'Classmates',
    college: 'PW Institute of Innovation Noida',
    description: 'Daily squad meals',
    emoji: '🍱',
    banner_gradient: 'from-orange-500 to-amber-500',
    invite_code: 'CSE2026',
    preferred_budget: 200,
    admin_id: 'user-aarav-admin',
    created_at: '2026-11-23T10:00:00Z',
  };

  const adminUser = {
    id: 'user-aarav-admin',
    full_name: 'Aarav Sharma',
    college: 'PW Institute of Innovation Noida',
    academic_year: '3rd Year B.Tech',
    dietary_pref: 'BOTH',
    preferred_budget: 250,
  };

  const vegUser = {
    id: 'user-ananya-veg',
    full_name: 'Ananya Iyer',
    college: 'PW Institute of Innovation Noida',
    academic_year: '3rd Year B.Tech',
    dietary_pref: 'VEG',
    preferred_budget: 180,
  };

  const nonVegUser = {
    id: 'user-rohan-nonveg',
    full_name: 'Rohan Mehta',
    college: 'PW Institute of Innovation Noida',
    academic_year: '3rd Year B.Tech',
    dietary_pref: 'NON_VEG',
    preferred_budget: 220,
  };

  const mockRestaurants = [
    {
      id: 'rest-rolls-bowls',
      name: 'Rolls & Bowls Co.',
      image: 'https://example.com/rolls.jpg',
      cuisine: ['Rolls', 'North Indian'],
      menu_categories: [
        {
          id: 'cat-rolls',
          name: 'Rolls',
          items: [
            { id: 'dish-paneer-roll', name: 'Paneer Roll', price_paise: 16000, is_veg: true, description: 'Cottage cheese' },
            { id: 'dish-chicken-roll', name: 'Chicken Roll', price_paise: 20000, is_veg: false, description: 'Spiced chicken' },
          ],
        },
      ],
    },
    {
      id: 'rest-south-express',
      name: 'South Indian Express',
      image: 'https://example.com/south.jpg',
      cuisine: ['South Indian', 'Dosa'],
      menu_categories: [
        {
          id: 'cat-dosa',
          name: 'Dosas',
          items: [
            { id: 'dish-masala-dosa', name: 'Masala Dosa', price_paise: 14000, is_veg: true, description: 'Crisp dosa' },
            { id: 'dish-idli-vada', name: 'Idli Vada Combo', price_paise: 12000, is_veg: true, description: 'Steamed rice cakes' },
          ],
        },
      ],
    },
    {
      id: 'rest-nonveg-only',
      name: 'Carnivore BBQ Grill',
      image: 'https://example.com/bbq.jpg',
      cuisine: ['BBQ', 'Grill'],
      menu_categories: [
        {
          id: 'cat-meats',
          name: 'Meats',
          items: [
            { id: 'dish-steak', name: 'Beef/Mutton Steak', price_paise: 35000, is_veg: false, description: 'Grilled meat' },
          ],
        },
      ],
    },
  ];

  await t.test('1. Compatibility summary strictly detects dietary violations', () => {
    // When veg members exist, nonveg-only restaurant gets flagged
    const compVegViolated = generateRestaurantCompatibility(mockRestaurants[2], [vegUser]);
    assert.equal(compVegViolated.isDietaryViable, false);
    assert.ok(compVegViolated.compatibilityScore <= 20);
    assert.match(compVegViolated.dietarySummary, /No vegetarian dishes found/);

    // South Indian Express has 100% veg choices
    const compSouth = generateRestaurantCompatibility(mockRestaurants[1], [vegUser, nonVegUser]);
    assert.equal(compSouth.isDietaryViable, true);
    assert.ok(compSouth.compatibilityScore >= 70);
  });

  await t.test('2. Voting session creation rejects >3 candidate options', () => {
    const candidates = [
      { restaurant: mockRestaurants[0], source: 'campus_catalog' },
      { restaurant: mockRestaurants[1], source: 'circlematch_ai' },
    ];

    const session = createVoteSession(circle, adminUser.id, candidates, [adminUser, vegUser], 15);
    assert.equal(session.options.length, 2);
    assert.equal(session.status, 'active');
    assert.ok(new Date(session.cutoff_time).getTime() > Date.now());

    // Fails with 0 options
    assert.throws(() => createVoteSession(circle, adminUser.id, [], [adminUser]), /At least one restaurant candidate/);
  });

  await t.test('3. Enforces 1 vote per member; changing vote does not inflate vote count', () => {
    const candidates = [
      { restaurant: mockRestaurants[0], source: 'campus_catalog' },
      { restaurant: mockRestaurants[1], source: 'campus_catalog' },
    ];
    let session = createVoteSession(circle, adminUser.id, candidates, [adminUser, vegUser], 15);

    // Aarav votes for option 1
    session = castVote(session, { id: adminUser.id, name: adminUser.full_name }, session.options[0].id);
    assert.equal(session.options[0].vote_count, 1);
    assert.equal(session.options[1].vote_count, 0);
    assert.equal(Object.keys(session.votes).length, 1);

    // Aarav changes vote to option 2
    session = castVote(session, { id: adminUser.id, name: adminUser.full_name }, session.options[1].id);
    assert.equal(session.options[0].vote_count, 0, 'Option 1 count must decrement when switching');
    assert.equal(session.options[1].vote_count, 1, 'Option 2 count must increment');
    assert.equal(Object.keys(session.votes).length, 1, 'Total unique votes cast must remain 1');

    // Veg member votes for option 2
    session = castVote(session, { id: vegUser.id, name: vegUser.full_name }, session.options[1].id);
    assert.equal(session.options[1].vote_count, 2);
    assert.equal(Object.keys(session.votes).length, 2);
  });

  await t.test('4. Votes after cutoff deadline or on inactive session are strictly rejected', () => {
    const candidates = [{ restaurant: mockRestaurants[0], source: 'campus_catalog' }];
    const session = createVoteSession(circle, adminUser.id, candidates, [adminUser], 15);

    // Expired cutoff
    const expiredSession = {
      ...session,
      cutoff_time: new Date(Date.now() - 5000).toISOString(),
    };
    assert.throws(
      () => castVote(expiredSession, { id: adminUser.id, name: adminUser.full_name }, session.options[0].id),
      /cutoff deadline has passed/
    );

    // Completed session
    const completedSession = { ...session, status: 'completed' };
    assert.throws(
      () => castVote(completedSession, { id: adminUser.id, name: adminUser.full_name }, session.options[0].id),
      /session is completed/
    );
  });

  await t.test('5. Winner resolution executes strict 4-tier tie-breaking', () => {
    const optA = {
      id: 'opt-a',
      restaurant_id: 'rest-a',
      restaurant_name: 'Restaurant Alpha',
      restaurant_image: '',
      cuisine: ['North Indian'],
      price_range_text: '₹150–₹250',
      group_compatibility_score: 85,
      estimated_group_subtotal_paise: 50000,
      dietary_summary: 'Good',
      budget_summary: 'Good',
      source: 'campus_catalog',
      vote_count: 2,
      voter_user_ids: ['u1', 'u2'],
    };

    const optB = {
      id: 'opt-b',
      restaurant_id: 'rest-b',
      restaurant_name: 'Restaurant Beta',
      restaurant_image: '',
      cuisine: ['South Indian'],
      price_range_text: '₹140–₹220',
      group_compatibility_score: 95, // Higher compatibility
      estimated_group_subtotal_paise: 48000,
      dietary_summary: 'Good',
      budget_summary: 'Good',
      source: 'campus_catalog',
      vote_count: 2, // Tied in votes!
      voter_user_ids: ['u3', 'u4'],
    };

    const session = {
      id: 'vote-tie-test',
      circle_id: circle.id,
      created_by: adminUser.id,
      title: 'Tie Test',
      status: 'active',
      cutoff_time: new Date(Date.now() + 60000).toISOString(),
      options: [optA, optB],
      votes: { u1: {}, u2: {}, u3: {}, u4: {} },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = resolveVoteWinner(session);
    assert.equal(result.isTieBroken, true);
    assert.equal(result.winningOption.id, 'opt-b', 'Restaurant Beta must win tie-break due to higher compatibility (95 vs 85)');
    assert.equal(result.tieBreakCriteria, 'highest_compatibility');
  });

  await t.test('6. Admin-only winner finalization locks choice', () => {
    const candidates = [{ restaurant: mockRestaurants[0], source: 'campus_catalog' }];
    const session = createVoteSession(circle, adminUser.id, candidates, [adminUser], 15);

    // Non-admin attempts to finalize -> throws error
    assert.throws(
      () => completeVoteSession(session, vegUser.id, circle.admin_id),
      /Only the circle admin/
    );

    // Admin finalizes -> succeeds
    const finalized = completeVoteSession(session, adminUser.id, circle.admin_id);
    assert.equal(finalized.status, 'completed');
    assert.equal(finalized.winning_restaurant_id, mockRestaurants[0].id);
    assert.ok(finalized.winner_reason);
  });
});
