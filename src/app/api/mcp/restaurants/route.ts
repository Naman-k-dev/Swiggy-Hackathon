import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { swiggyMCPService, SwiggyTokenResponse } from '@/lib/services/swiggy-mcp-service';

/**
 * Endpoint for discovering restaurants via Swiggy Food MCP search_restaurants tool.
 * Falls back to campus verified offline catalog if unauthenticated or demo mode requested.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : 28.4744;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : 77.5040;
  const forceMode = searchParams.get('mode'); // 'demo' | 'live'

  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('swiggy_mcp_token')?.value;

  let accessToken: string | undefined;
  if (tokenCookie && forceMode !== 'demo') {
    try {
      const parsed: SwiggyTokenResponse = JSON.parse(tokenCookie);
      accessToken = parsed.access_token;
    } catch {
      // ignore
    }
  }

  const { restaurants, source } = await swiggyMCPService.searchRestaurants({
    query,
    latitude: lat,
    longitude: lng,
    accessToken,
  });

  return NextResponse.json({
    restaurants,
    source,
    count: restaurants.length,
    timestamp: new Date().toISOString(),
  });
}
