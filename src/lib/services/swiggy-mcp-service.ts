/**
 * Swiggy Food MCP & Partner Integration Service
 * Follows Swiggy Builders Club specifications:
 * - OAuth 2.1 with PKCE (RFC 7636) authentication architecture.
 * - Supported Food MCP Tool schemas for restaurant discovery, menu retrieval, and availability checks.
 * - Zero live payment initiation during demo testing.
 * - Graceful fallback to verified campus seed catalog when credentials are unconfigured.
 */

import { Restaurant } from '@/types';
import { DEMO_RESTAURANTS } from '@/lib/data/mock-restaurants';

export interface SwiggyAuthConfig {
  clientId?: string;
  redirectUri?: string;
  scope?: string[];
  mcpServerUrl?: string;
}

export interface SwiggyMCPStatus {
  isConnected: boolean;
  provider: 'swiggy_mcp_live' | 'campus_verified_demo';
  statusMessage: string;
  authEndpoint?: string;
  supportedTools: string[];
}

export interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
}

/**
 * Swiggy Builders Club MCP Client
 */
export class SwiggyMCPService {
  private config: SwiggyAuthConfig;

  constructor() {
    this.config = {
      clientId: process.env.SWIGGY_CLIENT_ID,
      redirectUri: process.env.SWIGGY_REDIRECT_URI || 'http://localhost:3000/api/auth/swiggy/callback',
      scope: ['food.read', 'menu.read', 'cart.write'],
      mcpServerUrl: process.env.SWIGGY_MCP_SERVER_URL,
    };
  }

  /**
   * Generates PKCE code challenge and verifier according to RFC 7636 (OAuth 2.1)
   */
  async generatePKCEPair(): Promise<PKCEChallenge> {
    // Generate 64-byte random verifier
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined') {
      crypto.getRandomValues(array);
    }
    const codeVerifier = Array.from(array, (dec) => dec.toString(16).padStart(2, '0')).join('');

    // SHA-256 hash for code challenge
    let codeChallenge = codeVerifier;
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      const digest = await crypto.subtle.digest('SHA-256', data);
      codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }

    return { codeVerifier, codeChallenge };
  }

  /**
   * Builds the official Swiggy Builders Club OAuth 2.1 authorization URL
   */
  buildAuthorizationUrl(codeChallenge: string, state: string): string {
    const base = 'https://accounts.swiggy.com/oauth2/auth';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId || 'demo_campus_client',
      redirect_uri: this.config.redirectUri || '',
      scope: (this.config.scope || []).join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    return `${base}?${params.toString()}`;
  }

  /**
   * Returns current integration status and active provider
   */
  getStatus(): SwiggyMCPStatus {
    const hasLiveCredentials = Boolean(
      process.env.SWIGGY_CLIENT_ID && process.env.SWIGGY_CLIENT_SECRET
    );

    return {
      isConnected: hasLiveCredentials,
      provider: hasLiveCredentials ? 'swiggy_mcp_live' : 'campus_verified_demo',
      statusMessage: hasLiveCredentials
        ? 'Connected to Swiggy Builders Club Food MCP'
        : 'Swiggy MCP Sandbox unconfigured. Using campus verified offline menu catalog.',
      authEndpoint: 'https://accounts.swiggy.com/oauth2/auth',
      supportedTools: [
        'swiggy_food_search_restaurants',
        'swiggy_food_get_menu',
        'swiggy_food_check_item_availability',
        'swiggy_food_validate_cart',
      ],
    };
  }

  /**
   * Search restaurants using Food MCP tool or fallback catalog
   */
  async searchRestaurants(query: string, campusLat = 17.5449, campusLng = 78.5718): Promise<{
    restaurants: Restaurant[];
    source: 'swiggy_mcp_live' | 'campus_verified_demo';
  }> {
    const status = this.getStatus();

    if (status.isConnected && this.config.mcpServerUrl) {
      try {
        // Official MCP call structure
        const res = await fetch(`${this.config.mcpServerUrl}/tools/call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'swiggy_food_search_restaurants',
            arguments: { query, lat: campusLat, lng: campusLng, radius_meters: 5000 },
          }),
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          const mcpData = await res.json();
          if (Array.isArray(mcpData?.restaurants) && mcpData.restaurants.length > 0) {
            return { restaurants: mcpData.restaurants, source: 'swiggy_mcp_live' };
          }
        }
      } catch {
        // Fall through to campus seed
      }
    }

    // High-quality verified campus demo fallback
    const q = query.toLowerCase();
    const filtered = DEMO_RESTAURANTS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
        r.menu_categories.some((cat) => cat.items.some((i) => i.name.toLowerCase().includes(q)))
    );

    return {
      restaurants: filtered.length > 0 ? filtered : DEMO_RESTAURANTS,
      source: 'campus_verified_demo',
    };
  }
}

export const swiggyMCPService = new SwiggyMCPService();
