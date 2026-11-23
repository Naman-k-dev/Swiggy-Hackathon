import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { swiggyMCPService, SwiggyTokenResponse } from '@/lib/services/swiggy-mcp-service';

interface Context {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Endpoint to retrieve restaurant menu using Swiggy Food MCP get_restaurant_menu tool.
 */
export async function GET(request: NextRequest, { params }: Context) {
  const resolvedParams = await params;
  const restaurantId = resolvedParams.id;

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

  const result = await swiggyMCPService.getRestaurantMenu(restaurantId, accessToken);

  if (!result.restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
  }

  return NextResponse.json({
    restaurant: result.restaurant,
    menuCategories: result.menuCategories,
    source: result.source,
  });
}
