import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { calculateMemberSplit } from '../src/lib/utils.ts';
import {
  canModifyCartItem,
  canManageSession,
  canJoinCircle,
} from '../src/lib/security/authorization.ts';

const ROOT = process.cwd();

function readRepoFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

test('Competition Readiness Suite', async (t) => {
  await t.test('calculateMemberSplit populates member items for Reorder while keeping integer-paise math', () => {
    const sampleCart = [
      {
        id: 'c1',
        user_id: 'u1',
        user_name: 'Student A',
        item_name: 'Paneer Roll',
        item_price_paise: 17900,
        quantity: 2,
      },
      {
        id: 'c2',
        user_id: 'u2',
        user_name: 'Student B',
        item_name: 'Veg Bowl',
        item_price_paise: 19900,
        quantity: 1,
      },
    ];

    const breakdowns = calculateMemberSplit(sampleCart, 0, 500, 2000);
    assert.equal(breakdowns.length, 2);

    const a = breakdowns.find((m) => m.user_id === 'u1');
    const b = breakdowns.find((m) => m.user_id === 'u2');
    assert.ok(a && b);
    assert.equal(a.items_count, 2);
    assert.equal(a.subtotal_paise, 35800);
    assert.equal(a.items.length, 1);
    assert.equal(a.items[0].item_name, 'Paneer Roll');

    assert.equal(b.items_count, 1);
    assert.equal(b.subtotal_paise, 19900);
    assert.equal(b.items.length, 1);

    // Net extras = 0 + 500 - 2000 = -1500 => -750 paise per member
    assert.equal(a.share_paise, 35800 - 750);
    assert.equal(b.share_paise, 19900 - 750);
  });

  await t.test('Mock seed & scheduler reference only valid DEMO_RESTAURANTS IDs', () => {
    const restaurantsSrc = readRepoFile('src/lib/data/mock-restaurants.ts');
    const seedSrc = readRepoFile('src/lib/data/mock-seed.ts');
    const schedulerSrc = readRepoFile('src/components/circles/MealWindowSchedulerModal.tsx');

    const restaurantIds = new Set(
      Array.from(restaurantsSrc.matchAll(/id:\s*'([^']+)'/g)).map((m) => m.at(1))
    );
    assert.ok(restaurantIds.size >= 6);

    const seedRefs = [
      ...Array.from(seedSrc.matchAll(/restaurant_id:\s*'([^']+)'/g)).map((m) => m[1]),
      ...Array.from(seedSrc.matchAll(/preferred_restaurant_id:\s*'([^']+)'/g)).map((m) => m[1]),
    ];
    for (const refId of seedRefs) {
      assert.ok(restaurantIds.has(refId), `Seed references missing restaurant ID: ${refId}`);
    }

    assert.equal(schedulerSrc.includes('rest-chai-bytes'), false);
    assert.equal(schedulerSrc.includes('rest-spice-symphony'), false);
    assert.ok(schedulerSrc.includes('rest-chai-maggi'));
    assert.ok(schedulerSrc.includes('rest-night-canteen'));
  });

  await t.test('Swiggy MCP strictly distinguishes live partner mode from sandbox/demo mode', () => {
    const mcpSrc = readRepoFile('src/lib/services/swiggy-mcp-service.ts');
    assert.ok(mcpSrc.includes("mode: 'live' | 'sandbox' | 'demo'"));
    assert.ok(mcpSrc.includes('isSandboxToken'));
    assert.ok(mcpSrc.includes("startsWith('swiggy_mcp_sbx_')"));
    // Live discovery scopes must match https://mcp.swiggy.com/.well-known/oauth-authorization-server
    assert.ok(mcpSrc.includes("'mcp:tools'"));
    assert.ok(mcpSrc.includes("'mcp:resources'"));
    assert.ok(mcpSrc.includes("'mcp:prompts'"));

    const authRouteSrc = readRepoFile('src/app/api/auth/swiggy/authorize/route.ts');
    assert.ok(authRouteSrc.includes("rawReturnTo.startsWith('/')"));
    assert.ok(authRouteSrc.includes("!rawReturnTo.startsWith('//')"));
  });

  await t.test('Gemini API key is strictly server-side and never referenced with NEXT_PUBLIC_', () => {
    const geminiSrc = readRepoFile('src/lib/services/gemini-service.ts');
    const explainSrc = readRepoFile('src/app/api/circlematch/explain/route.ts');

    assert.equal(geminiSrc.includes('NEXT_PUBLIC_GEMINI_API_KEY'), false);
    assert.equal(explainSrc.includes('NEXT_PUBLIC_GEMINI_API_KEY'), false);
    assert.ok(geminiSrc.includes('process.env.GEMINI_API_KEY'));
  });

  await t.test('Authorization guards block expired deadlines, cross-member cart edits, and guest joins', () => {
    const member = { id: 'student-uuid-1', isDemo: false };
    const otherMember = { id: 'student-uuid-2', isDemo: false };
    const circle = { id: 'circle-1', adminId: member.id, inviteCode: 'PWIOI1' };
    const pastSession = {
      id: 'sess-past',
      circleId: circle.id,
      status: 'open',
      cutoffTime: new Date(Date.now() - 60000).toISOString(),
    };
    const item = { id: 'item-1', sessionId: pastSession.id, circleId: circle.id, userId: member.id };

    assert.equal(canModifyCartItem(member, item, pastSession, true).allowed, false);
    assert.equal(canManageSession(otherMember, circle).allowed, false);
    assert.equal(canJoinCircle(circle, 'WRONG1').allowed, false);
    assert.equal(canJoinCircle(circle, 'PWIOI1').allowed, true);
  });
});
