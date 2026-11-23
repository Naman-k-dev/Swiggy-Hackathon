import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { swiggyMCPService, SwiggyTokenResponse, SwiggyCartItemPayload } from '@/lib/services/swiggy-mcp-service';

/**
 * Server-side endpoint for Swiggy Food Cart MCP tools:
 * - GET: Calls get_food_cart tool
 * - POST: Calls update_food_cart tool with explicit organizer confirmation
 *
 * SAFETY GUARDRAIL:
 * Does NOT place live orders or initiate payments.
 * Campus Circles simulated checkout remains isolated and default.
 */
export async function GET() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('swiggy_mcp_token')?.value;

  let accessToken: string | undefined;
  if (tokenCookie) {
    try {
      const parsed: SwiggyTokenResponse = JSON.parse(tokenCookie);
      accessToken = parsed.access_token;
    } catch {
      // ignore
    }
  }

  if (!accessToken) {
    return NextResponse.json({
      isConnected: false,
      message: 'Not authenticated with Swiggy Food MCP. Using simulated in-app cart.',
      cart: null,
    });
  }

  const res = await swiggyMCPService.callMCPTool<{
    cartId: string;
    restaurantId: string;
    items: Array<Record<string, unknown>>;
    bill: Record<string, unknown>;
  }>('get_food_cart', {}, accessToken);

  if (res.success && res.result) {
    return NextResponse.json({
      isConnected: true,
      cart: res.result,
      source: 'swiggy_mcp_live',
    });
  }

  return NextResponse.json({
    isConnected: true,
    cart: null,
    message: 'Cart is currently empty or sandbox session active.',
    source: 'campus_verified_demo',
  });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('swiggy_mcp_token')?.value;

  let accessToken: string | undefined;
  if (tokenCookie) {
    try {
      const parsed: SwiggyTokenResponse = JSON.parse(tokenCookie);
      accessToken = parsed.access_token;
    } catch {
      // ignore
    }
  }

  try {
    const body = await request.json();
    const { restaurantId, items, confirmTransfer } = body;

    if (!confirmTransfer) {
      return NextResponse.json(
        {
          error: 'Explicit confirmation required before modifying personal Swiggy cart.',
          code: 'CONFIRMATION_REQUIRED',
        },
        { status: 400 }
      );
    }

    if (!restaurantId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid cart payload: restaurantId and items required.' },
        { status: 400 }
      );
    }

    const typedItems: SwiggyCartItemPayload[] = items.map((i: Record<string, unknown>) => ({
      itemId: String(i.itemId || i.item_id || ''),
      name: String(i.name || i.item_name || ''),
      quantity: typeof i.quantity === 'number' ? i.quantity : 1,
      pricePaise:
        typeof i.pricePaise === 'number'
          ? i.pricePaise
          : typeof i.item_price_paise === 'number'
          ? i.item_price_paise
          : 0,
      isVeg: Boolean(i.isVeg ?? i.item_is_veg),
      variants:
        typeof i.variants === 'object' && i.variants !== null
          ? (i.variants as Record<string, unknown>)
          : undefined,
      addOns: Array.isArray(i.addOns) ? (i.addOns as Array<{ id: string; name: string }>) : undefined,
    }));

    const result = await swiggyMCPService.updateFoodCart(restaurantId, typedItems, accessToken);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Cart update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
