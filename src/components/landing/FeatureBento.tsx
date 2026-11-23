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
    <section className="py-20 bg-white border-t border-charcoal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-swiggy-orange">
            Built for Campus Dynamics
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            Designed Around Student Habits
          </h2>
          <p className="text-charcoal-600 text-sm sm:text-base">
            Not just generic group checkout. We engineered every touchpoint for hostel life, tight budgets, and campus schedules.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 (Large - 2 cols): Reusable Recurring Circles */}
          <div className="md:col-span-2 rounded-3xl bg-gradient-to-br from-charcoal-900 to-charcoal-800 text-white p-8 relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10 space-y-4 max-w-md">
              <Badge variant="orange" size="sm">
                Recurring Community
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Permanent Circles, Not Ephemeral Cart Links
              </h3>
              <p className="text-charcoal-300 text-sm leading-relaxed">
                Swiggy’s traditional group order link dies once placed. Campus Circles stay alive across semesters for your hostel wing, lab team, or study group.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="bg-charcoal-800 text-charcoal-200 text-xs px-3 py-1 rounded-full border border-charcoal-700">
                  Hostel Wings
                </span>
                <span className="bg-charcoal-800 text-charcoal-200 text-xs px-3 py-1 rounded-full border border-charcoal-700">
                  CSE / ECE Batches
                </span>
                <span className="bg-charcoal-800 text-charcoal-200 text-xs px-3 py-1 rounded-full border border-charcoal-700">
                  Cultural Clubs
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-charcoal-700/60 flex items-center justify-between text-xs text-charcoal-400">
              <span>One-click session launch anytime</span>
              <Users2 className="w-6 h-6 text-swiggy-orange" />
            </div>
          </div>

          {/* Card 2: Student Budget Guardrails */}
          <div className="rounded-3xl bg-[#FAFAF8] border border-charcoal-100 p-8 flex flex-col justify-between hover:shadow-card transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-charcoal-900">
                Budget Guardrails
              </h3>
              <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
                Set a circle budget ceiling (e.g. ₹200/person). Filter restaurant choices instantly to match student pocket money.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-charcoal-200/50 text-xs font-bold text-amber-600">
              No end-of-the-month surprises
            </div>
          </div>

          {/* Card 3: Dietary Tag Transparency */}
          <div className="rounded-3xl bg-[#FAFAF8] border border-charcoal-100 p-8 flex flex-col justify-between hover:shadow-card transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-veg-light text-veg-dark flex items-center justify-center">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-charcoal-900">
                Dietary Preference Isolation
              </h3>
              <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
                Strict vegetarians and non-vegetarians can order together comfortably. Items are visually separated with standard Indian green and red markers.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-charcoal-200/50 text-xs font-bold text-emerald-600">
              Clear packaging tags
            </div>
          </div>

          {/* Card 4: Cutoff Timers & Automatic Locking */}
          <div className="rounded-3xl bg-[#FAFAF8] border border-charcoal-100 p-8 flex flex-col justify-between hover:shadow-card transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-swiggy-light text-swiggy-orange flex items-center justify-center">
                <Clock3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-charcoal-900">
                Order Cutoff Countdown
              </h3>
              <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
                Admins set an exact deadline (e.g., 20 mins before lecture ends). The cart locks automatically, preventing delays for the group.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-charcoal-200/50 text-xs font-bold text-swiggy-orange">
              Coordinated around class schedules
            </div>
          </div>

          {/* Card 5: Campus Gate Drop Point */}
          <div className="rounded-3xl bg-gradient-to-br from-swiggy-orange/10 via-amber-50 to-orange-50 border border-orange-200 p-8 flex flex-col justify-between hover:shadow-card transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-swiggy-orange text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-charcoal-900">
                Designated Campus Drop Points
              </h3>
              <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
                Delivery partners drop the entire bundled order at a single agreed location (e.g. Hostel Gate 2 or Library stairs).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-orange-200 text-xs font-bold text-swiggy-orange">
              Zero delivery confusion for drivers
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
