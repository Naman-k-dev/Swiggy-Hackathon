'use client';

import React from 'react';
import Link from 'next/link';
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
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left: Copy & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7 space-y-8 text-center lg:text-left"
          >
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[10px] font-bold uppercase tracking-widest text-charcoal-400 dark:text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-swiggy-orange" />
              <span>Swiggy Food for Thought 2.0</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-charcoal-900 dark:text-white tracking-tight leading-[1.05]">
              Better food, <br />
              <span className="text-swiggy-orange">together.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-charcoal-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Your college crew, your favorite food, one shared circle. Plan meals,
              order together, and skip the coordination chaos.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/circles/create" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto font-bold text-sm px-10 h-14 rounded-full bg-swiggy-orange hover:bg-swiggy-dark text-white border-none shadow-none transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Create Circle
                </Button>
              </Link>

              <Link href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto font-bold text-sm px-10 h-14 rounded-full border-slate-200 dark:border-slate-800 text-charcoal-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Proof Points */}
            <div className="pt-10 flex items-center justify-center lg:justify-start gap-12">
              <div>
                <p className="text-2xl font-bold text-charcoal-900 dark:text-white">₹0</p>
                <p className="text-[10px] text-charcoal-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Delivery Fee</p>
              </div>
              <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
              <div>
                <p className="text-2xl font-bold text-charcoal-900 dark:text-white">100%</p>
                <p className="text-[10px] text-charcoal-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Auto-Split</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Live Interactive Card Mockup (5 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md rounded-[2.5rem] glass-card dark:bg-slate-900 dark:border-slate-800 p-6 shadow-2xl border-white/60 dark:border-slate-800 ring-1 ring-black/5">
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-5 border-b border-charcoal-100/50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-swiggy-orange to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-200/50">
                    <Sparkles className="w-6 h-6 fill-white/20" />
                  </div>
                  <div>
                    <h4 className="font-black text-charcoal-900 dark:text-white leading-tight">CSE Lunch Squad</h4>
                    <p className="text-[11px] text-charcoal-500 dark:text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1">
                      <Clock className="w-3 h-3 text-swiggy-orange" />
                      Ends in 12:45
                    </p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {[
                    { bg: 'from-blue-500 to-indigo-600', label: 'JD' },
                    { bg: 'from-amber-500 to-orange-600', label: 'SK' },
                    { bg: 'from-emerald-500 to-teal-600', label: 'RM' },
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-br ${m.bg} text-white text-[10px] font-black flex items-center justify-center shadow-sm ring-1 ring-black/5`}
                    >
                      {m.label}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-charcoal-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-charcoal-600 dark:text-slate-300 shadow-sm ring-1 ring-black/5">
                    +2
                  </div>
                </div>
              </div>

              {/* Mockup Items */}
              <div className="py-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-charcoal-900 dark:text-white">Hyderabadi Chicken Biryani</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-charcoal-500 dark:text-slate-400 bg-charcoal-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-charcoal-100 dark:border-slate-700">Member #1</span>
                      <span className="text-[10px] font-bold text-swiggy-orange uppercase tracking-tighter">Non-Veg</span>
                    </div>
                  </div>
                  <p className="text-sm font-black text-charcoal-900 dark:text-white">₹249</p>
                </div>
                <div className="flex justify-between items-start opacity-75">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-charcoal-900 dark:text-white">Paneer Kathi Roll</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-charcoal-500 dark:text-slate-400 bg-charcoal-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-charcoal-100 dark:border-slate-700">Member #2</span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">Veg</span>
                    </div>
                  </div>
                  <p className="text-sm font-black text-charcoal-900 dark:text-white">₹120</p>
                </div>
              </div>

              {/* Mockup Footer */}
              <div className="pt-5 border-t border-dashed border-charcoal-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs font-bold text-charcoal-500 dark:text-slate-400 uppercase tracking-wide">Total Pool</p>
                    <p className="text-xl font-black text-charcoal-900 dark:text-white">₹369.00</p>
                  </div>
                  <div className="glass-pill dark:bg-slate-800 px-4 py-2 rounded-2xl border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/30">
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight flex items-center gap-1.5">
                      <TrendingDown className="w-3 h-3" />
                      Group Delivery Fee Waived!
                    </p>
                  </div>
                </div>
                <Link href="/dashboard" className="block">
                  <Button className="w-full rounded-2xl font-bold py-6 shadow-highlight bg-gradient-to-r from-swiggy-orange to-orange-600 border-none text-white">
                    Simulated Group Cart Preview
                  </Button>
                </Link>
              </div>
            </div>

            {/* Floating Element 1 - Repositioned cleanly inside wrapper bounds */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-2 right-2 sm:-top-4 sm:-right-4 glass-pill dark:bg-slate-900 dark:border-slate-700 px-4 py-2.5 rounded-2xl border-white/50 shadow-xl flex items-center gap-3 z-20"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-charcoal-400 dark:text-slate-400 uppercase leading-none">Sample Fee Saved</p>
                <p className="text-sm font-black text-charcoal-900 dark:text-white">₹30.00+</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
