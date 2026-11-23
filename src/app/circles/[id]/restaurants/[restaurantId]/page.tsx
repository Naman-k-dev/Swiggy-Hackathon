'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/store/demo-context';
import {
  ArrowLeft,
  Star,
  Clock,
  Plus,
  ShoppingBag,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPaise, formatRupees } from '@/lib/utils';

interface MenuPageProps {
  params: Promise<{
    id: string;
    restaurantId: string;
  }>;
}

export default function RestaurantMenuPage({ params }: MenuPageProps) {
  const resolvedParams = use(params);
  const circleId = resolvedParams.id;
  const restaurantId = resolvedParams.restaurantId;

  const {
    getCircle,
    getRestaurant,
    getSession,
    startSession,
    isCircleAdmin,
    addToCart,
    currentUser,
    getSessionCartItems,
  } = useApp();

  const circle = getCircle(circleId);
  const restaurant = getRestaurant(restaurantId);
  const activeSession = getSession(circleId);
  const isAdmin = isCircleAdmin(circleId);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // If there is an active session, get its cart items
  const sessionCart = activeSession ? getSessionCartItems(activeSession.id) : [];
  const myCartItems = sessionCart.filter((i) => i.user_id === currentUser.id);
  const mySubtotalPaise = myCartItems.reduce(
    (sum, i) => sum + i.item_price_paise * i.quantity,
    0
  );

  const showToast = (dishName: string) => {
    setToastMessage(`Added "${dishName}" to your circle cart!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddItem = (dish: {
    id: string;
    name: string;
    price_paise: number;
    is_veg: boolean;
  }) => {
    let session = activeSession;
    if (!session) {
      // If no session exists, automatically start one with this restaurant
      session = startSession(circleId, restaurantId, 30);
    } else if (session.restaurant_id !== restaurantId) {
      if (isAdmin) {
        if (
          confirm(
            `Switch active circle restaurant from ${session.restaurant_name} to ${restaurant?.name}?`
          )
        ) {
          session = startSession(circleId, restaurantId, 30);
        } else {
          return;
        }
      } else {
        alert(
          `Your circle is currently ordering from "${session.restaurant_name}". Please order from that restaurant or ask the admin to switch.`
        );
        return;
      }
    }

    addToCart(session.id, circleId, dish);
    showToast(dish.name);
  };

  if (!restaurant || !circle) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p>Restaurant or circle not found.</p>
        <Link href={`/circles/${circleId}`} className="text-swiggy-orange font-bold text-sm">
          Return to Circle
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-charcoal-700 animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
          <Link
            href={`/circles/${circleId}`}
            className="ml-2 text-swiggy-orange hover:underline font-bold"
          >
            View Cart
          </Link>
        </div>
      )}

      {/* Top Navigation */}
      <div>
        <Link
          href={`/circles/${circleId}/restaurants`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-500 dark:text-slate-400 hover:text-charcoal-900 dark:text-white mb-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Restaurants Catalog
        </Link>
      </div>

      {/* Restaurant Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-56 h-40 rounded-2xl overflow-hidden relative flex-shrink-0 bg-charcoal-100">
          <Image
            src={restaurant.image}
            alt={restaurant.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
              {restaurant.name}
            </h1>
            {restaurant.is_pure_veg && (
              <Badge variant="success" size="sm" className="font-bold">
                Pure Veg
              </Badge>
            )}
            <Badge variant="orange" size="sm">
              Demo Menu
            </Badge>
          </div>

          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-slate-400">
            {restaurant.cuisine.join(' • ')} • Approx. {formatRupees(restaurant.price_for_one)} for one
          </p>

          <p className="text-xs text-charcoal-600 dark:text-slate-400 leading-relaxed max-w-xl">
            {restaurant.tagline}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-charcoal-700 dark:text-slate-300">
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              {restaurant.rating} ({restaurant.rating_count})
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-swiggy-orange" />
              {restaurant.delivery_time_min} mins prep & delivery
            </span>
          </div>
        </div>
      </div>

      {/* Session Status Banner */}
      {activeSession && activeSession.restaurant_id === restaurantId && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold">
              Active Circle Session Live! Any dish you add updates the group cart for {circle.name}.
            </span>
          </div>

          <Link href={`/circles/${circleId}`}>
            <Button size="sm" variant="outline" className="text-xs font-bold border-emerald-300">
              Open Group Cart ({sessionCart.length} items)
            </Button>
          </Link>
        </div>
      )}

      {/* Menu Categories & Food Items */}
      <div className="space-y-10">
        {restaurant.menu_categories.map((category) => (
          <div key={category.id} className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-xs text-charcoal-500 dark:text-slate-400 mt-0.5">{category.description}</p>
              )}
            </div>

            <div className="space-y-4">
              {category.items.map((dish) => {
                // Check if current user already has this dish in session cart
                const existingInMyCart = myCartItems.find((ci) => ci.item_id === dish.id);

                return (
                  <div
                    key={dish.id}
                    className="rounded-3xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 dark:border-slate-800 p-4 sm:p-6 shadow-sm hover:border-charcoal-200 dark:border-slate-700 transition flex flex-col sm:flex-row justify-between gap-4"
                  >
                    {/* Left: Dish Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {dish.is_veg ? (
                          <span className="veg-icon" title="Vegetarian" />
                        ) : (
                          <span className="non-veg-icon" title="Non-Vegetarian" />
                        )}

                        {dish.is_bestseller && (
                          <Badge variant="warning" size="sm" className="text-[10px] font-bold">
                            Bestseller
                          </Badge>
                        )}

                        {dish.is_student_pick && (
                          <Badge variant="orange" size="sm" className="text-[10px] font-bold">
                            Student Pick
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-extrabold text-base text-charcoal-900 dark:text-white">
                        {dish.name}
                      </h3>

                      <p className="text-sm font-black text-charcoal-900 dark:text-white">
                        {formatPaise(dish.price_paise)}
                      </p>

                      <p className="text-xs text-charcoal-500 dark:text-slate-400 leading-relaxed max-w-lg">
                        {dish.description}
                      </p>
                    </div>

                    {/* Right: Dish Image & Add to Cart */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                      {dish.image && (
                        <div className="w-28 h-24 rounded-2xl overflow-hidden relative bg-charcoal-100 shadow-sm flex-shrink-0">
                          <Image
                            src={dish.image}
                            alt={dish.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}

                      <Button
                        size="sm"
                        onClick={() => handleAddItem(dish)}
                        className="rounded-xl text-xs font-bold gap-1.5 shadow-sm px-4"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Circle</span>
                        {existingInMyCart && (
                          <span className="bg-white/30 text-white rounded-full px-1.5 py-0.2 text-[10px] ml-1">
                            {existingInMyCart.quantity}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Bottom Bar if User has items */}
      {myCartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-charcoal-200 dark:border-slate-700 shadow-2xl p-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-charcoal-500 dark:text-slate-400 font-semibold">
                Your Selection ({myCartItems.reduce((s, i) => s + i.quantity, 0)} items)
              </p>
              <p className="text-base font-black text-charcoal-900 dark:text-white">
                {formatPaise(mySubtotalPaise)}
              </p>
            </div>

            <Link href={`/circles/${circleId}`}>
              <Button size="md" className="rounded-2xl font-bold text-xs gap-2 shadow-md px-6">
                <ShoppingBag className="w-4 h-4" />
                <span>View Shared Group Cart</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
