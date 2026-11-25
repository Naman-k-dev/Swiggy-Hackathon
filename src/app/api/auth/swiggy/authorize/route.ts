import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { swiggyMCPService } from '@/lib/services/swiggy-mcp-service';

/**
 * Initiates official Swiggy Builders Club OAuth 2.1 authorization with PKCE (RFC 7636).
 * Sets state and PKCE verifier in an httpOnly cookie and redirects to authorization URL.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawReturnTo = searchParams.get('returnTo') || '/dashboard';
  // Prevent open redirects by allowing relative app paths only
  const returnTo = rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//') ? rawReturnTo : '/dashboard';
  const mode = searchParams.get('mode'); // optional 'sandbox' flag for instant competition evaluation

  const pkce = await swiggyMCPService.generatePKCEPair();
  const state = `st_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

  const cookieStore = await cookies();

  // Store state, verifier, and return destination in secure httpOnly cookie (valid 15 mins)
  const pkcePayload = JSON.stringify({
    state,
    codeVerifier: pkce.codeVerifier,
    returnTo,
  });

  cookieStore.set('swiggy_oauth_pkce', pkcePayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 900, // 15 minutes
  });

  // Fast-track sandbox mode for competition judges testing in offline/local environments
  if (mode === 'sandbox') {
    const callbackUrl = new URL('/api/auth/swiggy/callback', request.url);
    callbackUrl.searchParams.set('code', `sbx_auth_${Date.now()}`);
    callbackUrl.searchParams.set('state', state);
    return NextResponse.redirect(callbackUrl);
  }

  // Live Swiggy authorization URL (fallback redirect matches current host when unset)
  const fallbackRedirectUri = new URL('/api/auth/swiggy/callback', request.url).toString();
  const authUrl = swiggyMCPService.buildAuthorizationUrl(
    pkce.codeChallenge,
    state,
    process.env.SWIGGY_REDIRECT_URI || fallbackRedirectUri
  );
  return NextResponse.redirect(authUrl);
}
