'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, CheckCircle2, ShieldCheck, PackageCheck } from 'lucide-react';
import { DemoOrder, StudentProfile, CartItem } from '@/types';

interface PickupPassCardProps {
  order: DemoOrder;
  currentUser: StudentProfile;
  isAdmin: boolean;
  onMarkMealCollected: (itemId: string) => void;
}

export function PickupPassCard({
  order,
  currentUser,
  isAdmin,
  onMarkMealCollected,
}: PickupPassCardProps) {
  const [activeTab, setActiveTab] = useState<'my_pass' | 'organizer_checklist'>('my_pass');

  // Find current user's items in this order
  const userBreakdown = order.member_breakdowns.find((m) => m.user_id === currentUser.id);
  const userItems = userBreakdown ? userBreakdown.items : [];

  // Opaque time-limited identifier for QR
  const opaqueSessionToken = `SW-PASS-${order.id.substring(order.id.length - 8)}-${order.order_code}`;

  // Flatten all items across member breakdowns for organizer checklist
  interface CollectionItem extends CartItem {
    user_id: string;
    user_name: string;
    user_avatar?: string;
  }

  const allCollectionItems: CollectionItem[] = order.member_breakdowns.flatMap((mb) =>
    mb.items.map((item) => ({
      ...item,
      user_id: mb.user_id,
      user_name: mb.user_name,
      user_avatar: mb.user_avatar,
    }))
  );

  const totalMeals = allCollectionItems.reduce((sum, i) => sum + i.quantity, 0);
  const collectedMeals = allCollectionItems.filter((i) => (i as CollectionItem).is_collected).reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-swiggy-light dark:bg-orange-950/40 text-swiggy-orange flex items-center justify-center font-black">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-swiggy-orange bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-200">
                Secure Campus Pickup Pass
              </span>
              <Badge variant="success" size="sm" className="font-bold">
                {collectedMeals}/{totalMeals} Collected
              </Badge>
            </div>
            <h3 className="text-lg font-black text-charcoal-900 dark:text-white mt-0.5">
              Gate Collection Pass ({order.order_code})
            </h3>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-[#FAFAF8] dark:bg-slate-800 p-1 rounded-2xl border border-charcoal-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('my_pass')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'my_pass'
                ? 'bg-white dark:bg-slate-900 text-swiggy-dark dark:text-white shadow-xs'
                : 'text-charcoal-500 dark:text-slate-400 hover:text-charcoal-800'
            }`}
          >
            My QR Pass
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('organizer_checklist')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'organizer_checklist'
                  ? 'bg-white dark:bg-slate-900 text-swiggy-dark dark:text-white shadow-xs'
                  : 'text-charcoal-500 dark:text-slate-400 hover:text-charcoal-800'
              }`}
            >
              Organizer Checklist 📋
            </button>
          )}
        </div>
      </div>

      {activeTab === 'my_pass' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* QR Code Container */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-[#FAFAF8] dark:bg-slate-800/60 border border-charcoal-200 dark:border-slate-700 space-y-3 text-center">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-charcoal-100">
              <QRCodeSVG value={opaqueSessionToken} size={160} level="M" includeMargin={true} />
            </div>
            <div className="space-y-1">
              <p className="font-mono text-sm font-black text-charcoal-900 dark:text-white">
                {opaqueSessionToken}
              </p>
              <p className="text-[11px] text-charcoal-500 dark:text-slate-400">
                Show this opaque pass to your pickup coordinator at {order.delivery_location}
              </p>
            </div>
          </div>

          {/* Member Assigned Dishes */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs uppercase tracking-wider text-charcoal-600 dark:text-slate-300">
                Assigned Meals for {currentUser.full_name}
              </h4>
              <span className="text-xs text-charcoal-400">
                {userItems.length} item{userItems.length === 1 ? '' : 's'} in order
              </span>
            </div>

            {userItems.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-charcoal-200 bg-[#FAFAF8] text-xs text-charcoal-500">
                You do not have any items in this group order.
              </div>
            ) : (
              <div className="space-y-2">
                {userItems.map((item) => {
                  const isCollected = (item as CartItem).is_collected;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                        isCollected
                          ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50'
                          : 'bg-white dark:bg-slate-800 border-charcoal-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[8px] font-bold ${
                            item.item_is_veg ? 'border-emerald-600 text-emerald-600' : 'border-red-600 text-red-600'
                          }`}
                        >
                          ●
                        </span>
                        <div>
                          <p className="font-bold text-xs text-charcoal-900 dark:text-white">
                            {item.item_name} × {item.quantity}
                          </p>
                          <p className="text-[10px] text-charcoal-500 dark:text-slate-400">
                            {item.customization ? `Note: "${item.customization}"` : 'Standard preparation'}
                          </p>
                        </div>
                      </div>

                      <div>
                        {isCollected ? (
                          <Badge variant="success" size="sm" className="font-bold gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Collected
                          </Badge>
                        ) : (
                          <Badge variant="outline" size="sm" className="text-charcoal-500 font-semibold">
                            Pending Pickup
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 text-[11px] text-swiggy-dark dark:text-orange-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-swiggy-orange shrink-0 mt-0.5" />
              <span>
                Campus Pickup Passes are internal collection tools coordinated by your circle organizer. They are separate from Swiggy delivery-partner handoffs.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Organizer Collection Checklist */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-sm text-charcoal-900 dark:text-white">
                Organizer Gate Collection Checklist
              </h4>
              <p className="text-xs text-charcoal-500 dark:text-slate-400">
                Mark meals as collected as you distribute them to circle mates at the drop point.
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-swiggy-orange text-sm">
                {collectedMeals} of {totalMeals} meals collected
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {allCollectionItems.map((item) => {
              const isCollected = (item as CollectionItem).is_collected;
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                    isCollected
                      ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20'
                      : 'bg-white dark:bg-slate-800 border-charcoal-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden relative border border-white shrink-0">
                      <img src={item.user_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=student'} alt={item.user_name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-charcoal-900 dark:text-white">
                        {item.user_name} — <span className="text-swiggy-orange">{item.item_name}</span> (×{item.quantity})
                      </p>
                      <p className="text-[10px] text-charcoal-500">
                        {item.item_is_veg ? '🌱 Veg' : '🍗 Non-Veg'}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isCollected ? 'outline' : 'primary'}
                    onClick={() => onMarkMealCollected(item.id)}
                    className={`text-xs font-bold rounded-xl gap-1.5 ${
                      isCollected
                        ? 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'bg-swiggy-orange hover:bg-swiggy-hover text-white'
                    }`}
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>{isCollected ? 'Mark Pending' : 'Mark Collected'}</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
