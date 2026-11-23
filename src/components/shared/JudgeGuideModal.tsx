'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Sparkles, Database, CheckCircle2, RotateCcw } from 'lucide-react';
import { useApp } from '@/lib/store/demo-context';

interface JudgeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JudgeGuideModal({ isOpen, onClose }: JudgeGuideModalProps) {
  const { importDemoData, resetDemoData, hasDemoData } = useApp();
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleImport = () => {
    importDemoData();
    setFeedbackMsg('Demo campus squads, active carts & menus loaded successfully!');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleReset = () => {
    resetDemoData();
    setFeedbackMsg('Demo state reset. Experience fresh campus onboarding!');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎓 Competition Judge & Evaluator Guide"
      description="Swiggy Food for Thought 2.0 Concept Prototype Walkthrough"
      className="max-w-2xl"
    >
      <div className="space-y-6 pt-2 text-xs sm:text-sm text-charcoal-700 dark:text-slate-200">
        {/* Core Value Proposition */}
        <div className="p-4 rounded-2xl bg-swiggy-light dark:bg-orange-950/20 border border-orange-200 dark:border-orange-500/30 space-y-1.5">
          <p className="font-extrabold text-swiggy-dark dark:text-orange-400 flex items-center gap-1.5 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-swiggy-orange" />
            Core Innovation: Why Campus Circles beats standard group carts
          </p>
          <p className="text-xs text-charcoal-700 dark:text-slate-300 leading-relaxed">
            Existing delivery apps treat group ordering as a single ephemeral link shared over WhatsApp. <strong>Campus Circles</strong> turns ordering into persistent campus communities with student budget caps, automated per-member paise-accurate splitting, shared delivery threshold incentives, and single campus-gate drops.
          </p>
        </div>

        {/* Judge Demo Data Loader Control */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-300 dark:border-orange-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-extrabold text-charcoal-900 dark:text-white flex items-center gap-2 text-xs sm:text-sm">
                <Database className="w-4 h-4 text-swiggy-orange" />
                Demo Evaluation Data
              </p>
              <p className="text-[11px] text-charcoal-500 dark:text-slate-400 mt-0.5">
                {hasDemoData
                  ? 'Sample circle squad & shared cart loaded.'
                  : 'Start with clean slate or load pre-populated circles & carts for rapid evaluation.'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                onClick={handleImport}
                className="rounded-xl font-black text-xs gap-1.5 bg-swiggy-orange hover:bg-swiggy-dark text-white shadow-sm border-none"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Import Demo Data</span>
              </Button>
              {hasDemoData && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="rounded-xl text-xs gap-1.5 dark:border-slate-700 dark:text-slate-300 hover:text-red-500"
                  title="Clear all demo state and return to fresh slate"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>
          {feedbackMsg && (
            <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5 font-medium animate-in fade-in duration-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </div>

        {/* 4 Evaluator Test Journeys */}
        <div className="space-y-3">
          <p className="font-bold text-xs uppercase tracking-wider text-charcoal-500 dark:text-slate-400">
            Recommended 2-Minute Evaluation Path:
          </p>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-charcoal-50 dark:bg-slate-900 border border-charcoal-200 dark:border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-swiggy-orange text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                1
              </span>
              <div>
                <p className="font-bold text-charcoal-900 dark:text-white text-xs">Sign In & Custom Student Profile</p>
                <p className="text-[11px] text-charcoal-500 dark:text-slate-400">
                  Register or sign in with your own student account. Set custom dietary preferences and meal budget limits.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-50 dark:bg-slate-900 border border-charcoal-200 dark:border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-swiggy-orange text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                2
              </span>
              <div>
                <p className="font-bold text-charcoal-900 dark:text-white text-xs">Test Cross-Tab Real-time Sync</p>
                <p className="text-[11px] text-charcoal-500 dark:text-slate-400">
                  Open this app in <strong>two browser tabs side-by-side</strong>. Add a dish from any campus restaurant and observe instant live updates without refreshing!
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-50 dark:bg-slate-900 border border-charcoal-200 dark:border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-swiggy-orange text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                3
              </span>
              <div>
                <p className="font-bold text-charcoal-900 dark:text-white text-xs">Test Invite & Joining Flow</p>
                <p className="text-[11px] text-charcoal-500 dark:text-slate-400">
                  Visit <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-charcoal-200 dark:border-slate-700 text-swiggy-orange font-bold">/join/CAMPUS24</code> or click &quot;Join Circle&quot; on the dashboard.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-orange-50/80 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-500/30 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-swiggy-orange text-white text-xs font-bold flex items-center justify-center flex-shrink-0 animate-pulse">
                ★
              </span>
              <div>
                <p className="font-bold text-swiggy-dark dark:text-orange-400 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-swiggy-orange" />
                  Phase 2 Innovation: Test CircleMatch AI ✨
                </p>
                <p className="text-[11px] text-charcoal-700 dark:text-slate-300 mt-0.5">
                  Inside the Circle page, click <strong>&quot;Find Our Perfect Meal ✨&quot;</strong>. CircleMatch AI automatically reads student cravings, strictly isolates dietary constraints, and generates balanced group meal plans from a single campus restaurant!
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-50 dark:bg-slate-900 border border-charcoal-200 dark:border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-swiggy-orange text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                4
              </span>
              <div>
                <p className="font-bold text-charcoal-900 dark:text-white text-xs">Lock Cart & Simulated Checkout</p>
                <p className="text-[11px] text-charcoal-500 dark:text-slate-400">
                  Click <strong>Lock Cart</strong>, then <strong>Finalize & Place Order</strong>. Observe the simulated order tracking timeline and individual paise cost breakdown.
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
