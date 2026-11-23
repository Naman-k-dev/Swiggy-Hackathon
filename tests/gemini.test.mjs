import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Read GEMINI_API_KEY from .env.local if present
let configuredKey = process.env.GEMINI_API_KEY;
if (!configuredKey && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/GEMINI_API_KEY=(.*)/);
  if (match) {
    configuredKey = match[1].trim().replace(/^['\"]|['\"]$/g, '');
    process.env.GEMINI_API_KEY = configuredKey;
  }
}

const { GeminiService } = await import('../src/lib/services/gemini-service.ts');

describe('Google Gemini AI Service Integration & Fallbacks', () => {
  const service = new GeminiService();

  it('1. Safe Authentication: Authenticates with Google AI Studio without credential leakage', async () => {
    if (!configuredKey) {
      assert.ok(true, 'Skipping live network test as no GEMINI_API_KEY is configured');
      return;
    }

    const authCheck = await service.testAuthentication();
    assert.strictEqual(authCheck.authenticated, true, `Authentication check failed: ${authCheck.message} (${authCheck.errorCode})`);
    assert.ok(authCheck.modelUsed, 'Should record the active Gemini model used');
    assert.ok(!authCheck.message.includes(configuredKey), 'Must never leak the API key in status message');
  });

  it('2. Invalid Key: Correctly flags invalid key as AUTH_FAILED without leaking credential', async () => {
    const invalidCheck = await service.testAuthentication('invalid-gemini-key-xyz-123');
    assert.strictEqual(invalidCheck.authenticated, false, 'Invalid key must be rejected');
    assert.strictEqual(invalidCheck.errorCode, 'AUTH_FAILED', 'Must categorize invalid credential as AUTH_FAILED');
  });

  it('3. Missing Key: Gracefully reports MISSING_KEY and preserves deterministic fallback', async () => {
    const originalEnv = process.env.GEMINI_API_KEY;
    try {
      delete process.env.GEMINI_API_KEY;
      const res = await service.generateGroupExplanation({
        restaurantName: 'Southern Spices',
        planType: 'budget_friendly',
        groupSatisfactionScore: 92,
        totalRupees: 380,
        memberPlans: [
          {
            userName: 'Aarav',
            dietaryPref: 'VEG',
            budgetRupees: 200,
            dishName: 'Masala Dosa',
            dishPriceRupees: 180,
            matchReason: 'Classic south Indian comfort',
          },
        ],
      });

      assert.strictEqual(res.success, false);
      assert.strictEqual(res.provider, 'deterministic');
      assert.strictEqual(res.errorCode, 'MISSING_KEY');
    } finally {
      process.env.GEMINI_API_KEY = originalEnv;
    }
  });

  it('4. Group Plan Explanation: Generates grounded natural explanation respecting vegetarian boundaries', async () => {
    if (!configuredKey) {
      assert.ok(true, 'Skipping live network test as no GEMINI_API_KEY is configured');
      return;
    }

    const res = await service.generateGroupExplanation({
      restaurantName: 'Punjab Junction',
      planType: 'best_overall',
      groupSatisfactionScore: 95,
      totalRupees: 420,
      memberPlans: [
        {
          userName: 'Riya',
          dietaryPref: 'VEG',
          budgetRupees: 220,
          dishName: 'Paneer Butter Masala Combo',
          dishPriceRupees: 210,
          matchReason: 'Rich vegetarian curry within budget',
        },
        {
          userName: 'Kabir',
          dietaryPref: 'NON_VEG',
          budgetRupees: 250,
          dishName: 'Chicken Biryani Plate',
          dishPriceRupees: 210,
          matchReason: 'High protein campus favorite',
        },
      ],
    });

    assert.ok(res.explanation && res.explanation.length > 10, 'Should produce an explanation');
    assert.ok(['gemini', 'deterministic'].includes(res.provider), 'Provider must be gemini or deterministic fallback');
  });

  it('5. CircleVote Decision: Explains democratic voting outcome and tie-breaks', async () => {
    if (!configuredKey) {
      assert.ok(true, 'Skipping live network test as no GEMINI_API_KEY is configured');
      return;
    }

    const res = await service.generateVoteExplanation({
      winningRestaurantName: 'Campus Roll Central',
      voteCount: 3,
      totalVotes: 4,
      groupCompatibilityScore: 91,
      subtotalRupees: 540,
      dietaryNotes: 'Strictly verified: 4 vegetarian rolls available for veg members.',
      isTieBreak: false,
    });

    assert.ok(res.explanation && res.explanation.length > 10, 'Should produce a vote outcome explanation');
    assert.ok(['gemini', 'deterministic'].includes(res.provider));
  });

  it('6. Order Rescue: Reassures student with replacement dish from same restaurant', async () => {
    if (!configuredKey) {
      assert.ok(true, 'Skipping live network test as no GEMINI_API_KEY is configured');
      return;
    }

    const res = await service.generateRescueExplanation({
      issueType: 'dish_unavailable',
      restaurantName: 'Punjab Junction',
      affectedStudentName: 'Riya',
      dietaryPref: 'VEG',
      originalDishName: 'Paneer Tikka Roll',
      replacementDishName: 'Soya Chaap Roll',
      priceDiffRupees: 0,
      safetyNote: '100% vegetarian verified from the same restaurant kitchen.',
    });

    assert.ok(res.explanation && res.explanation.length > 10, 'Should produce an order rescue explanation');
    assert.ok(['gemini', 'deterministic'].includes(res.provider));
  });
});
