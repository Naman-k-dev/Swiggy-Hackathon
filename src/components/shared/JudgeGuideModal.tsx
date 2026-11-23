'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface JudgeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JudgeGuideModal({ isOpen, onClose }: JudgeGuideModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎓 Competition Judge & Evaluator Guide"
      description="Swiggy Food for Thought 2.0 Concept Prototype Walkthrough"
      className="max-w-2xl"
    >
      <div className="space-y-6 pt-2 text-xs sm:text-sm text-charcoal-700">
        {/* Core Value Proposition */}
        <div className="p-4 rounded-2xl bg-swiggy-light border border-orange-200 space-y-1.5">
          <p className="font-extrabold text-swiggy-dark flex items-center gap-1.5 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-swiggy-orange" />
            Core Innovation: Why Campus Circles beats standard group carts
          </p>
          <p className="text-xs text-charcoal-700 leading-relaxed">
            Existing delivery apps treat group ordering as a single ephemeral link shared over WhatsApp. <strong>Campus Circles</strong> turns ordering into persistent campus communities with student budget caps, automated per-member paise-accurate splitting, shared delivery threshold incentives, and single campus-gate drops.
          </p>
        </div>

        {/* 4 Evaluator Test Journeys */}
        <div className="space-y-3">
          <p className="font-bold text-xs uppercase tracking-wider text-charcoal-500">
            Recommended 2-Minute Evaluation Path:
          </p>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-charcoal-50 border border-charcoal-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-swiggy-orange text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                1
              </span>
              <div>
                <p className="font-bold text-charcoal-900 text-xs">Switch Student Personas</p>
                <p className="text-[11px] text-charcoal-500">
                  Use the top black bar to switch between <strong>Aarav (Admin)</strong>, <strong>Ananya (Veg)</strong>, <strong>Rohan (Non-Veg)</strong>, and <strong>Priya</strong>. Each student has distinct dietary preferences and budget settings.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-50 border border-charcoal-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-swiggy-orange text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                2
              </span>
              <div>
                <p className="font-bold text-charcoal-900 text-xs">Test Cross-Tab Real-time Sync</p>
                <p className="text-[11px] text-charcoal-500">
                  Open this app in <strong>two browser tabs side-by-side</strong>. In Tab 1, view as Aarav and add a dish. Watch Tab 2 (e.g. Ananya) instantly update the live cart without refreshing!
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-50 border border-charcoal-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-swiggy-orange text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                3
              </span>
              <div>
                <p className="font-bold text-charcoal-900 text-xs">Test Invite & Joining Flow</p>
                <p className="text-[11px] text-charcoal-500">
                  Visit <code className="bg-white px-1.5 py-0.5 rounded border text-swiggy-orange font-bold">/join/CAMPUS24</code> or click &quot;Join Circle&quot; on the dashboard.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-50 border border-charcoal-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-swiggy-orange text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                4
              </span>
              <div>
                <p className="font-bold text-charcoal-900 text-xs">Lock Cart & Simulated Checkout</p>
                <p className="text-[11px] text-charcoal-500">
                  As Aarav (Admin), click <strong>Lock Cart</strong>, then <strong>Finalize & Place Order</strong>. Observe the simulated order tracking timeline and individual paise cost breakdown.
                </p>
              </div>
            </div>
          </div>
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
