'use client';

import React from 'react';
import {
  Users2,
  Wallet,
  Clock3,
  Sparkles,
  Leaf,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function FeatureBento() {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white via-[#FAFAF8] to-white">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-orange-200/20 via-amber-100/10 to-transparent blur-[140px] -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 glass-pill px-3.5 py-1.5 rounded-full border border-orange-200 text-xs font-bold text-swiggy-orange uppercase tracking-wider">
            Built for Campus Dynamics
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-charcoal-900 tracking-tight">
            Designed Around Student Habits
          </h2>
          <p className="text-charcoal-600 text-base sm:text-lg font-medium">
            Not just generic group checkout. We engineered every touchpoint for hostel life, tight budgets, and campus schedules.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 (Large - 2 cols): Reusable Recurring Circles */}
          <div className="md:col-span-2 rounded-[2.5rem] bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-black text-white p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-swiggy-orange/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10 space-y-5 max-w-md">
              <Badge variant="orange" size="sm" className="glass-pill bg-swiggy-orange/20 border-swiggy-orange/30 text-swiggy-orange font-bold">
                Recurring Community
              </Badge>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Permanent Circles, Not Ephemeral Cart Links
              </h3>
              <p className="text-charcoal-300 text-sm sm:text-base leading-relaxed font-normal">
                Swiggy&apos;s traditional group order link dies once placed. Campus Circles stay alive across semesters for your hostel wing, lab team, or study group.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="glass-pill bg-white/10 text-white text-xs px-3.5 py-1.5 rounded-full border border-white/10 font-medium">
                  Hostel Wings
                </span>
                <span className="glass-pill bg-white/10 text-white text-xs px-3.5 py-1.5 rounded-full border border-white/10 font-medium">
                  CSE / ECE Batches
                </span>
                <span className="glass-pill bg-white/10 text-white text-xs px-3.5 py-1.5 rounded-full border border-white/10 font-medium">
                  Cultural Clubs
                </span>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-charcoal-400 font-medium">
              <span>One-click session launch anytime</span>
              <Users2 className="w-6 h-6 text-swiggy-orange" />
            </div>
          </div>

          {/* Card 2: Student Budget Guardrails */}
          <div className="rounded-[2.5rem] glass-card p-8 flex flex-col justify-between hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 flex items-center justify-center shadow-inner">
                <Wallet className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-charcoal-900">
                Budget Guardrails
              </h3>
              <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed font-medium">
                Set a circle budget ceiling (e.g. ₹200/person). Filter restaurant choices instantly to match student pocket money.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-charcoal-200/60 text-xs font-bold text-amber-700 flex items-center gap-1.5">
              <span>No end-of-the-month surprises</span>
            </div>
          </div>

          {/* Card 3: Dietary Tag Transparency */}
          <div className="rounded-[2.5rem] glass-card p-8 flex flex-col justify-between hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-700 flex items-center justify-center shadow-inner">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-charcoal-900">
                Dietary Preference Isolation
              </h3>
              <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed font-medium">
                Strict vegetarians and non-vegetarians can order together comfortably. Items are visually separated with standard Indian green and red markers.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-charcoal-200/60 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <span>Clear packaging tags</span>
            </div>
          </div>

          {/* Card 4: Cutoff Timers & Automatic Locking */}
          <div className="rounded-[2.5rem] glass-card p-8 flex flex-col justify-between hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-swiggy-orange flex items-center justify-center shadow-inner">
                <Clock3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-charcoal-900">
                Order Cutoff Countdown
              </h3>
              <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed font-medium">
                Admins set an exact deadline (e.g., 20 mins before lecture ends). The cart locks automatically, preventing delays for the group.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-charcoal-200/60 text-xs font-bold text-swiggy-orange flex items-center gap-1.5">
              <span>Coordinated around class schedules</span>
            </div>
          </div>

          {/* Card 5: Campus Gate Drop Point */}
          <div className="rounded-[2.5rem] glass-card p-8 flex flex-col justify-between hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 border-orange-200 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/50">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-swiggy-orange to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-200/50">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-charcoal-900">
                Designated Campus Drop Points
              </h3>
              <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed font-medium">
                Delivery partners drop the entire bundled order at a single agreed location (e.g. Hostel Gate 2 or Library stairs).
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-orange-200/60 text-xs font-bold text-swiggy-orange flex items-center gap-1.5">
              <span>Zero delivery confusion for drivers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}