'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPaise } from '@/lib/utils';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-20 sm:pt-14 sm:pb-28">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-200/40 via-amber-100/30 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left: Copy & Actions (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-orange-200 shadow-sm text-xs font-semibold text-charcoal-800">
              <span className="flex h-2 w-2 rounded-full bg-swiggy-orange animate-pulse" />
              <span className="text-swiggy-orange font-bold">Swiggy Food for Thought 2.0</span>
              <span className="text-charcoal-400">|</span>
              <span>Next-Gen Campus Dining</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-[1.12]">
              Good Food. <br />
              <span className="bg-gradient-to-r from-swiggy-orange via-amber-500 to-orange-600 bg-clip-text text-transparent">
                Better Together.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-charcoal-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Your college crew, your favorite food, one shared circle. Plan meals,
              order together, and skip the coordination chaos.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link href="/circles/create" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto shadow-md gap-2 font-bold text-base px-7">
                  <span>Create Your Circle</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto font-semibold text-base px-6 border-charcoal-200 hover:bg-white"
                >
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Proof Points */}
            <div className="pt-6 border-t border-charcoal-200/60 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-2xl font-black text-charcoal-900 tracking-tight">₹0</p>
                <p className="text-xs text-charcoal-500 font-medium">Delivery fee on circle orders</p>
              </div>
              <div>
                <p className="text-2xl font-black text-charcoal-900 tracking-tight">100%</p>
                <p className="text-xs text-charcoal-500 font-medium">Automated individual bill split</p>
              </div>
              <div>
                <p className="text-2xl font-black text-charcoal-900 tracking-tight">0 min</p>
                <p className="text-xs text-charcoal-500 font-medium">WhatsApp coordination waste</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Live Interactive Card Mockup (5 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto max-w-md rounded-3xl bg-white p-5 shadow-2xl border border-charcoal-100 ring-1 ring-black/5">
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-4 border-b border-charcoal-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xl shadow-sm">
                    🍱
                  </div>
                  <div>
                    <h3 className="font-extrabold text-charcoal-900 text-sm leading-tight">
                      CSE Lunch Squad
                    </h3>
                    <p className="text-[11px] text-charcoal-500">Rolls & Bowls Co. • Active</p>
                  </div>
                </div>

                <Badge variant="success" size="sm" className="font-bold gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Order Open
                </Badge>
              </div>

              {/* Countdown & Drop point */}
              <div className="my-3.5 bg-swiggy-light/70 rounded-2xl p-3 flex items-center justify-between border border-orange-100 text-xs">
                <div className="flex items-center gap-2 text-swiggy-dark font-medium">
                  <Clock className="w-3.5 h-3.5 text-swiggy-orange" />
                  <span>Cutoff in <strong>24 mins</strong></span>
                </div>
                <span className="text-[11px] font-semibold text-charcoal-700">Hostel Block C</span>
              </div>

              {/* Live Member Items List */}
              <div className="space-y-2.5 py-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">
                  Shared Circle Cart (3 members added)
                </p>

                {/* Aarav's Item */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-charcoal-50/80 border border-charcoal-100/80 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden relative border border-white">
                      <Image
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                        alt="Aarav"
                        width={28}
                        height={28}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal-900 flex items-center gap-1.5">
                        Aarav <span className="veg-icon !w-3 !h-3 scale-75" />
                      </p>
                      <p className="text-[11px] text-charcoal-500">Double Paneer Kathi Roll</p>
                    </div>
                  </div>
                  <span className="font-bold text-charcoal-900">{formatPaise(17900)}</span>
                </div>

                {/* Ananya's Item */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-charcoal-50/80 border border-charcoal-100/80 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden relative border border-white">
                      <Image
                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100"
                        alt="Ananya"
                        width={28}
                        height={28}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal-900 flex items-center gap-1.5">
                        Ananya <span className="veg-icon !w-3 !h-3 scale-75" />
                      </p>
                      <p className="text-[11px] text-charcoal-500">Fiesta Veg Burrito Bowl</p>
                    </div>
                  </div>
                  <span className="font-bold text-charcoal-900">{formatPaise(19900)}</span>
                </div>

                {/* Rohan's Item */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-charcoal-50/80 border border-charcoal-100/80 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden relative border border-white">
                      <Image
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                        alt="Rohan"
                        width={28}
                        height={28}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal-900 flex items-center gap-1.5">
                        Rohan <span className="non-veg-icon !w-3 !h-3 scale-75" />
                      </p>
                      <p className="text-[11px] text-charcoal-500">Butter Chicken Loaded Roll</p>
                    </div>
                  </div>
                  <span className="font-bold text-charcoal-900">{formatPaise(21900)}</span>
                </div>
              </div>

              {/* Group Total & Action */}
              <div className="mt-4 pt-3.5 border-t border-charcoal-100">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-charcoal-500 font-medium">Group Subtotal (3 items)</span>
                  <div className="text-right">
                    <span className="font-black text-sm text-charcoal-900">{formatPaise(59700)}</span>
                    <span className="block text-[10px] text-emerald-600 font-bold">Delivery Fee Waived (Saved ₹90)</span>
                  </div>
                </div>

                <Link href="/circles/circle-cse-lunch-squad">
                  <Button className="w-full rounded-2xl font-bold py-2.5 shadow-sm text-xs gap-1.5">
                    <span>Enter Live Group Cart</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              {/* Floating Realtime Badge */}
              <div className="absolute -bottom-3 -right-3 bg-charcoal-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-charcoal-800 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Live Cross-Tab Sync</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
