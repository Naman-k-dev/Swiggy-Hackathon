'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Users, MessageSquare } from 'lucide-react';
import { pilotLabService } from '@/lib/pilot/pilot-lab-service';

interface ExperimentLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogged?: () => void;
}

export function ExperimentLoggerModal({ isOpen, onClose, onLogged }: ExperimentLoggerModalProps) {
  const [experimentType, setExperimentType] = useState<'whatsapp_baseline' | 'campus_circles'>('campus_circles');
  const [groupName, setGroupName] = useState('');
  const [participantCount, setParticipantCount] = useState<number>(4);
  const [choiceMins, setChoiceMins] = useState<number>(5);
  const [selectionMins, setSelectionMins] = useState<number>(6);
  const [coordinationIssues, setCoordinationIssues] = useState<number>(0);
  const [completedDraft, setCompletedDraft] = useState<boolean>(true);
  const [satisfactionRating, setSatisfactionRating] = useState<number>(5);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!groupName.trim()) {
      setErrorMsg('Please specify a group or cohort name.');
      return;
    }

    setSubmitting(true);
    try {
      pilotLabService.recordExperiment({
        experimentType,
        groupName: groupName.trim(),
        participantCount: Number(participantCount),
        restaurantChoiceDurationSec: Math.round(Number(choiceMins) * 60),
        foodSelectionDurationSec: Math.round(Number(selectionMins) * 60),
        coordinationIssuesCount: Number(coordinationIssues),
        completedDraftOrder: completedDraft,
        satisfactionRating: Number(satisfactionRating),
        notes: notes.trim() || undefined,
        recordedBy: 'manual_researcher',
        isSimulatedDemo: false,
      });

      // API bridge
      await fetch('/api/pilot/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentType,
          groupName: groupName.trim(),
          participantCount: Number(participantCount),
          restaurantChoiceDurationSec: Math.round(Number(choiceMins) * 60),
          foodSelectionDurationSec: Math.round(Number(selectionMins) * 60),
          coordinationIssuesCount: Number(coordinationIssues),
          completedDraftOrder: completedDraft,
          satisfactionRating: Number(satisfactionRating),
          notes: notes.trim() || undefined,
          recordedBy: 'manual_researcher',
          isSimulatedDemo: false,
        }),
      }).catch(() => {});

      setSuccessMsg(true);
      if (onLogged) onLogged();

      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1500);
    } catch {
      setErrorMsg('Failed to record ordering experiment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⏱️ Log Ordering Experiment (A/B Trial)"
      description="Record structured comparison data: WhatsApp baseline vs Campus Circles group order."
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs sm:text-sm">
        {/* Type Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
            Experiment Condition
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setExperimentType('whatsapp_baseline');
                setChoiceMins(22);
                setSelectionMins(15);
                setCoordinationIssues(4);
                setSatisfactionRating(2);
              }}
              className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition ${
                experimentType === 'whatsapp_baseline'
                  ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold'
                  : 'border-charcoal-200 dark:border-slate-700 text-charcoal-600 dark:text-slate-400'
              }`}
            >
              <span className="text-xs font-black flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                Condition A: WhatsApp Baseline
              </span>
              <span className="text-[10px] opacity-80">Students coordinate via standard chat thread & manual UPI</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setExperimentType('campus_circles');
                setChoiceMins(5);
                setSelectionMins(6);
                setCoordinationIssues(0);
                setSatisfactionRating(5);
              }}
              className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition ${
                experimentType === 'campus_circles'
                  ? 'border-swiggy-orange bg-swiggy-light/70 dark:bg-orange-950/40 text-swiggy-dark dark:text-orange-300 font-bold'
                  : 'border-charcoal-200 dark:border-slate-700 text-charcoal-600 dark:text-slate-400'
              }`}
            >
              <span className="text-xs font-black flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-swiggy-orange" />
                Condition B: Campus Circles
              </span>
              <span className="text-[10px] opacity-80">CircleVote Decision Room + CircleMatch AI group cart</span>
            </button>
          </div>
        </div>

        {/* Group Name & Student Count */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              Group / Trial Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Hostel Block B - 4 Students Lunch"
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              Students Count
            </label>
            <input
              type="number"
              min={2}
              max={25}
              value={participantCount}
              onChange={(e) => setParticipantCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs font-bold"
              required
            />
          </div>
        </div>

        {/* Timers */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              Time to Choose Restaurant (mins)
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={choiceMins}
              onChange={(e) => setChoiceMins(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs font-mono font-bold"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              Time to Finish Dishes (mins)
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={selectionMins}
              onChange={(e) => setSelectionMins(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs font-mono font-bold"
              required
            />
          </div>
        </div>

        {/* Friction & Outcome */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              Coordination Issues Count
            </label>
            <input
              type="number"
              min={0}
              value={coordinationIssues}
              onChange={(e) => setCoordinationIssues(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs font-bold"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              Draft Order Completed?
            </label>
            <select
              value={completedDraft ? 'yes' : 'no'}
              onChange={(e) => setCompletedDraft(e.target.value === 'yes')}
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs font-semibold"
            >
              <option value="yes">Yes, completed</option>
              <option value="no">No, abandoned</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
              Group Satisfaction (1-5)
            </label>
            <select
              value={satisfactionRating}
              onChange={(e) => setSatisfactionRating(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs font-bold"
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Good</option>
              <option value={3}>3 - Neutral</option>
              <option value={2}>2 - Frustrated</option>
              <option value={1}>1 - Chaotic</option>
            </select>
          </div>
        </div>

        {/* Research Notes */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
            Observation Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. 2 students had veg dietary requirements; CircleMatch AI eliminated debates."
            className="w-full px-3 py-2 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white text-xs"
          />
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Experiment trial observation recorded into research telemetry.</span>
          </div>
        )}

        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={submitting}
            className="rounded-xl text-xs font-bold bg-swiggy-orange text-white"
          >
            Save Experiment Run
          </Button>
        </div>
      </form>
    </Modal>
  );
}
