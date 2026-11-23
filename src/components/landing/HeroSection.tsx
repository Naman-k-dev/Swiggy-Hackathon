'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Wallet,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-20 sm:pt-14 sm:pb-28">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-orange-300/30 via-amber-200/20 to-transparent blur-[120px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-br from-swiggy-orange/10 to-transparent blur-[100px] -z-10 pointer-events-none rounded-full" />

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
            <div className="inline-flex items-center gap-2 glass-pill px-4 py-2 rounded-full border border-white/40 shadow-glass text-xs font-semibold text-charcoal-800">
              <span className="flex h-2 w-2 rounded-full bg-swiggy-orange animate-pulse shadow-[0_0_8px_rgba(252,128,25,0.6)]" />
              <span className="text-swiggy-orange font-bold uppercase tracking-tight">Swiggy Food for Thought 2.0</span>
              <span className="text-charcoal-300">|</span>
              <span className="text-charcoal-700 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-swiggy-orange" />
                CircleMatch AI Live
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-charcoal-900 tracking-tight leading-[1.1]">
              Good Food. <br />
              <span className="bg-gradient-to-r from-swiggy-orange via-amber-500 to-orange-600 bg-clip-text text-transparent">
                Better Together.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-charcoal-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium opacity-90">
              Your college crew, your favorite food, one shared circle. Plan meals,
              order together, and skip the coordination chaos.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/circles/create" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto shadow-highlight gap-2 font-bold text-base px-8 py-6 rounded-full transition-all hover:scale-105 active:scale-95">
                  <span>Create Your Circle</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto font-bold text-base px-8 py-6 rounded-full border-charcoal-200 glass-pill hover:bg-white/50 transition-all hover:scale-105"
                >
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Proof Points */}
            <div className="pt-8 border-t border-charcoal-200/40 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-3xl font-black text-charcoal-900 tracking-tighter">₹0</p>
                <p className="text-[11px] text-charcoal-500 font-bold uppercase tracking-wide">Delivery Fee</p>
              </div>
              <div>
                <p className="text-3xl font-black text-charcoal-900 tracking-tighter">100%</p>
                <p className="text-[11px] text-charcoal-500 font-bold uppercase tracking-wide">Auto-Splitting</p>
              </div>
              <div>
                <p className="text-3xl font-black text-charcoal-900 tracking-tighter">0 min</p>
                <p className="text-[11px] text-charcoal-500 font-bold uppercase tracking-wide">WhatsApp Waste</p>
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
            <div className="relative mx-auto max-w-md rounded-[2.5rem] glass-card p-6 shadow-2xl border-white/60 ring-1 ring-black/5">
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-5 border-b border-charcoal-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-swiggy-orange to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-200/50">
                    <Sparkles className="w-6 h-6 fill-white/20" />
                  </div>
                  <div>
                    <h4 className="font-black text-charcoal-900 leading-tight">CSE Lunch Squad</h4>
                    <p className="text-[11px] text-charcoal-500 font-bold uppercase tracking-wide flex items-center gap-1">
                      <Clock className="w-3 h-3 text-swiggy-orange" />
                      Ends in 12:45
                    </p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                  ].map((avatarUrl, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-charcoal-100 overflow-hidden shadow-sm ring-1 ring-black/5">
                      <Image
                        src={avatarUrl}
                        alt="Member"
                        width={32}
                        height={32}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-charcoal-50 flex items-center justify-center text-[10px] font-bold text-charcoal-400 shadow-sm ring-1 ring-black/5">
                    +2
                  </div>
                </div>
              </div>

              {/* Mockup Items */}
              <div className="py-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-charcoal-900">Hyderabadi Chicken Biryani</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-charcoal-500 bg-charcoal-50 px-2 py-0.5 rounded-full border border-charcoal-100">Aarav S.</span>
                      <span className="text-[10px] font-bold text-swiggy-orange uppercase tracking-tighter">Non-Veg</span>
                    </div>
                  </div>
                  <p className="text-sm font-black text-charcoal-900">₹249</p>
                </div>
                <div className="flex justify-between items-start opacity-60">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-charcoal-900">Paneer Kathi Roll</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-charcoal-500 bg-charcoal-50 px-2 py-0.5 rounded-full border border-charcoal-100">Ananya I.</span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Veg</span>
                    </div>
                  </div>
                  <p className="text-sm font-black text-charcoal-900">₹120</p>
                </div>
              </div>

              {/* Mockup Footer */}
              <div className="pt-5 border-t border-dashed border-charcoal-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs font-bold text-charcoal-500 uppercase tracking-wide">Total Pool</p>
                    <p className="text-xl font-black text-charcoal-900">₹369.00</p>
                  </div>
                  <div className="glass-pill px-4 py-2 rounded-2xl border-emerald-100 bg-emerald-50/50">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight flex items-center gap-1.5">
                      <TrendingDown className="w-3 h-3" />
                      Free Delivery Unlocked!
                    </p>
                  </div>
                </div>
                <Button className="w-full rounded-2xl font-bold py-6 shadow-highlight bg-gradient-to-r from-swiggy-orange to-orange-600 border-none">
                  Lock & Place Order
                </Button>
              </div>
            </div>

            {/* Floating Element 1 */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 glass-pill px-4 py-2.5 rounded-2xl border-white/50 shadow-xl flex items-center gap-3 z-10"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-charcoal-400 uppercase leading-none">Saved Today</p>
                <p className="text-sm font-black text-charcoal-900">₹45.00</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
