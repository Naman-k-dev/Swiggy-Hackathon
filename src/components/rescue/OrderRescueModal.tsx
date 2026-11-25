'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LifeBuoy,
  AlertTriangle,
  Sparkles,
  IndianRupee,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { OrderRescueIssue, OrderRescueAlternative } from '@/types/order-rescue';
import { StudentProfile } from '@/types';
import { formatPaise } from '@/lib/utils';

interface OrderRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: OrderRescueIssue | null;
  currentUser: StudentProfile;
  isAdmin: boolean;
  restaurantName?: string;
  onAcceptReplacement: (issue: OrderRescueIssue, alternative: OrderRescueAlternative) => void;
  onDismiss: (issueId: string) => void;
  onTriggerDemoScenario?: (scenario: 'dietary_conflict' | 'budget_exceeded' | 'dish_unavailable') => void;
}

export function OrderRescueModal({
  isOpen,
  onClose,
  issue,
  currentUser,
  isAdmin,
  restaurantName = 'Selected Circle Restaurant',
  onAcceptReplacement,
  onDismiss,
  onTriggerDemoScenario,
}: OrderRescueModalProps) {
  const [aiNote, setAiNote] = useState<{
    text: string;
    provider: 'gemini' | 'deterministic';
    modelUsed?: string;
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (!isOpen || !issue || issue.suggested_alternatives.length === 0) {
      setAiNote(null);
      return;
    }

    const topAlt = issue.suggested_alternatives[0];
    let cancelled = false;
    setLoadingAi(true);

    fetch('/api/circlematch/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'order_rescue',
        issueType: issue.scenario,
        restaurantName,
        affectedStudentName: issue.user_name,
        dietaryPref: topAlt.is_veg ? 'VEG' : 'FLEXIBLE',
        originalDishName: issue.original_dish_name,
        replacementDishName: topAlt.dish_name,
        priceDiffRupees: Math.round(topAlt.price_diff_paise / 100),
        safetyNote: topAlt.reason || 'Verified compliant dish from the same restaurant.',
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.explanation) {
          setAiNote({
            text: data.explanation,
            provider: data.provider === 'gemini' ? 'gemini' : 'deterministic',
            modelUsed: data.modelUsed,
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingAi(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, issue, restaurantName]);

  if (!issue) return null;

  const isAffectedStudent = currentUser.id === issue.user_id;
  const canAct = isAffectedStudent || isAdmin;

  const getScenarioBadge = () => {
    switch (issue.scenario) {
      case 'dietary_conflict':
        return (
          <Badge variant="orange" size="sm" className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 font-bold">
            <ShieldAlert className="w-3 h-3 mr-1" />
            Dietary Conflict
          </Badge>
        );
      case 'budget_exceeded':
        return (
          <Badge variant="orange" size="sm" className="bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-bold">
            <IndianRupee className="w-3 h-3 mr-1" />
            Budget Exceeded
          </Badge>
        );
      case 'dish_unavailable':
        return (
          <Badge variant="orange" size="sm" className="bg-orange-50 dark:bg-orange-500/20 text-swiggy-dark dark:text-orange-300 border-orange-200 dark:border-orange-500/30 font-bold">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Item Unavailable (86&apos;d)
          </Badge>
        );
      case 'member_selection_change':
        return (
          <Badge variant="success" size="sm" className="font-bold">
            <Info className="w-3 h-3 mr-1" />
            Cart Rebalancing
          </Badge>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🛟 Order Rescue AI — Save the Group Order"
      description="Plans change. Your food order doesn't have to fall apart. Autonomous squad recovery."
      className="max-w-3xl"
    >
      <div className="space-y-6 pt-1 text-charcoal-800 dark:text-slate-200">
        {/* Issue Alert Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50/70 via-amber-50/50 to-orange-50/70 dark:from-red-950/40 dark:via-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/70 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-swiggy-orange text-white flex items-center justify-center font-black">
                <LifeBuoy className="w-4 h-4" />
              </span>
              <div>
                <p className="font-black text-charcoal-900 dark:text-white text-sm">Issue Intercepted</p>
                <p className="text-[11px] text-charcoal-500 dark:text-slate-400">
                  Affected Member: <strong className="text-charcoal-800 dark:text-white">{issue.user_name}</strong>
                  {issue.is_demo && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      DEMO TRIAL
                    </span>
                  )}
                </p>
              </div>
            </div>
            {getScenarioBadge()}
          </div>

          <p className="text-xs text-charcoal-700 dark:text-slate-200 leading-relaxed font-medium">
            {issue.reason}
          </p>

          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-charcoal-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-charcoal-500 dark:text-slate-400 text-[11px]">Original Selection:</span>
              <span className="font-bold text-charcoal-900 dark:text-white">{issue.original_dish_name}</span>
            </div>
            <span className="font-mono font-bold text-charcoal-700 dark:text-slate-200">
              {formatPaise(issue.original_price_paise)}
            </span>
          </div>

          {(loadingAi || aiNote) && (
            <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="flex items-center justify-between gap-2 font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-swiggy-orange" />
                  Order Rescue AI Reassurance
                </span>
                {aiNote && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {aiNote.provider === 'gemini' ? `Gemini (${aiNote.modelUsed || 'Flash'})` : 'Deterministic'}
                  </span>
                )}
              </div>
              <p className="leading-relaxed">
                {loadingAi ? 'Analyzing compliant same-restaurant alternatives...' : aiNote?.text}
              </p>
            </div>
          )}
        </div>

        {/* Alternatives Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-xs uppercase tracking-wider text-charcoal-600 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-swiggy-orange" />
              Recommended Alternatives (Same Restaurant)
            </h4>
            <span className="text-[11px] text-charcoal-400 dark:text-slate-500">
              {issue.suggested_alternatives.length} verified safe option{issue.suggested_alternatives.length === 1 ? '' : 's'}
            </span>
          </div>

          {issue.suggested_alternatives.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-charcoal-200 dark:border-slate-700 bg-[#FAFAF8] dark:bg-slate-800/60 space-y-2">
              <p className="text-3xl">🔍</p>
              <p className="font-bold text-sm text-charcoal-800 dark:text-white">No Direct Alternative Found</p>
              <p className="text-xs text-charcoal-500 dark:text-slate-400 max-w-md mx-auto">
                No compatible dish in the current restaurant matches both the dietary constraint and budget limit.
                Please review the full restaurant menu or consider switching restaurants via CircleVote.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {issue.suggested_alternatives.map((alt: OrderRescueAlternative) => {
                const isCheaper = alt.price_diff_paise < 0;
                const isSame = alt.price_diff_paise === 0;

                return (
                  <div
                    key={alt.dish_id}
                    className="p-3.5 rounded-2xl border border-charcoal-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500/60 transition-all bg-white dark:bg-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-charcoal-100 dark:bg-slate-700 relative overflow-hidden shrink-0">
                        {alt.image ? (
                          <Image
                            src={alt.image}
                            alt={alt.dish_name}
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            {alt.is_veg ? '🥗' : '🍗'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[8px] font-bold ${
                              alt.is_veg ? 'border-emerald-600 text-emerald-600' : 'border-red-600 text-red-600'
                            }`}
                          >
                            ●
                          </span>
                          <span className="font-extrabold text-charcoal-900 dark:text-white text-sm">
                            {alt.dish_name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {alt.match_score}% Match
                          </span>
                        </div>

                        <p className="text-[11px] text-charcoal-500 dark:text-slate-400 leading-snug">
                          {alt.reason}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-charcoal-400 dark:text-slate-500">
                          <span>
                            Remaining Budget: <strong className="text-charcoal-700 dark:text-slate-200">{formatPaise(alt.remaining_budget_paise)}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t dark:border-slate-700 sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="font-black text-sm text-charcoal-900 dark:text-white">
                          {formatPaise(alt.price_paise)}
                        </span>
                        <p
                          className={`text-[10px] font-bold ${
                            isCheaper ? 'text-emerald-600 dark:text-emerald-400' : isSame ? 'text-charcoal-500 dark:text-slate-400' : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {isCheaper
                            ? `-₹${Math.abs(Math.round(alt.price_diff_paise / 100))} (Saves Money)`
                            : isSame
                            ? 'Same Price'
                            : `+₹${Math.round(alt.price_diff_paise / 100)}`}
                        </p>
                      </div>

                      {canAct && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onAcceptReplacement(issue, alt)}
                          className="font-bold text-xs rounded-xl bg-swiggy-orange hover:bg-orange-600 shadow-sm"
                        >
                          Accept Replacement ✓
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Competition Judge Demo Triggers */}
        {onTriggerDemoScenario && (
          <div className="p-3.5 rounded-2xl bg-charcoal-50 dark:bg-slate-800/80 border border-charcoal-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-charcoal-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-swiggy-orange" />
                Competition Judge Demo Test Cases
              </span>
              <span className="text-[10px] text-charcoal-400 dark:text-slate-500">Interactive live scenarios</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => onTriggerDemoScenario('dietary_conflict')}
                className="px-2.5 py-1.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-charcoal-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-swiggy-dark dark:hover:text-orange-300 hover:border-orange-200 transition text-left"
              >
                1. Veg Mismatch 🥗
              </button>
              <button
                onClick={() => onTriggerDemoScenario('budget_exceeded')}
                className="px-2.5 py-1.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-charcoal-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-swiggy-dark dark:hover:text-orange-300 hover:border-orange-200 transition text-left"
              >
                2. Over Budget 💰
              </button>
              <button
                onClick={() => onTriggerDemoScenario('dish_unavailable')}
                className="px-2.5 py-1.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-charcoal-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-swiggy-dark dark:hover:text-orange-300 hover:border-orange-200 transition text-left"
              >
                3. Item 86&apos;d Out-of-Stock 🚫
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-charcoal-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-charcoal-400 dark:text-slate-500">
            {canAct
              ? 'Replacements update the shared cart atomically and preserve integer paise math.'
              : 'Waiting for affected student or circle admin to review.'}
          </span>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDismiss(issue.id)}
              className="rounded-xl text-xs"
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className="rounded-xl font-bold text-xs bg-charcoal-900 dark:bg-slate-700 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
