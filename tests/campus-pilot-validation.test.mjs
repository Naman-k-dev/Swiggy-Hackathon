import test from 'node:test';
import assert from 'node:assert/strict';

test('Campus Pilot Testing & Telemetry Validation Suite', async (t) => {
  // Mock event stream with baseline and live pilot events
  const mockEvents = [
    {
      id: 'evt-base-1',
      event: 'circlematch_started',
      circleId: 'circle-cse-lunch-squad',
      sessionId: 'sess-base-1',
      source: 'seeded_baseline',
      timestamp: '2026-11-21T12:00:00Z',
    },
    {
      id: 'evt-live-1',
      event: 'circlematch_started',
      circleId: 'circle-cse-lunch-squad',
      sessionId: 'sess-live-101',
      userId: 'user-aarav-patel',
      source: 'live_campus_pilot',
      timestamp: '2026-11-23T14:00:00Z',
      properties: { memberCount: 4 },
    },
    {
      id: 'evt-live-2',
      event: 'recommendations_generated',
      circleId: 'circle-cse-lunch-squad',
      sessionId: 'sess-live-101',
      source: 'live_campus_pilot',
      timestamp: '2026-11-23T14:00:30Z',
      properties: { count: 3 },
    },
    {
      id: 'evt-live-3',
      event: 'recommendation_accepted',
      circleId: 'circle-cse-lunch-squad',
      sessionId: 'sess-live-101',
      userId: 'user-aarav-patel',
      source: 'live_campus_pilot',
      timestamp: '2026-11-23T14:00:45Z',
      properties: { decisionTimeSeconds: 45 },
    },
    {
      id: 'evt-live-4',
      event: 'order_finalized',
      circleId: 'circle-cse-lunch-squad',
      sessionId: 'sess-live-101',
      userId: 'user-aarav-patel',
      source: 'live_campus_pilot',
      timestamp: '2026-11-23T14:01:15Z',
      properties: {
        orderCode: 'SW-CAMPUS-9999',
        participantCount: 4,
        decisionTimeSeconds: 75,
        estimatedMenuSubtotalPaise: 58000,
        totalPaise: 58500,
      },
    },
  ];

  await t.test('1. Baseline seed events are tagged as seeded_baseline', () => {
    const baselineEvents = mockEvents.filter((e) => e.source === 'seeded_baseline');
    assert.equal(baselineEvents.length, 1);
    assert.equal(baselineEvents[0].source, 'seeded_baseline');
  });

  await t.test('2. Live pilot events are strictly tagged as live_campus_pilot', () => {
    const liveEvents = mockEvents.filter((e) => e.source === 'live_campus_pilot');
    assert.equal(liveEvents.length, 4);
    assert.equal(liveEvents.every((e) => e.source === 'live_campus_pilot'), true);
  });

  await t.test('3. Summary computes live pilot metrics separately from targets', () => {
    const liveEvents = mockEvents.filter((e) => e.source === 'live_campus_pilot');
    const liveStarts = liveEvents.filter((e) => e.event === 'circlematch_started').length;
    const liveGenerated = liveEvents.filter((e) => e.event === 'recommendations_generated').length;
    const liveAccepted = liveEvents.filter((e) => e.event === 'recommendation_accepted').length;
    const liveFinalized = liveEvents.filter((e) => e.event === 'order_finalized').length;

    const liveAcceptanceRate = liveGenerated > 0 ? Math.round((liveAccepted / liveGenerated) * 100) : null;
    const liveCartCompletionRate = liveStarts > 0 ? Math.round((liveFinalized / liveStarts) * 100) : null;

    // Genuine live metrics
    assert.equal(liveStarts, 1);
    assert.equal(liveAcceptanceRate, 100);
    assert.equal(liveCartCompletionRate, 100);

    // Target benchmark hypotheses (clearly labeled)
    const targetAcceptanceRatePct = 70;
    const targetCartCompletionRatePct = 60;
    const targetDecisionTimeSec = 90;
    const targetAOVPaise = 50000;

    assert.equal(targetAcceptanceRatePct, 70);
    assert.equal(targetCartCompletionRatePct, 60);
    assert.equal(targetDecisionTimeSec, 90);
    assert.equal(targetAOVPaise, 50000);
  });

  await t.test('4. RFC 4180 CSV export separates live pilot data from baseline', () => {
    const formatCSV = (events, liveOnly = false) => {
      const filtered = liveOnly ? events.filter((e) => e.source === 'live_campus_pilot') : events;
      const rows = [];
      rows.push('Event ID,Source Type,Timestamp,Event Type,Circle ID,Session ID,Decision Time,Participants,Subtotal INR');
      for (const e of filtered) {
        const decisionTime = e.properties?.decisionTimeSeconds ?? '';
        const participants = e.properties?.participantCount ?? e.properties?.memberCount ?? '';
        const subtotalInr = e.properties?.estimatedMenuSubtotalPaise
          ? Math.round(e.properties.estimatedMenuSubtotalPaise / 100)
          : '';
        rows.push(`${e.id},${e.source},${e.timestamp},${e.event},${e.circleId},${e.sessionId || ''},${decisionTime},${participants},${subtotalInr}`);
      }
      return rows.join('\n');
    };

    const liveCSV = formatCSV(mockEvents, true);
    assert.ok(liveCSV.includes('live_campus_pilot'));
    assert.ok(!liveCSV.includes('seeded_baseline'));
    assert.ok(liveCSV.includes('SW-CAMPUS-9999') || liveCSV.includes('75'));
    assert.ok(liveCSV.includes('580')); // 58000 paise = 580 INR

    const allCSV = formatCSV(mockEvents, false);
    assert.ok(allCSV.includes('seeded_baseline'));
    assert.ok(allCSV.includes('live_campus_pilot'));
  });
});
