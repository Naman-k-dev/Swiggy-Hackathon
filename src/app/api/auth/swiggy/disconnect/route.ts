import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Disconnects Swiggy Food MCP session by clearing cookies
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('swiggy_mcp_token');
  cookieStore.delete('swiggy_oauth_pkce');

  return NextResponse.json({
    success: true,
    message: 'Disconnected from Swiggy Food MCP. Switched to campus verified demo mode.',
  });
}
