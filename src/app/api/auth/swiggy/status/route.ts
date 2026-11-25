import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { swiggyMCPService, SwiggyTokenResponse } from '@/lib/services/swiggy-mcp-service';

/**
 * Returns the current authenticated status of Swiggy Food MCP
 * Never exposes the raw token secret to client components.
 */
export async function GET() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('swiggy_mcp_token')?.value;

  let tokenData: SwiggyTokenResponse | undefined;
  if (tokenCookie) {
    try {
      tokenData = JSON.parse(tokenCookie);
    } catch {
      // invalid cookie
    }
  }

  const status = swiggyMCPService.getStatus(tokenData);

  return NextResponse.json({
    authenticated: status.isConnected,
    isConnected: status.isConnected,
    isLive: status.isLive,
    isSandbox: status.isSandbox,
    mode: status.mode,
    provider: status.provider,
    statusMessage: status.statusMessage,
    expiresAt: status.expiresAt,
    supportedTools: status.supportedTools,
  });
}
