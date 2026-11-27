'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { StudentProfile } from '@/types';
import {
  OrderingFrequency,
  BudgetRange,
  TimeSpentChoosing,
} from '@/types/pilot-lab';
import { pilotLabService } from '@/lib/pilot/pilot-lab-service';

interface StudentFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile;
  onSubmitted?: () => void;
}

const COMMON_PROBLEMS = [
  'WhatsApp group coordination chaos',
  'Awkward UPI payment collection / delayed reimbursement',
  'Dietary conflicts (Strict Veg vs Non-Veg)',
  'Budget mismatches across friends',
  'Missed cutoff / someone ordered without waiting',
  'Hostel gate delivery pickup chaos',
  'Restaurant disagreements',
];

const FEATURES_LIST = [
  'CircleMatch AI (Group Dish Matching)',
  'Group Cart & Automated Paise Split',
  'CircleVote (Democratic Decision Room)',
  'Order Rescue AI (Dietary/Budget Swaps)',
  'Campus Pickup Pass (Hostel Gate PIN)',
  'CirclePay Tracker (Settlement Tracking)',
  'Recurring Meal Windows',
];

export function StudentFeedbackModal({
  isOpen,
  onClose,
  currentUser,
  onSubmitted,
}: StudentFeedbackModalProps) {
  // Consent
  const [consentGiven, setConsentGiven] = useState(true);

  // Form states (unfilled to avoid bias)
  const [orderingFrequency, setOrderingFrequency] = useState<OrderingFrequency>('multiple_times_week');
  const [friendsOrderingFrequency, setFriendsOrderingFrequency] = useState<OrderingFrequency>('multiple_times_week');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<BudgetRange>('150_250');
  const [timeSpent, setTimeSpent] = useState<TimeSpentChoosing>('15_30');
  const [splittingDifficulty, setSplittingDifficulty] = useState<number>(3);
  const [deliveryDifficulty, setDeliveryDifficulty] = useState<number>(3);
  const [willingnessToReuse, setWillingnessToReuse] = useState<number>(4);
  const [mostUseful, setMostUseful] = useState<string>(FEATURES_LIST[0]);
  const [leastUseful, setLeastUseful] = useState<string>('None');
  const [writtenSuggestions, setWrittenSuggestions] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleProblem = (problem: string) => {
    setSelectedProblems((prev) =>
      prev.includes(problem) ? prev.filter((p) => p !== problem) : [...prev, problem]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!consentGiven) {
      setErrorMsg('Informed consent is required to participate in research data collection.');
      return;
    }

    if (selectedProblems.length === 0) {
      setErrorMsg('Please select at least one coordination challenge or select the closest option.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Record consent
      pilotLabService.recordConsent({
        userId: currentUser.id,
        studentName: currentUser.full_name,
        consentGiven: true,
        studyCohort: `${currentUser.college || 'PW IOI Noida'} - Batch 2026`,
      });

      // 2. Submit survey
      pilotLabService.submitSurvey({
        userId: currentUser.id,
        studentName: currentUser.full_name,
        orderingFrequency,
        friendsOrderingFrequency,
        coordinationProblems: selectedProblems,
        typicalBudgetRange: budgetRange,
        timeSpentChoosingMins: timeSpent,
        splittingDifficultyScore: splittingDifficulty,
        deliveryCoordinationDifficulty: deliveryDifficulty,
        willingnessToReuse,
        mostUsefulFeature: mostUseful,
        leastUsefulFeature: leastUseful,
        writtenSuggestions: writtenSuggestions.trim() || undefined,
        isSimulatedDemo: false,
      });

      // Also POST to API route for server/Supabase bridge
      await fetch('/api/pilot/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          studentName: currentUser.full_name,
          orderingFrequency,
          friendsOrderingFrequency,
          coordinationProblems: selectedProblems,
          typicalBudgetRange: budgetRange,
          timeSpentChoosingMins: timeSpent,
          splittingDifficultyScore: splittingDifficulty,
          deliveryCoordinationDifficulty: deliveryDifficulty,
          willingnessToReuse,
          mostUsefulFeature: mostUseful,
          leastUsefulFeature: leastUseful,
          writtenSuggestions: writtenSuggestions.trim() || undefined,
          isSimulatedDemo: false,
        }),
      }).catch(() => {});

      setSuccessMsg(true);
      if (onSubmitted) onSubmitted();

      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 2000);
    } catch {
      setErrorMsg('Failed to record survey response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🔬 Campus Pilot Lab — Built With Students"
      description="Genuine student research on campus group food ordering friction vs. WhatsApp"
      className="max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2 text-xs sm:text-sm">
        {/* Research Consent Box */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Ethical Research Information & Consent</span>
          </div>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            Your participation is entirely voluntary for the Swiggy Food for Thought 2.0 evaluation. Data is anonymized, stored securely, and used only to evaluate campus group dining economics. You can withdraw your consent anytime.
          </p>
          <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs font-semibold text-charcoal-900 dark:text-white">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="rounded accent-swiggy-orange cursor-pointer"
            />
            <span>I agree to participate in this research trial ({currentUser.college || 'PW IOI Noida'})</span>
          </label>
        </div>

        {/* 1. Dining Frequencies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              How often do you order food on campus?
            </label>
            <select
              value={orderingFrequency}
              onChange={(e) => setOrderingFrequency(e.target.value as OrderingFrequency)}
              className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs font-medium"
            >
              <option value="daily">Daily (or almost daily)</option>
              <option value="multiple_times_week">2–4 times a week</option>
              <option value="once_a_week">About once a week</option>
              <option value="rarely">Rarely / Once a month</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              How often do you order with friends?
            </label>
            <select
              value={friendsOrderingFrequency}
              onChange={(e) => setFriendsOrderingFrequency(e.target.value as OrderingFrequency)}
              className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs font-medium"
            >
              <option value="daily">Almost every group order</option>
              <option value="multiple_times_week">2–3 times a week</option>
              <option value="once_a_week">Once a week / Weekends</option>
              <option value="rarely">Mostly solo orders</option>
            </select>
          </div>
        </div>

        {/* 2. Common Coordination Problems */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
            What friction do you experience ordering on WhatsApp? (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_PROBLEMS.map((prob) => {
              const selected = selectedProblems.includes(prob);
              return (
                <button
                  type="button"
                  key={prob}
                  onClick={() => toggleProblem(prob)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all text-left ${
                    selected
                      ? 'border-swiggy-orange bg-swiggy-light/80 dark:bg-orange-950/40 text-swiggy-dark dark:text-orange-300 font-bold shadow-sm'
                      : 'border-charcoal-200 dark:border-slate-700 text-charcoal-600 dark:text-slate-300 hover:bg-charcoal-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {selected ? '✓ ' : '+ '}
                  {prob}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Budget & Time Spent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              Typical Personal Meal Budget
            </label>
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value as BudgetRange)}
              className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs font-medium"
            >
              <option value="under_150">Budget: Under ₹150</option>
              <option value="150_250">Standard: ₹150 – ₹250</option>
              <option value="250_400">Comfort: ₹250 – ₹400</option>
              <option value="above_400">Feast: Above ₹400</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              Time spent deciding what to order
            </label>
            <select
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value as TimeSpentChoosing)}
              className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs font-medium"
            >
              <option value="under_5">&lt; 5 minutes</option>
              <option value="5_15">5 – 15 minutes</option>
              <option value="15_30">15 – 30 minutes</option>
              <option value="above_30">&gt; 30 minutes (Lots of debate)</option>
            </select>
          </div>
        </div>

        {/* 4. Ratings: Splitting, Delivery, Reuse */}
        <div className="p-4 rounded-2xl bg-charcoal-50 dark:bg-slate-900 border border-charcoal-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-700 dark:text-slate-300">
              Difficulty splitting costs on WhatsApp:
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setSplittingDifficulty(num)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold border transition ${
                    splittingDifficulty === num
                      ? 'border-swiggy-orange bg-swiggy-orange text-white'
                      : 'border-charcoal-200 dark:border-slate-700 text-charcoal-600 dark:text-slate-400 hover:bg-charcoal-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {num}
                </button>
              ))}
              <span className="text-[10px] text-charcoal-400 ml-1">
                ({splittingDifficulty === 1 ? 'Trivial' : splittingDifficulty === 5 ? 'Very Painful' : 'Moderate'})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-700 dark:text-slate-300">
              Hostel gate pickup coordination difficulty:
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setDeliveryDifficulty(num)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold border transition ${
                    deliveryDifficulty === num
                      ? 'border-swiggy-orange bg-swiggy-orange text-white'
                      : 'border-charcoal-200 dark:border-slate-700 text-charcoal-600 dark:text-slate-400 hover:bg-charcoal-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {num}
                </button>
              ))}
              <span className="text-[10px] text-charcoal-400 ml-1">
                ({deliveryDifficulty === 1 ? 'Easy' : deliveryDifficulty === 5 ? 'Chaotic' : 'Average'})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-700 dark:text-slate-300">
              Willingness to use Campus Circles again:
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setWillingnessToReuse(num)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold border transition ${
                    willingnessToReuse === num
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-charcoal-200 dark:border-slate-700 text-charcoal-600 dark:text-slate-400 hover:bg-charcoal-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {num}
                </button>
              ))}
              <span className="text-[10px] text-charcoal-400 ml-1">
                ({willingnessToReuse >= 4 ? 'High' : 'Low'})
              </span>
            </div>
          </div>
        </div>

        {/* 5. Most & Least Useful Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              Most useful feature in your experience:
            </label>
            <select
              value={mostUseful}
              onChange={(e) => setMostUseful(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs font-medium"
            >
              {FEATURES_LIST.map((feat) => (
                <option key={feat} value={feat}>
                  {feat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              Least useful / needs simplification:
            </label>
            <select
              value={leastUseful}
              onChange={(e) => setLeastUseful(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs font-medium"
            >
              <option value="None">None — all are helpful</option>
              {FEATURES_LIST.map((feat) => (
                <option key={feat} value={feat}>
                  {feat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 6. Optional Written Suggestions */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              Any feedback or suggestions for the team? (Optional)
            </label>
            <span className="text-[10px] text-charcoal-400">Skippable</span>
          </div>
          <textarea
            value={writtenSuggestions}
            onChange={(e) => setWrittenSuggestions(e.target.value)}
            rows={2}
            placeholder="e.g. Can we save regular late night snack combos?"
            className="w-full px-3 py-2 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs focus:ring-2 focus:ring-swiggy-orange focus:outline-none"
          />
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Thank you! Your feedback is recorded in the Campus Pilot Lab.</span>
          </div>
        )}

        <div className="pt-2 flex justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={submitting}
            className="rounded-xl text-xs font-bold bg-swiggy-orange text-white"
          >
            Submit Research Survey
          </Button>
        </div>
      </form>
    </Modal>
  );
}
