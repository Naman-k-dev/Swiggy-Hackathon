import { Restaurant } from '@/types';
import { DEMO_RESTAURANTS } from '@/lib/data/mock-restaurants';
import { swiggyMCPService } from '@/lib/services/swiggy-mcp-service';

/**
 * Interface for restaurant data access.
 * Enables transparent switching between campus verified catalog and live Swiggy Food MCP.
 */
export interface IRestaurantProvider {
  getRestaurants(mode?: 'live' | 'demo'): Promise<Restaurant[]>;
  getRestaurantById(id: string): Promise<Restaurant | null>;
  searchRestaurants(query: string, options?: { latitude?: number; longitude?: number }): Promise<Restaurant[]>;
  getProviderStatus(): { isLive: boolean; providerName: string; source: 'swiggy_mcp_live' | 'campus_verified_demo' };
}

export class SwiggyHybridRestaurantProvider implements IRestaurantProvider {
  private cachedRestaurants: Restaurant[] = [];
  private lastFetchTime = 0;

  async getRestaurants(mode?: 'live' | 'demo'): Promise<Restaurant[]> {
    if (mode === 'demo') {
      return DEMO_RESTAURANTS.map((r) => ({ ...r, source: 'campus_verified_demo' }));
    }

    // Cache for 60 seconds
    const now = Date.now();
    if (this.cachedRestaurants.length > 0 && now - this.lastFetchTime < 60000) {
      return this.cachedRestaurants;
    }

    try {
      const { restaurants } = await swiggyMCPService.searchRestaurants({ query: '' });
      this.cachedRestaurants = restaurants;
      this.lastFetchTime = now;
      return restaurants;
    } catch {
      return DEMO_RESTAURANTS.map((r) => ({ ...r, source: 'campus_verified_demo' }));
    }
  }

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    // Check cached first
    const fromCache = this.cachedRestaurants.find((r) => r.id === id);
    if (fromCache) return fromCache;

    // Check verified catalog
    const fromDemo = DEMO_RESTAURANTS.find((r) => r.id === id);
    if (fromDemo) return { ...fromDemo, source: 'campus_verified_demo' };

    // Fetch live from MCP
    try {
      const { restaurant } = await swiggyMCPService.getRestaurantMenu(id);
      return restaurant;
    } catch {
      return null;
    }
  }

  async searchRestaurants(query: string, options?: { latitude?: number; longitude?: number }): Promise<Restaurant[]> {
    const { restaurants } = await swiggyMCPService.searchRestaurants({
      query,
      latitude: options?.latitude,
      longitude: options?.longitude,
    });
    return restaurants;
  }

  getProviderStatus(): { isLive: boolean; providerName: string; source: 'swiggy_mcp_live' | 'campus_verified_demo' } {
    const status = swiggyMCPService.getStatus();
    return {
      isLive: status.isLive,
      providerName: status.isLive ? 'Swiggy Food MCP (Live)' : 'Campus Verified Demo Menus',
      source: status.provider,
    };
  }
}

export const restaurantService = new SwiggyHybridRestaurantProvider();
export { swiggyMCPService };
