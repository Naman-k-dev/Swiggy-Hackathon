import { Restaurant } from '@/types';
import { DEMO_RESTAURANTS } from '@/lib/data/mock-restaurants';
import { swiggyMCPService } from '@/lib/services/swiggy-mcp-service';

/**
 * Interface for restaurant data access.
 * Enables transparent switching between campus verified catalog and Swiggy Food MCP.
 */
export interface IRestaurantProvider {
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurantById(id: string): Promise<Restaurant | null>;
  searchRestaurants(query: string): Promise<Restaurant[]>;
  getProviderStatus(): { isLive: boolean; providerName: string };
}

export class DemoRestaurantProvider implements IRestaurantProvider {
  async getRestaurants(): Promise<Restaurant[]> {
    return DEMO_RESTAURANTS;
  }

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    const found = DEMO_RESTAURANTS.find((r) => r.id === id);
    return found || null;
  }

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    const { restaurants } = await swiggyMCPService.searchRestaurants(query);
    return restaurants;
  }

  getProviderStatus(): { isLive: boolean; providerName: string } {
    const status = swiggyMCPService.getStatus();
    return {
      isLive: status.isConnected,
      providerName: status.isConnected ? 'Swiggy Food MCP (Live)' : 'Campus Verified Demo Menus',
    };
  }
}

export const restaurantService = new DemoRestaurantProvider();
export { swiggyMCPService };
