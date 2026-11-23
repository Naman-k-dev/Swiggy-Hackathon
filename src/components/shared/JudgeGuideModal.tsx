'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface JudgeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JudgeGuideModal({ isOpen, onClose }: JudgeGuideModalProps) {
  const steps = [
    {
      num: 1,
      title: 'Open "CSE Lunch Squad"',
      desc: 'Navigate to the primary demo circle from the dashboard with 4 active student members.',
    },
    {
      num: 2,
      title: 'Review 4 Student Constraints',
      desc: 'Notice Aarav (Admin), Ananya (Strict Veg ₹180), Rohan (Non-Veg ₹250), and Priya (Veg ₹200).',
    },
    {
      num: 3,
      title: 'Authenticate / Switch to Swiggy MCP',
      desc: 'Use the top bar "Data Source" badge to toggle between Live Swiggy Food MCP and Campus Verified Menus.',
    },
    {
      num: 4,
      title: 'Discover Nearby Restaurants',
      desc: 'Browse verified campus partner restaurants with real ratings, delivery times, and pure-veg indicators.',
    },
    {
      num: 5,
      title: 'Run CircleMatch AI ✨',
      desc: 'Click "Find Our Perfect Meal ✨". The constraint satisfaction engine reads all 4 student cravings simultaneously.',
    },
    {
      num: 6,
      title: 'Compare 3 Group Meal Plans',
      desc: 'Review "Best Overall", "Most Budget-Friendly", and "Most Crowd-Pleasing" plans from a single restaurant.',
    },
    {
      num: 7,
      title: 'Inspect Member-Wise Allocations',
      desc: 'Check that vegetarian constraints are never violated and all dish costs stay within individual budgets.',
    },
    {
      num: 8,
      title: 'Accept Individual Recommendations',
      desc: 'Customize or swap any student dish, then click "Add Accepted Meals to Circle Cart" with confetti!',
    },
    {
      num: 9,
      title: 'Collaborative Cart & Swiggy Sync 🛒',
      desc: 'Review the synchronized cart. Optional: Click "Sync to Swiggy App" to test update_food_cart MCP tool.',
    },
    {
      num: 10,
      title: 'Simulated Order & Research Telemetry',
      desc: 'Admin finalizes the simulated order. View live telemetry and export research CSV data.',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎓 Competition Judge & Evaluator Guide"
      description="Swiggy Food for Thought 2.0 — Official 10-Step Evaluation Journey"
      className="max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-5 pt-2 text-xs sm:text-sm text-charcoal-700">
        {/* Core Value Proposition */}
        <div className="p-4 rounded-2xl bg-swiggy-light border border-orange-200 space-y-1.5">
          <p className="font-extrabold text-swiggy-dark flex items-center gap-1.5 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-swiggy-orange" />
            Core Innovation: Why Campus Circles beats standard group carts
          </p>
          <p className="text-xs text-charcoal-700 leading-relaxed">
            Standard food apps treat group ordering as a single ephemeral WhatsApp link. <strong>Campus Circles</strong> turns ordering into persistent campus communities with individual student budget caps, automated paise-accurate splitting, free delivery pool incentives, Swiggy Food MCP live menu matching, and single campus-gate batch drops.
          </p>
        </div>

        {/* 10 Evaluator Steps */}
        <div className="space-y-2.5">
          <p className="font-bold text-xs uppercase tracking-wider text-charcoal-500">
            Recommended 3-Minute Evaluation Walkthrough:
          </p>

          <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
            {steps.map((s) => (
              <div
                key={s.num}
                className="p-3 rounded-xl bg-charcoal-50 border border-charcoal-200 flex items-start gap-3 hover:border-orange-300 transition"
              >
                <span className="w-6 h-6 rounded-full bg-swiggy-orange text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {s.num}
                </span>
                <div>
                  <p className="font-bold text-charcoal-900 text-xs">{s.title}</p>
                  <p className="text-[11px] text-charcoal-600 leading-normal mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Guardrails */}
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Competition Safety:</strong> Checkout is strictly simulated. No real money or payments will be processed during evaluation.
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <Button size="md" className="rounded-xl font-bold text-xs" onClick={onClose}>
            Got it, Let&apos;s Explore!
          </Button>
        </div>
      </div>
    </Modal>
  );
}
