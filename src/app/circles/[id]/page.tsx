'use client';

import React, { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/demo-context';
import {
  Users,
  Plus,
  Minus,
  Lock,
  Unlock,
  Clock,
  Sparkles,
  Share2,
  Check,
  Copy,
  ShieldAlert,
  TrendingDown,
  ShoppingBag,
  Utensils,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { CircleMatchModal } from '@/components/circlematch/CircleMatchModal';
import { formatPaise, formatRupees, calculateMemberSplit } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface CirclePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CircleDetailPage({ params }: CirclePageProps) {
  const resolvedParams = use(params);
  const circleId = resolvedParams.id;

  const router = useRouter();
  const {
    getCircle,
    getCircleMembers,
    isCircleAdmin,
    currentUser,
    getSession,
    lockSession,
    reopenSession,
    finalizeSession,
    getSessionCartItems,
    updateCartQuantity,
  } = useApp();

  const circle = getCircle(circleId);
  const members = getCircleMembers(circleId);
  const isAdmin = isCircleAdmin(circleId);
  const activeSession = getSession(circleId);

  // Modal States
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [circleMatchOpen, setCircleMatchOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(
    activeSession?.delivery_location || 'Hostel Block C - Ground Floor Reception'
  );
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [copied, setCopied] = useState(false);

  // Real-time Cart Items wrapped in useMemo
  const cartItems = useMemo(() => {
    return activeSession ? getSessionCartItems(activeSession.id) : [];
  }, [activeSession, getSessionCartItems]);

  // Member groupings
  const memberGroups = useMemo(() => {
    const groups = new Map<string, typeof cartItems>();
    for (const item of cartItems) {
      const existing = groups.get(item.user_id) || [];
      existing.push(item);
      groups.set(item.user_id, existing);
    }
    return groups;
  }, [cartItems]);

  // Totals in integer paise
  const subtotalPaise = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.item_price_paise * item.quantity, 0);
  }, [cartItems]);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Delivery fee rules: free if subtotal > ₹400 (40000 paise)
  const deliveryFeePaise = subtotalPaise > 40000 ? 0 : 3000;
  const platformFeePaise = 500;
  const discountPaise = subtotalPaise > 50000 ? 5000 : 0;
  const grandTotalPaise = subtotalPaise + deliveryFeePaise + platformFeePaise - discountPaise;

  const memberSplits = useMemo(() => {
    return calculateMemberSplit(
      cartItems,
      deliveryFeePaise,
      platformFeePaise,
      discountPaise
    );
  }, [cartItems, deliveryFeePaise, platformFeePaise, discountPaise]);

  // Cutoff Countdown Timer
  const [timeLeftStr, setTimeLeftStr] = useState<string>('25 mins');
  useEffect(() => {
    if (!activeSession?.cutoff_time) return;
    const interval = setInterval(() => {
      const diff = new Date(activeSession.cutoff_time!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeftStr('Cutoff reached');
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeftStr(`${mins}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession?.cutoff_time]);

  if (!circle) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-bold">Circle Not Found</h2>
        <Link href="/dashboard" className="text-swiggy-orange font-bold text-sm mt-2 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${circle.invite_code}`;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinalize = () => {
    if (!activeSession) return;
    try {
      const newOrder = finalizeSession(
        activeSession.id,
        deliveryLocation,
        deliveryNotes
      );

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FC8019', '#00A343', '#171717', '#FFD700'],
      });

      setFinalizeModalOpen(false);
      router.push(`/circles/${circleId}/orders/${newOrder.id}`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error finalizing order';
      alert(errMsg);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 1. Circle Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-charcoal-50 dark:bg-slate-800 border border-charcoal-100 dark:border-slate-800 flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
              {circle.emoji || '🍱'}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white tracking-tight">
                  {circle.name}
                </h1>
                <Badge variant="outline" size="sm">
                  {circle.type}
                </Badge>
                <Badge variant="orange" size="sm">
                  Budget: ₹{circle.preferred_budget}/meal
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-charcoal-500 dark:text-slate-400 font-medium">
                {circle.college} • {members.length} Members
              </p>

              <p className="text-xs text-charcoal-600 dark:text-slate-400 max-w-2xl leading-relaxed pt-1">
                {circle.description || 'Active campus group for coordinating meals.'}
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="md"
              onClick={() => setCircleMatchOpen(true)}
              className="rounded-2xl gap-2 text-xs font-black shadow-md bg-gradient-to-r from-swiggy-orange to-amber-500 hover:from-swiggy-hover hover:to-amber-600 text-white transition-all transform hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span>Find Our Perfect Meal ✨</span>
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => setInviteModalOpen(true)}
              className="rounded-2xl gap-2 text-xs font-bold"
            >
              <Share2 className="w-4 h-4 text-swiggy-orange" />
              <span>Invite Members</span>
            </Button>

            {isAdmin && !activeSession && (
              <Link href={`/circles/${circleId}/restaurants`}>
                <Button size="md" variant="outline" className="rounded-2xl gap-2 text-xs font-bold">
                  <Utensils className="w-4 h-4" />
                  <span>Browse Restaurants</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid: 8 Cols (Active Order & Cart) + 4 Cols (Members Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Ordering Session & Shared Cart */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Ordering Session Card */}
          {activeSession ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-charcoal-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden relative bg-charcoal-100 flex-shrink-0">
                    {activeSession.restaurant_image ? (
                      <Image
                        src={activeSession.restaurant_image}
                        alt={activeSession.restaurant_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 dark:text-slate-400">
                        Active Restaurant
                      </span>
                      {activeSession.status === 'open' ? (
                        <Badge variant="success" size="sm" className="font-bold gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Order Open
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" className="font-bold gap-1">
                          <Lock className="w-3 h-3" />
                          Cart Locked
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-charcoal-900 dark:text-white leading-tight">
                      {activeSession.restaurant_name}
                    </h3>
                  </div>
                </div>

                {/* Countdown & Drop point */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-swiggy-orange bg-swiggy-light px-2.5 py-1 rounded-xl">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Cutoff: {timeLeftStr}</span>
                  </div>
                  <span className="text-[11px] text-charcoal-400 mt-1">
                    Drop: {activeSession.delivery_location}
                  </span>
                </div>
              </div>

              {/* Session Controls for Members and Admins */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <Link
                  href={`/circles/${circleId}/restaurants/${activeSession.restaurant_id}`}
                >
                  <Button
                    size="sm"
                    variant={activeSession.status === 'open' ? 'primary' : 'outline'}
                    disabled={activeSession.status !== 'open'}
                    className="rounded-xl text-xs font-bold gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Browse Menu & Add Food</span>
                  </Button>
                </Link>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    {activeSession.status === 'open' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => lockSession(activeSession.id)}
                        className="rounded-xl text-xs font-bold gap-1.5 border-charcoal-300"
                        title="Lock cart so no more items can be added"
                      >
                        <Lock className="w-3.5 h-3.5 text-charcoal-600 dark:text-slate-400" />
                        <span>Lock Cart</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reopenSession(activeSession.id)}
                        className="rounded-xl text-xs font-bold gap-1.5 border-emerald-300 text-emerald-700 bg-emerald-50"
                        title="Reopen cart for additions"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Reopen Cart</span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setFinalizeModalOpen(true)}
                      disabled={cartItems.length === 0}
                      className="rounded-xl text-xs font-bold gap-1.5 bg-charcoal-900 text-white"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-swiggy-orange" />
                      <span>Finalize & Place Demo Order</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 dark:border-slate-800 p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-swiggy-orange flex items-center justify-center mx-auto text-2xl">
                🍕
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-charcoal-900 dark:text-white">
                  No Active Ordering Session
                </h3>
                <p className="text-xs text-charcoal-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  Ready for lunch, dinner, or midnight bites? Launch a group session with your circle.
                </p>
              </div>
              <Link href={`/circles/${circleId}/restaurants`}>
                <Button size="md" className="rounded-2xl font-bold text-xs gap-2">
                  <Utensils className="w-4 h-4" />
                  <span>Choose Restaurant & Start Session</span>
                </Button>
              </Link>
            </div>
          )}

          {/* 3. The Shared Group Cart */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-extrabold text-charcoal-900 dark:text-white tracking-tight flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-swiggy-orange" />
                  Shared Circle Cart
                </h2>
                <p className="text-xs text-charcoal-500 dark:text-slate-400">
                  Real-time cross-member synchronized food selections
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-charcoal-400 font-semibold">
                  {totalItemsCount} {totalItemsCount === 1 ? 'dish' : 'dishes'}
                </span>
                <p className="text-xl font-black text-charcoal-900 dark:text-white">
                  {formatPaise(subtotalPaise)}
                </p>
              </div>
            </div>

            {/* Delivery Savings Progress Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <TrendingDown className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                {subtotalPaise > 40000 ? (
                  <span className="font-bold">
                    🎉 Free Group Delivery Unlocked! You saved ₹90 in combined fees.
                  </span>
                ) : (
                  <span>
                    Add <strong>{formatRupees(Math.ceil((40000 - subtotalPaise) / 100))}</strong> more
                    to unlock <strong>FREE Delivery</strong> for the whole circle!
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-emerald-700">₹0 Delivery</span>
            </div>

            {/* Empty State */}
            {cartItems.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-3xl">🛒</p>
                <h4 className="font-bold text-sm text-charcoal-800">Your group cart is empty</h4>
                <p className="text-xs text-charcoal-500 dark:text-slate-400 max-w-xs mx-auto">
                  Browse the menu and add dishes. Your circle mates will see your selections live.
                </p>
                {activeSession && (
                  <Link
                    href={`/circles/${circleId}/restaurants/${activeSession.restaurant_id}`}
                  >
                    <Button size="sm" className="rounded-xl text-xs font-bold mt-2">
                      Browse Menu
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              /* Member-by-Member Breakdown Cards */
              <div className="space-y-6">
                {Array.from(memberGroups.entries()).map(([userId, userItems]) => {
                  const isCurrentMember = userId === currentUser.id;
                  const firstItem = userItems[0];
                  const memberSubtotal = userItems.reduce(
                    (s, i) => s + i.item_price_paise * i.quantity,
                    0
                  );

                  return (
                    <div
                      key={userId}
                      className={`rounded-2xl border p-4 transition ${
                        isCurrentMember
                          ? 'border-orange-200 bg-orange-50/30'
                          : 'border-charcoal-100 dark:border-slate-800 bg-[#FAFAF8] dark:bg-slate-800/60'
                      }`}
                    >
                      {/* Member Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-charcoal-100 dark:border-slate-800/80 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden relative border border-white shadow-xs">
                            <Image
                              src={firstItem.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                              alt={firstItem.user_name}
                              width={32}
                              height={32}
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-charcoal-900 dark:text-white flex items-center gap-1.5">
                              {firstItem.user_name}
                              {isCurrentMember && (
                                <span className="text-[10px] bg-swiggy-light text-swiggy-dark px-1.5 py-0.2 rounded-full font-bold">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-charcoal-500 dark:text-slate-400">
                              {userItems.reduce((s, i) => s + i.quantity, 0)} items
                            </p>
                          </div>
                        </div>

                        <span className="font-black text-xs text-charcoal-900 dark:text-white">
                          {formatPaise(memberSubtotal)}
                        </span>
                      </div>

                      {/* Dishes List */}
                      <div className="space-y-2">
                        {userItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-1 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              {item.item_is_veg ? (
                                <span className="veg-icon !w-3 !h-3 scale-75" />
                              ) : (
                                <span className="non-veg-icon !w-3 !h-3 scale-75" />
                              )}
                              <div>
                                <p className="font-semibold text-charcoal-800">
                                  {item.item_name}
                                </p>
                                {item.customization && (
                                  <p className="text-[10px] text-charcoal-400 italic">
                                    &quot;{item.customization}&quot;
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-charcoal-600 dark:text-slate-400">
                                {formatPaise(item.item_price_paise * item.quantity)}
                              </span>

                              {/* Interactive controls for own items if open */}
                              {isCurrentMember && activeSession?.status === 'open' ? (
                                <div className="flex items-center gap-1.5 bg-white border border-charcoal-200 rounded-lg p-0.5 shadow-xs">
                                  <button
                                    onClick={() => updateCartQuantity(item.id, -1)}
                                    className="p-1 hover:bg-charcoal-100 rounded text-charcoal-600 dark:text-slate-400"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-1 font-bold text-xs min-w-[14px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateCartQuantity(item.id, 1)}
                                    className="p-1 hover:bg-charcoal-100 rounded text-charcoal-600 dark:text-slate-400"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] font-bold text-charcoal-500 dark:text-slate-400 bg-white px-2 py-0.5 rounded border border-charcoal-200">
                                  ×{item.quantity}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Split Breakdown Summary Table */}
            {cartItems.length > 0 && (
              <div className="mt-6 pt-5 border-t border-charcoal-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 dark:text-slate-400">
                  Itemized Individual Split (Integer Paise Calculation)
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-charcoal-100 dark:border-slate-800 text-charcoal-400 font-semibold">
                        <th className="pb-2">Member</th>
                        <th className="pb-2 text-center">Items</th>
                        <th className="pb-2 text-right">Subtotal</th>
                        <th className="pb-2 text-right">Individual Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-100/60 font-medium text-charcoal-800">
                      {memberSplits.map((split) => (
                        <tr key={split.user_id}>
                          <td className="py-2 flex items-center gap-2">
                            <span>{split.user_name}</span>
                            {split.user_id === currentUser.id && (
                              <Badge variant="orange" size="sm" className="text-[9px] py-0">
                                You
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 text-center">{split.items_count}</td>
                          <td className="py-2 text-right font-mono">
                            {formatPaise(split.subtotal_paise)}
                          </td>
                          <td className="py-2 text-right font-mono font-bold text-swiggy-orange">
                            {formatPaise(split.share_paise)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bill Breakdown Totals */}
                <div className="pt-3 border-t border-charcoal-100 dark:border-slate-800 space-y-1.5 text-xs text-charcoal-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Group Food Subtotal</span>
                    <span className="font-mono">{formatPaise(subtotalPaise)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-mono">
                      {deliveryFeePaise === 0 ? (
                        <strong className="text-emerald-600">FREE</strong>
                      ) : (
                        formatPaise(deliveryFeePaise)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Campus Platform Fee</span>
                    <span className="font-mono">{formatPaise(platformFeePaise)}</span>
                  </div>
                  {discountPaise > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Circle Group Discount</span>
                      <span className="font-mono">-{formatPaise(discountPaise)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-charcoal-200 text-sm font-black text-charcoal-900 dark:text-white">
                    <span>Total Group Amount</span>
                    <span className="font-mono">{formatPaise(grandTotalPaise)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Members Panel & Quick Circle Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Members Panel */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-charcoal-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-swiggy-orange" />
                Circle Members ({members.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInviteModalOpen(true)}
                className="text-xs font-bold text-swiggy-orange p-1 hover:bg-swiggy-light"
              >
                + Invite
              </Button>
            </div>

            <div className="space-y-3">
              {members.map((m) => {
                const isYou = m.user_id === currentUser.id;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAFAF8] dark:bg-slate-800/60 border border-charcoal-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full overflow-hidden relative border border-white shadow-xs">
                        <Image
                          src={m.profile.avatar_url || ''}
                          alt={m.profile.full_name}
                          width={36}
                          height={36}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-charcoal-900 dark:text-white flex items-center gap-1.5">
                          {m.profile.full_name}
                          {isYou && (
                            <span className="text-[10px] text-swiggy-orange font-bold">(You)</span>
                          )}
                        </p>
                        <p className="text-[10px] text-charcoal-500 dark:text-slate-400">
                          {m.profile.academic_year}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge
                        variant={m.profile.dietary_pref === 'VEG' ? 'success' : 'default'}
                        size="sm"
                        className="text-[9px] py-0 px-1.5"
                      >
                        {m.profile.dietary_pref}
                      </Badge>
                      <p className="text-[10px] text-charcoal-400 mt-0.5">
                        {m.role === 'admin' ? 'Admin' : 'Member'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Invite Box */}
          <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 border border-orange-200 dark:border-orange-900/50 p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-swiggy-dark">
              <Share2 className="w-4 h-4 text-swiggy-orange" />
              <span>Share Invite Code</span>
            </div>
            <p className="text-xs text-charcoal-600 dark:text-slate-400">
              Mates can join directly with this code on the dashboard or by opening your invite link.
            </p>
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-orange-200 dark:border-slate-700">
              <span className="font-mono text-base font-black tracking-widest text-swiggy-orange ml-2">
                {circle.invite_code}
              </span>
              <Button size="sm" variant="soft" onClick={copyInvite} className="text-xs font-bold">
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Invite Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title={`Invite to ${circle.name}`}
        description="Share this link or code with your campus friends so they can add food to the circle cart."
      >
        <div className="space-y-4 pt-2">
          <div className="rounded-2xl bg-charcoal-50 dark:bg-slate-800 p-4 border border-charcoal-200 text-center space-y-1">
            <p className="text-xs font-semibold text-charcoal-500 dark:text-slate-400 uppercase tracking-wider">
              6-Letter Invite Code
            </p>
            <p className="text-3xl font-black font-mono tracking-widest text-swiggy-orange">
              {circle.invite_code}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-charcoal-700 dark:text-slate-300">
              Direct Invitation Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 bg-charcoal-50 dark:bg-slate-800 font-mono text-charcoal-700 dark:text-slate-300"
              />
              <Button
                size="sm"
                variant={copied ? 'secondary' : 'primary'}
                onClick={copyInvite}
                className="flex-shrink-0 text-xs font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 5. Finalize Demo Order Modal */}
      <Modal
        isOpen={finalizeModalOpen}
        onClose={() => setFinalizeModalOpen(false)}
        title="Confirm & Finalize Group Order"
        description="This will lock the cart, calculate itemized receipts for each student, and submit the simulated campus order."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Demo Order — No Payment Taken
            </p>
            <p>
              This is a prototype simulation for the competition. No UPI transaction or real financial deduction will occur.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              Campus Delivery Location
            </label>
            <input
              type="text"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-xs focus:outline-none focus:ring-2 focus:ring-swiggy-orange font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              Delivery Notes for Driver
            </label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Call me upon arrival at the campus delivery point"
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-xs focus:outline-none focus:ring-2 focus:ring-swiggy-orange font-medium"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1 rounded-xl text-xs font-bold"
              onClick={() => setFinalizeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="md"
              className="flex-1 rounded-xl text-xs font-bold shadow-md"
              onClick={handleFinalize}
            >
              Confirm Simulated Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* 6. CircleMatch AI Modal */}
      <CircleMatchModal
        isOpen={circleMatchOpen}
        onClose={() => setCircleMatchOpen(false)}
        circleId={circleId}
      />
    </div>
  );
}
