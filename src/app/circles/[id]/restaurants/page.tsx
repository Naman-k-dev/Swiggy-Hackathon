'use client';

import React, { use, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/demo-context';
import {
  Search,
  Star,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRupees } from '@/lib/utils';

interface RestaurantsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CircleRestaurantsPage({ params }: RestaurantsPageProps) {
  const resolvedParams = use(params);
  const circleId = resolvedParams.id;

  const router = useRouter();
  const {
    getCircle,
    restaurants,
    getSession,
    startSession,
    isCircleAdmin,
  } = useApp();

  const circle = getCircle(circleId);
  const activeSession = getSession(circleId);
  const isAdmin = isCircleAdmin(circleId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [pureVegOnly, setPureVegOnly] = useState(false);
  const [budgetFilter, setBudgetFilter] = useState<number | null>(null);

  const allCuisines = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => r.cuisine.forEach((c) => set.add(c)));
    return ['All', ...Array.from(set)];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCuisine = r.cuisine.some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesCuisine) return false;
      }

      if (selectedCuisine !== 'All' && !r.cuisine.includes(selectedCuisine)) {
        return false;
      }

      if (pureVegOnly && !r.is_pure_veg) {
        return false;
      }

      if (budgetFilter !== null && r.price_for_one > budgetFilter) {
        return false;
      }

      return true;
    });
  }, [restaurants, searchQuery, selectedCuisine, pureVegOnly, budgetFilter]);

  const handleSelectRestaurant = (restaurantId: string) => {
    if (isAdmin) {
      startSession(circleId, restaurantId, 30);
    }
    router.push(`/circles/${circleId}/restaurants/${restaurantId}`);
  };

  if (!circle) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p>Circle not found.</p>
        <Link href="/dashboard" className="text-swiggy-orange font-bold text-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/circles/${circleId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-500 dark:text-slate-400 hover:text-charcoal-900 dark:text-white mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to {circle.name}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
              Select Restaurant for Circle Session
            </h1>
            <Badge variant="orange" size="sm" className="gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Swiggy Food MCP / Campus Catalog
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500 dark:text-slate-400 mt-1">
            Pick a spot suited for {circle.name} • Target Budget: ₹{circle.preferred_budget}/person
          </p>
        </div>

        {activeSession && (
          <Link href={`/circles/${circleId}`}>
            <Button variant="soft" size="sm" className="rounded-xl text-xs font-bold">
              Active Session: {activeSession.restaurant_name} →
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 dark:border-slate-800 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by restaurant name, dish, or cuisine (e.g. rolls, biryani, dosa)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-charcoal-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange font-medium"
            />
          </div>

          {/* Quick Veg Toggle & Budget Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPureVegOnly(!pureVegOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition ${
                pureVegOnly
                  ? 'bg-veg-light text-veg-dark border-emerald-300 ring-1 ring-emerald-400'
                  : 'bg-white text-charcoal-700 dark:text-slate-300 border-charcoal-200 dark:border-slate-700 hover:bg-charcoal-50 dark:bg-slate-800'
              }`}
            >
              <span className="veg-icon !w-3.5 !h-3.5" />
              <span>Pure Veg Only</span>
            </button>

            <select
              value={budgetFilter === null ? 'all' : budgetFilter}
              onChange={(e) =>
                setBudgetFilter(e.target.value === 'all' ? null : Number(e.target.value))
              }
              aria-label="Filter restaurants by budget"
              className="px-3 py-2 rounded-2xl text-xs font-bold border border-charcoal-200 dark:border-slate-700 bg-white text-charcoal-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-swiggy-orange"
            >
              <option value="all">Any Budget</option>
              <option value="130">Under ₹130 / one</option>
              <option value="180">Under ₹180 / one</option>
              <option value="220">Under ₹220 / one</option>
            </select>
          </div>
        </div>

        {/* Cuisine Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {allCuisines.map((cuisine) => {
            const isSelected = selectedCuisine === cuisine;
            return (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-swiggy-orange text-white shadow-sm'
                    : 'bg-charcoal-100 text-charcoal-700 dark:text-slate-300 hover:bg-charcoal-200'
                }`}
              >
                {cuisine}
              </button>
            );
          })}
        </div>
      </div>

      {/* Restaurants Grid */}
      {filteredRestaurants.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 dark:border-slate-800 p-12 text-center space-y-3">
          <p className="text-2xl">🔍</p>
          <h3 className="font-extrabold text-charcoal-900 dark:text-white">No restaurants match your filters</h3>
          <p className="text-xs text-charcoal-500 dark:text-slate-400">
            Try resetting your search query or selecting &quot;Any Budget&quot;.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCuisine('All');
              setPureVegOnly(false);
              setBudgetFilter(null);
            }}
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => {
            const isSelectedInSession = activeSession?.restaurant_id === restaurant.id;

            return (
              <div
                key={restaurant.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-card hover:border-charcoal-200 dark:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo with Overlay Badges */}
                  <div className="h-48 w-full relative overflow-hidden bg-charcoal-100">
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />

                    {/* Offer Tag */}
                    {restaurant.offer && (
                      <div className="absolute bottom-3 left-3 bg-charcoal-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-md border border-white/10">
                        {restaurant.offer}
                      </div>
                    )}

                    {/* Pure Veg Tag */}
                    {restaurant.is_pure_veg && (
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-veg-dark text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <span className="veg-icon !w-2.5 !h-2.5 scale-75" />
                        <span>Pure Veg</span>
                      </div>
                    )}

                    {/* Delivery Time */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-charcoal-800 dark:text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Clock className="w-3 h-3 text-swiggy-orange" />
                      <span>{restaurant.delivery_time_min} mins</span>
                    </div>

                    {/* Data Source Badge */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs border border-charcoal-200/60 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${restaurant.source === 'swiggy_mcp_live' ? 'bg-emerald-500' : 'bg-swiggy-orange'}`} />
                      <span>{restaurant.source === 'swiggy_mcp_live' ? 'Swiggy Live' : 'Verified Campus'}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-base text-charcoal-900 dark:text-white leading-snug group-hover:text-swiggy-orange transition-colors">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-lg text-xs font-bold flex-shrink-0">
                        <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        <span>{restaurant.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-charcoal-500 dark:text-slate-400 line-clamp-1">
                      {restaurant.cuisine.join(' • ')}
                    </p>

                    <p className="text-xs text-charcoal-600 dark:text-slate-400 line-clamp-2">
                      {restaurant.tagline}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                      <span>Approx. {formatRupees(restaurant.price_for_one)} for one</span>
                      <span className="text-[11px] text-charcoal-400">
                        {restaurant.rating_count}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-5 pt-0">
                  <div className="flex gap-2">
                    <Link
                      href={`/circles/${circleId}/restaurants/${restaurant.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant={isSelectedInSession ? 'soft' : 'outline'}
                        size="md"
                        className="w-full rounded-2xl text-xs font-bold"
                      >
                        {isSelectedInSession ? 'View Active Menu' : 'View Menu'}
                      </Button>
                    </Link>

                    {isAdmin && !isSelectedInSession && (
                      <Button
                        size="md"
                        onClick={() => handleSelectRestaurant(restaurant.id)}
                        className="rounded-2xl text-xs font-bold gap-1 shadow-sm px-4"
                        title="Start circle ordering session with this restaurant"
                      >
                        <span>Start Session</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
