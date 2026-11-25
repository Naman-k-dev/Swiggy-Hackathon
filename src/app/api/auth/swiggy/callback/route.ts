import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { swiggyMCPService } from '@/lib/services/swiggy-mcp-service';

/**
 * Swiggy OAuth 2.1 Callback Route
 * Verifies OAuth state, retrieves PKCE code_verifier, and exchanges code for access token.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const cookieStore = await cookies();
  const storedPkceRaw = cookieStore.get('swiggy_oauth_pkce')?.value;

  let returnTo = '/dashboard';
  let codeVerifier = '';

  if (storedPkceRaw) {
    try {
      const parsed = JSON.parse(storedPkceRaw);
      const rawReturnTo = parsed.returnTo || '/dashboard';
      returnTo = rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//') ? rawReturnTo : '/dashboard';
      if (parsed.state === state) {
        codeVerifier = parsed.codeVerifier;
      }
    } catch {
      // Cookie parsing error
    }
  }

  // Clear the single-use PKCE cookie
  cookieStore.delete('swiggy_oauth_pkce');

  if (error || !code) {
    const errorRedirect = new URL(returnTo, request.url);
    errorRedirect.searchParams.set('swiggy_error', error || 'missing_authorization_code');
    return NextResponse.redirect(errorRedirect);
  }

  if (storedPkceRaw && !codeVerifier) {
    const stateErrRedirect = new URL(returnTo, request.url);
    stateErrRedirect.searchParams.set('swiggy_error', 'invalid_oauth_state');
    return NextResponse.redirect(stateErrRedirect);
  }

  try {
    const fallbackRedirectUri = new URL('/api/auth/swiggy/callback', request.url).toString();
    // Exchange authorization code for OAuth 2.1 access token
    const tokenResponse = await swiggyMCPService.exchangeAuthorizationCode(
      code,
      codeVerifier,
      process.env.SWIGGY_REDIRECT_URI || fallbackRedirectUri
    );

    // Securely set token in httpOnly cookie
    cookieStore.set('swiggy_mcp_token', JSON.stringify(tokenResponse), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokenResponse.expires_in || 86400,
    });

    const successRedirect = new URL(returnTo, request.url);
    successRedirect.searchParams.set('swiggy_auth', 'success');
    return NextResponse.redirect(successRedirect);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'token_exchange_failed';
    const errRedirect = new URL(returnTo, request.url);
    errRedirect.searchParams.set('swiggy_error', message);
    return NextResponse.redirect(errRedirect);
  }
}
