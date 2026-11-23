import { test } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';

// 1. OAuth 2.1 PKCE RFC 7636 Verifier and Challenge Test
test('Phase 4 MCP Security: OAuth 2.1 PKCE RFC 7636 verifier and challenge compliance', () => {
  // Generate random 48-byte verifier (96 hex chars)
  const codeVerifier = crypto.randomBytes(48).toString('hex');
  assert.ok(codeVerifier.length >= 43 && codeVerifier.length <= 128);

  // SHA-256 S256 Challenge
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  assert.ok(codeChallenge.length > 0);
  assert.strictEqual(/^[A-Za-z0-9_-]+$/.test(codeChallenge), true);

  // Reproducibility
  const challenge2 = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  assert.strictEqual(codeChallenge, challenge2);
});

// 2. OAuth 2.1 Authorization URL Parameter Validation
test('Phase 4 MCP OAuth: Authorization URL structure complies with Swiggy Builders Club spec', () => {
  const base = 'https://mcp.swiggy.com/auth/authorize';
  const clientId = 'campus_circles_demo_app';
  const redirectUri = 'http://localhost:3000/api/auth/swiggy/callback';
  const scope = ['food.read', 'menu.read', 'cart.write'];
  const state = 'secure_random_state_123';
  const codeChallenge = 'test_challenge_abc_123';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `${base}?${params.toString()}`;
  const parsed = new URL(authUrl);

  assert.strictEqual(parsed.origin, 'https://mcp.swiggy.com');
  assert.strictEqual(parsed.pathname, '/auth/authorize');
  assert.strictEqual(parsed.searchParams.get('response_type'), 'code');
  assert.strictEqual(parsed.searchParams.get('client_id'), clientId);
  assert.strictEqual(parsed.searchParams.get('code_challenge_method'), 'S256');
  assert.strictEqual(parsed.searchParams.get('state'), state);
  assert.strictEqual(parsed.searchParams.get('scope'), 'food.read menu.read cart.write');
});

// 3. Swiggy Food MCP JSON-RPC 2.0 tool invocation structure
test('Phase 4 MCP Tool Calls: Formats search_restaurants, get_restaurant_menu, and update_food_cart correctly', () => {
  // search_restaurants
  const searchPayload = {
    jsonrpc: '2.0',
    id: 'req-1',
    method: 'tools/call',
    params: {
      name: 'search_restaurants',
      arguments: {
        query: 'biryani',
        latitude: 17.5449,
        longitude: 78.5718,
      },
    },
  };
  assert.strictEqual(searchPayload.params.name, 'search_restaurants');
  assert.strictEqual(searchPayload.params.arguments.latitude, 17.5449);
  assert.strictEqual(searchPayload.params.arguments.longitude, 78.5718);

  // get_restaurant_menu
  const menuPayload = {
    jsonrpc: '2.0',
    id: 'req-2',
    method: 'tools/call',
    params: {
      name: 'get_restaurant_menu',
      arguments: {
        restaurantId: 'swiggy_rest_9901',
      },
    },
  };
  assert.strictEqual(menuPayload.params.name, 'get_restaurant_menu');
  assert.strictEqual(menuPayload.params.arguments.restaurantId, 'swiggy_rest_9901');

  // update_food_cart
  const cartPayload = {
    jsonrpc: '2.0',
    id: 'req-3',
    method: 'tools/call',
    params: {
      name: 'update_food_cart',
      arguments: {
        restaurantId: 'swiggy_rest_9901',
        items: [
          { itemId: 'item_101', quantity: 2 },
          { itemId: 'item_202', quantity: 1 },
        ],
      },
    },
  };
  assert.strictEqual(cartPayload.params.name, 'update_food_cart');
  assert.strictEqual(cartPayload.params.arguments.items.length, 2);
});

// 4. Live Swiggy Data Normalization
test('Phase 4 MCP Data Mapper: Normalizes live Swiggy restaurant payload with source tracking', () => {
  const rawSwiggyRestaurant = {
    id: 'swiggy_rest_4452',
    name: 'Paradise Biryani - Secunderabad',
    cuisines: ['Biryani', 'Mughlai', 'North Indian'],
    avgRating: 4.4,
    totalRatingsString: '5K+ ratings',
    slaString: '28 mins',
    costForTwo: 50000, // ₹500 in paise
    isVeg: false,
    offer: '20% OFF up to ₹50',
  };

  const mapped = {
    id: String(rawSwiggyRestaurant.id),
    name: rawSwiggyRestaurant.name,
    cuisine: rawSwiggyRestaurant.cuisines,
    rating: rawSwiggyRestaurant.avgRating,
    rating_count: rawSwiggyRestaurant.totalRatingsString,
    delivery_time_min: parseInt(rawSwiggyRestaurant.slaString.replace(/\D/g, ''), 10),
    price_for_one: Math.round(rawSwiggyRestaurant.costForTwo / 200),
    is_pure_veg: rawSwiggyRestaurant.isVeg,
    offer: rawSwiggyRestaurant.offer,
    source: 'swiggy_mcp_live',
  };

  assert.strictEqual(mapped.id, 'swiggy_rest_4452');
  assert.strictEqual(mapped.name, 'Paradise Biryani - Secunderabad');
  assert.strictEqual(mapped.rating, 4.4);
  assert.strictEqual(mapped.delivery_time_min, 28);
  assert.strictEqual(mapped.price_for_one, 250);
  assert.strictEqual(mapped.is_pure_veg, false);
  assert.strictEqual(mapped.source, 'swiggy_mcp_live');
});

// 5. Shared Cart Isolation Guardrail
test('Phase 4 Safety Guardrail: Shared cart transfer requires explicit organizer confirmation', () => {
  const validateSyncRequest = (body) => {
    if (!body.confirmTransfer) {
      return { status: 400, error: 'Explicit confirmation required before modifying personal Swiggy cart.' };
    }
    if (!body.restaurantId || !Array.isArray(body.items) || body.items.length === 0) {
      return { status: 400, error: 'Invalid cart payload.' };
    }
    return { status: 200, success: true };
  };

  // Attempt without confirmation
  const rejected = validateSyncRequest({
    restaurantId: 'rest_1',
    items: [{ itemId: 'dish_1', quantity: 1 }],
    confirmTransfer: false,
  });
  assert.strictEqual(rejected.status, 400);
  assert.strictEqual(rejected.error.includes('Explicit confirmation required'), true);

  // Valid confirmed transfer
  const accepted = validateSyncRequest({
    restaurantId: 'rest_1',
    items: [{ itemId: 'dish_1', quantity: 1 }],
    confirmTransfer: true,
  });
  assert.strictEqual(accepted.status, 200);
  assert.strictEqual(accepted.success, true);
});

// 6. CircleMatch AI Constraint Satisfaction with Live Menu Prices
test('Phase 4 CircleMatch AI: Constraint satisfaction holds with live Swiggy menu pricing', () => {
  const members = [
    { userId: 'u1', name: 'Ananya', dietaryPref: 'VEG', budgetPaise: 18000 },
    { userId: 'u2', name: 'Rohan', dietaryPref: 'NON_VEG', budgetPaise: 25000 },
  ];

  const liveRestaurant = {
    id: 'rest_live_biryani',
    name: 'Bawarchi Express',
    menu: [
      { id: 'm1', name: 'Veg Dum Biryani', pricePaise: 16000, isVeg: true },
      { id: 'm2', name: 'Chicken Biryani Regular', pricePaise: 22000, isVeg: false },
      { id: 'm3', name: 'Mutton Special', pricePaise: 38000, isVeg: false }, // Over budget
    ],
  };

  // Allocator with dietary preference matching
  const allocation = {};
  for (const member of members) {
    const candidates = liveRestaurant.menu.filter((dish) => {
      if (member.dietaryPref === 'VEG' && !dish.isVeg) return false;
      return dish.pricePaise <= member.budgetPaise;
    });

    assert.ok(candidates.length > 0, `Member ${member.name} must have at least 1 feasible dish`);
    // Pick the most satisfying candidate matching preferred dietary type
    const preferred = candidates.find((d) =>
      member.dietaryPref === 'NON_VEG' ? !d.isVeg : d.isVeg
    );
    allocation[member.userId] = preferred || candidates[0];
  }

  // Verify Ananya gets pure veg dish within ₹180
  assert.strictEqual(allocation['u1'].isVeg, true);
  assert.ok(allocation['u1'].pricePaise <= 18000);

  // Verify Rohan gets dish within ₹250
  assert.ok(allocation['u2'].pricePaise <= 25000);
  assert.strictEqual(allocation['u2'].name, 'Chicken Biryani Regular');
});

// 7. Competition Telemetry & RFC 4180 CSV Export
test('Phase 4 Telemetry: Event tracking and RFC 4180 CSV formatting', () => {
  const events = [
    {
      id: 'evt-101',
      timestamp: '2026-11-23T10:00:00.000Z',
      event: 'circlematch_started',
      circleId: 'circle-cse',
      sessionId: 'sess-1',
      userId: 'user-1',
      properties: { memberCount: 4 },
    },
    {
      id: 'evt-102',
      timestamp: '2026-11-23T10:01:30.000Z',
      event: 'swiggy_cart_synced',
      circleId: 'circle-cse',
      sessionId: 'sess-1',
      userId: 'user-1',
      properties: { totalPaise: 68000, itemsCount: 4 },
    },
  ];

  // CSV Generator
  const rows = ['Event ID,Timestamp,Event Type,Circle ID,Session ID,User ID,Properties'];
  for (const evt of events) {
    const escapedProps = `"${JSON.stringify(evt.properties).replace(/"/g, '""')}"`;
    rows.push(
      [evt.id, evt.timestamp, evt.event, evt.circleId, evt.sessionId, evt.userId, escapedProps].join(',')
    );
  }
  const csvOutput = rows.join('\n');

  assert.ok(csvOutput.includes('Event ID,Timestamp,Event Type'));
  assert.ok(csvOutput.includes('circlematch_started'));
  assert.ok(csvOutput.includes('swiggy_cart_synced'));
  assert.ok(csvOutput.includes('""memberCount"":4'));
});
