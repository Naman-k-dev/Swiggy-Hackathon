'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { pilotLabService } from '@/lib/pilot/pilot-lab-service';

interface PostOrderFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  circleId: string;
  userId: string;
  onSubmitted?: () => void;
}

export function PostOrderFeedbackModal({
  isOpen,
  onClose,
  orderId,
  circleId,
  userId,
  onSubmitted,
}: PostOrderFeedbackModalProps) {
  const [wasFlowEasy, setWasFlowEasy] = useState<boolean>(true);
  const [satisfactionScore, setSatisfactionScore] = useState<number>(5);
  const [confusingStep, setConfusingStep] = useState<string>('None');
  const [wouldUseAgain, setWouldUseAgain] = useState<boolean>(true);
  const [improvementSuggestions, setImprovementSuggestions] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const stepsList = [
    'None',
    'Restaurant Discovery & Voting',
    'Adding Items to Shared Cart',
    'Dietary / Veg Isolation Warning',
    'Locking Cart & Review',
    'Member-wise Paise Split',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      pilotLabService.submitSessionFeedback({
        orderId,
        circleId,
        userId,
        wasFlowEasy,
        satisfactionScore,
        confusingStep: confusingStep === 'None' ? undefined : confusingStep,
        wouldUseAgain,
        improvementSuggestions: improvementSuggestions.trim() || undefined,
        isSimulatedDemo: false,
      });

      // API bridge
      await fetch('/api/pilot/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          circleId,
          userId,
          wasFlowEasy,
          satisfactionScore,
          confusingStep: confusingStep === 'None' ? undefined : confusingStep,
          wouldUseAgain,
          improvementSuggestions: improvementSuggestions.trim() || undefined,
          isSimulatedDemo: false,
        }),
      }).catch(() => {});

      setIsSubmitted(true);
      if (onSubmitted) onSubmitted();

      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="💬 Quick Post-Order Research Feedback"
      description="Help our campus pilot improve! Completely voluntary, optional questions."
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs sm:text-sm">
        {/* Easy Flow Yes/No */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
            Was the group ordering flow easy to follow?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setWasFlowEasy(true)}
              className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                wasFlowEasy
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                  : 'border-charcoal-200 dark:border-slate-700 text-charcoal-600 dark:text-slate-400'
              }`}
            >
              ✓ Yes, very smooth
            </button>
            <button
              type="button"
              onClick={() => setWasFlowEasy(false)}
              className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                !wasFlowEasy
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                  : 'border-charcoal-200 dark:border-slate-700 text-charcoal-600 dark:text-slate-400'
              }`}
            >
              ⚠ No, had issues
            </button>
          </div>
        </div>

        {/* Satisfaction Rating */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
            Overall Satisfaction with this order session:
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setSatisfactionScore(star)}
                className={`w-9 h-9 rounded-xl font-bold text-sm border transition ${
                  satisfactionScore >= star
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                    : 'border-charcoal-200 dark:border-slate-700 text-charcoal-400'
                }`}
              >
                ★ {star}
              </button>
            ))}
            <span className="text-xs text-charcoal-400 ml-1">
              ({satisfactionScore >= 4 ? 'Great' : satisfactionScore === 3 ? 'Neutral' : 'Needs work'})
            </span>
          </div>
        </div>

        {/* Confusing Step */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
            Did any step feel confusing or redundant?
          </label>
          <select
            value={confusingStep}
            onChange={(e) => setConfusingStep(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs"
          >
            {stepsList.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Would use again */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
            Would you order with this circle again?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setWouldUseAgain(true)}
              className={`flex-1 p-2 rounded-xl text-xs font-bold border transition ${
                wouldUseAgain
                  ? 'border-swiggy-orange bg-swiggy-light/60 dark:bg-orange-950/40 text-swiggy-dark dark:text-orange-300'
                  : 'border-charcoal-200 dark:border-slate-700 text-charcoal-500'
              }`}
            >
              Definitely Yes
            </button>
            <button
              type="button"
              onClick={() => setWouldUseAgain(false)}
              className={`flex-1 p-2 rounded-xl text-xs font-bold border transition ${
                !wouldUseAgain
                  ? 'border-charcoal-400 bg-charcoal-100 dark:bg-slate-800 text-charcoal-900 dark:text-white'
                  : 'border-charcoal-200 dark:border-slate-700 text-charcoal-500'
              }`}
            >
              Unsure / Prefer WhatsApp
            </button>
          </div>
        </div>

        {/* Written comments */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
            Any suggestions for next time? (Optional)
          </label>
          <textarea
            value={improvementSuggestions}
            onChange={(e) => setImprovementSuggestions(e.target.value)}
            rows={2}
            placeholder="e.g. Add a reminder 5 mins before cart lock."
            className="w-full px-3 py-2 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs focus:ring-2 focus:ring-swiggy-orange focus:outline-none"
          />
        </div>

        {isSubmitted && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Thank you for helping us test Campus Circles!</span>
          </div>
        )}

        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
            Skip
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={submitting}
            className="rounded-xl text-xs font-bold bg-swiggy-orange text-white"
          >
            Submit Feedback
          </Button>
        </div>
      </form>
    </Modal>
  );
}
