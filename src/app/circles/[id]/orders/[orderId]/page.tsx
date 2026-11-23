'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/store/demo-context';
import {
  CheckCircle2,
  MapPin,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
  Truck,
  CookingPot,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPaise } from '@/lib/utils';
import { OrderStatus } from '@/types';

interface OrderPageProps {
  params: Promise<{
    id: string;
    orderId: string;
  }>;
}

export default function OrderTrackingPage({ params }: OrderPageProps) {
  const resolvedParams = use(params);
  const circleId = resolvedParams.id;
  const orderId = resolvedParams.orderId;

  const { getOrder, currentUser } = useApp();
  const order = getOrder(orderId);

  // Simulated status progression
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order?.status || 'placed');

  const timelineSteps: { key: OrderStatus; label: string; desc: string; icon: React.ElementType }[] = [
    { key: 'placed', label: 'Order Placed', desc: 'Received by Campus Circles engine', icon: CheckCircle2 },
    { key: 'confirmed', label: 'Restaurant Confirmed', desc: 'Order accepted by kitchen', icon: CookingPot },
    { key: 'preparing', label: 'Preparing Food', desc: 'Fresh ingredients on the grill', icon: Sparkles },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Partner en route to campus gate', icon: Truck },
    { key: 'delivered', label: 'Arrived at Drop Point', desc: 'Ready for circle collection', icon: Building },
  ];

  const currentStepIndex = timelineSteps.findIndex((s) => s.key === currentStatus);

  const advanceStatus = () => {
    const nextIndex = (currentStepIndex + 1) % timelineSteps.length;
    setCurrentStatus(timelineSteps[nextIndex].key);
  };

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <p className="text-xs text-charcoal-500">
          The order #{orderId} could not be located in this session.
        </p>
        <Link href="/dashboard">
          <Button size="sm">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-24">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href={`/circles/${circleId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-500 hover:text-charcoal-900 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {order.circle_name}
        </Link>
      </div>

      {/* 1. Confirmation Hero Card */}
      <div className="rounded-3xl bg-white border border-charcoal-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-swiggy-orange">
                  {order.order_code}
                </span>
                <span className="text-xs text-charcoal-400">•</span>
                <span className="text-xs font-bold text-charcoal-600">{order.circle_name}</span>
              </div>
              <h1 className="text-2xl font-black text-charcoal-900 tracking-tight mt-0.5">
                Simulated Order Confirmed!
              </h1>
              <p className="text-xs text-charcoal-500">
                Placed by {order.placed_by_name} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Prototype Demo Warning Badge */}
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-2xl text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Demo Order — No Payment Taken</span>
          </div>
        </div>

        {/* 2. Interactive Live Order Tracking Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-charcoal-900 uppercase tracking-wider">
              Live Delivery Status Timeline
            </h3>

            {/* Judge Demo Control */}
            <Button
              variant="outline"
              size="sm"
              onClick={advanceStatus}
              className="text-xs font-bold border-orange-200 text-swiggy-dark bg-swiggy-light/50 hover:bg-swiggy-light"
              title="Click to advance status for judging simulation"
            >
              <Sparkles className="w-3.5 h-3.5 text-swiggy-orange mr-1" />
              Simulate Next Status Step
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {timelineSteps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;

              return (
                <div
                  key={step.key}
                  className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-between gap-2 ${
                    isCurrent
                      ? 'border-swiggy-orange bg-swiggy-light/60 shadow-sm ring-1 ring-orange-300'
                      : isPast
                      ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                      : 'border-charcoal-100 bg-charcoal-50/60 opacity-60'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCurrent
                        ? 'bg-swiggy-orange text-white animate-pulse'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-charcoal-200 text-charcoal-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <p className="text-xs font-bold leading-tight">{step.label}</p>
                    <p className="text-[10px] text-charcoal-500 mt-0.5 leading-tight">{step.desc}</p>
                  </div>

                  {isCurrent && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-swiggy-orange">
                      Active Now
                    </span>
                  )}
                  {isPast && (
                    <span className="text-[9px] font-bold text-emerald-600">Completed</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Delivery Drop Point & Instructions */}
        <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-bold text-charcoal-500 uppercase tracking-wider text-[10px]">
              Designated Campus Drop Point
            </p>
            <p className="font-bold text-charcoal-900 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-swiggy-orange" />
              {order.delivery_location}
            </p>
          </div>

          <div>
            <p className="font-bold text-charcoal-500 uppercase tracking-wider text-[10px]">
              Special Instructions
            </p>
            <p className="font-medium text-charcoal-800 mt-0.5">
              {order.delivery_instructions || 'Deliver all items in one bundle.'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Member Contributions & Bill Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Per Member Individual Contributions */}
        <div className="rounded-3xl bg-white border border-charcoal-100 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-charcoal-900 flex items-center justify-between">
            <span>Member-wise Breakdown</span>
            <span className="text-xs font-semibold text-charcoal-500">
              {order.member_breakdowns.length} Students
            </span>
          </h3>

          <div className="space-y-3">
            {order.member_breakdowns.map((member) => {
              const isYou = member.user_id === currentUser.id;
              return (
                <div
                  key={member.user_id}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    isYou
                      ? 'border-orange-200 bg-orange-50/40 font-semibold'
                      : 'border-charcoal-100 bg-[#FAFAF8]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full overflow-hidden relative border border-white">
                      <Image
                        src={member.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={member.user_name}
                        width={28}
                        height={28}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal-900 flex items-center gap-1">
                        {member.user_name}
                        {isYou && (
                          <span className="text-[10px] text-swiggy-orange font-bold">(You)</span>
                        )}
                      </p>
                      <p className="text-[10px] text-charcoal-500">
                        {member.items_count} {member.items_count === 1 ? 'dish' : 'dishes'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-sm text-charcoal-900">
                      {formatPaise(member.share_paise)}
                    </span>
                    <p className="text-[10px] text-emerald-600 font-bold">
                      {order.delivery_fee_paise === 0 ? 'Group Fee Waived' : 'Split Delivery'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Full Financial Summary */}
        <div className="rounded-3xl bg-white border border-charcoal-100 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-charcoal-900">
            Order Total & Savings
          </h3>

          <div className="space-y-2 text-xs text-charcoal-600">
            <div className="flex justify-between">
              <span>Restaurant Subtotal ({order.total_items_count} items)</span>
              <span className="font-mono">{formatPaise(order.subtotal_paise)}</span>
            </div>
            <div className="flex justify-between">
              <span>Combined Delivery Fee</span>
              <span className="font-mono">
                {order.delivery_fee_paise === 0 ? (
                  <strong className="text-emerald-600">FREE (Group Waived)</strong>
                ) : (
                  formatPaise(order.delivery_fee_paise)
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span className="font-mono">{formatPaise(order.platform_fee_paise)}</span>
            </div>
            {order.discount_paise > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Circle Promotion Savings</span>
                <span className="font-mono">-{formatPaise(order.discount_paise)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-charcoal-200 text-base font-black text-charcoal-900">
              <span>Grand Total</span>
              <span className="font-mono text-swiggy-orange">{formatPaise(order.total_paise)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-charcoal-100 flex flex-col gap-2">
            <Link href="/dashboard">
              <Button size="md" className="w-full rounded-2xl text-xs font-bold shadow-md">
                Return to Student Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
