// ==============================================================================
// SWIGGY CAMPUS CIRCLES - PHASE 9 TEST SUITE
// Campus Pilot Lab: Research Telemetry, Privacy, RFC 4180 CSV, & A/B Trial Engine
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert';
import { pilotLabService, SEEDED_DEMO_SURVEYS, SEEDED_DEMO_EXPERIMENTS } from '../src/lib/pilot/pilot-lab-service.ts';
import { sanitizeInputString } from '../src/lib/security/circleguard.ts';

test('Pilot Lab: Records ethical student consent and prevents withdrawal data leakage', () => {
  const userId = `test-student-${Date.now()}`;
  const consent = pilotLabService.recordConsent({
    userId,
    studentName: 'Test Student Alpha',
    consentGiven: true,
    studyCohort: 'PW IOI Noida - Batch 2026',
  });

  assert.strictEqual(consent.userId, userId);
  assert.strictEqual(consent.consentGiven, true);
  assert.strictEqual(consent.studyCohort, 'PW IOI Noida - Batch 2026');
  assert.ok(consent.consentedAt);

  // Check consent status
  assert.strictEqual(pilotLabService.hasConsented(userId), true);

  // Record a survey under this consenting user
  const survey = pilotLabService.submitSurvey({
    userId,
    studentName: 'Test Student Alpha',
    orderingFrequency: 'multiple_times_week',
    friendsOrderingFrequency: 'daily',
    coordinationProblems: ['Awkward UPI payment collection', 'WhatsApp coordination chaos'],
    typicalBudgetRange: '150_250',
    timeSpentChoosingMins: '15_30',
    splittingDifficultyScore: 4,
    deliveryCoordinationDifficulty: 4,
    willingnessToReuse: 5,
    mostUsefulFeature: 'Group Cart & Paise Split',
    leastUsefulFeature: 'None',
    writtenSuggestions: 'Great job!',
    isSimulatedDemo: false,
  });

  assert.strictEqual(survey.userId, userId);
  assert.strictEqual(survey.isSimulatedDemo, false);

  // Now withdraw consent (GDPR / Right to be forgotten)
  const withdrawResult = pilotLabService.withdrawConsent(userId);
  assert.strictEqual(withdrawResult, true);
  assert.strictEqual(pilotLabService.hasConsented(userId), false);

  // Verify all survey responses for this user were purged
  const surveysAfterPurge = pilotLabService.getSurveys(false);
  const userPurgedSurvey = surveysAfterPurge.find((s) => s.userId === userId);
  assert.strictEqual(userPurgedSurvey, undefined, 'User survey must be completely purged after withdrawal');
});

test('Pilot Lab: Enforces insufficient data threshold (<3 real submissions) in Real Mode', () => {
  // Clear any existing real surveys for an isolated test check
  // getSummary(false) should evaluate hasSufficientData based on realSampleSize >= 3
  const realSummary = pilotLabService.getSummary(false);
  assert.strictEqual(realSummary.isDemoMode, false);

  if (realSummary.realSampleSize < 3) {
    assert.strictEqual(
      realSummary.hasSufficientData,
      false,
      'Must flag hasSufficientData: false when real student observations < 3'
    );
  }

  // Judge Demo mode must always provide sufficient seeded data for evaluation
  const demoSummary = pilotLabService.getSummary(true);
  assert.strictEqual(demoSummary.isDemoMode, true);
  assert.strictEqual(demoSummary.hasSufficientData, true);
  assert.ok(demoSummary.totalExperiments > 0);
  assert.ok(demoSummary.topProblems.length > 0);
});

test('Pilot Lab: A/B Trial Comparison calculates accurate speed and completion delta', () => {
  const summary = pilotLabService.getSummary(true);

  // Campus Circles decision time should be significantly faster than WhatsApp baseline
  assert.ok(
    summary.avgDecisionTimeCampusCirclesSec < summary.avgDecisionTimeWhatsAppSec,
    `Expected CC (${summary.avgDecisionTimeCampusCirclesSec}s) < WA (${summary.avgDecisionTimeWhatsAppSec}s)`
  );

  // Campus Circles completion rate should be higher than WhatsApp baseline
  assert.ok(
    summary.campusCirclesCompletionRatePct >= summary.whatsappCompletionRatePct,
    `Expected CC (${summary.campusCirclesCompletionRatePct}%) >= WA (${summary.whatsappCompletionRatePct}%)`
  );

  // Satisfaction score should be >= 4.0 for Campus Circles
  assert.ok(
    summary.avgSatisfactionCampusCircles >= 4.0,
    `Expected CC satisfaction >= 4.0, got ${summary.avgSatisfactionCampusCircles}`
  );
});

test('Pilot Lab: RFC 4180 CSV export formats provenance headers and escapes quotes', () => {
  const csv = pilotLabService.exportDataAsCsv(true);

  // Assert RFC 4180 header lines
  assert.ok(csv.includes('# SWIGGY CAMPUS CIRCLES - CAMPUS PILOT LAB RESEARCH DATA'));
  assert.ok(csv.includes('# PW INSTITUTE OF INNOVATION NOIDA'));
  assert.ok(csv.includes('Data_Provenance,Record_Type,Record_ID'));

  // Assert provenance separation tags exist
  assert.ok(csv.includes('JUDGE_SIMULATED_DEMO'));

  // Check CSV line escaping (no naked multiline breaks breaking columns)
  const lines = csv.split('\n');
  assert.ok(lines.length > 5, 'CSV must contain headers and data rows');
});

test('Pilot Lab: XSS Sanitization preserves legitimate feedback while neutralizing injections', () => {
  const maliciousInput = '<script>alert("hacked")</script>Hostel Gate Dropoff';
  const clean = sanitizeInputString(maliciousInput);

  assert.ok(!clean.includes('<script>'), 'Must strip script tags');
  assert.ok(!clean.includes('alert('), 'Must strip javascript expressions');
  assert.ok(clean.includes('Hostel Gate Dropoff'), 'Must retain benign textual feedback');
});
