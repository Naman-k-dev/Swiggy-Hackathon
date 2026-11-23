import { Restaurant } from '@/types';
import { DEMO_RESTAURANTS } from '@/lib/data/mock-restaurants';

/**
 * Interface for restaurant data access.
 * This abstraction enables swapping mock data with live Swiggy APIs/MCP servers in Phase 2.
 */
export interface IRestaurantProvider {
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurantById(id: string): Promise<Restaurant | null>;
  searchRestaurants(query: string): Promise<Restaurant[]>;
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
    const q = query.toLowerCase();
    return DEMO_RESTAURANTS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
        r.menu_categories.some((cat) =>
          cat.items.some((i) => i.name.toLowerCase().includes(q))
        )
    );
  }
}

export const restaurantService = new DemoRestaurantProvider();
