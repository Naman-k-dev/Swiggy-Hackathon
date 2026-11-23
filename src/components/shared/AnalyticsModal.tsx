'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  RefreshCw,
  Download,
  Filter,
} from 'lucide-react';
import { analyticsService } from '@/lib/analytics/analytics-service';
import { formatPaise } from '@/lib/utils';
import { BusinessAnalyticsSummary } from '@/types/circlematch';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsModal({ isOpen, onClose }: AnalyticsModalProps) {
  const [summary, setSummary] = useState<BusinessAnalyticsSummary | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'live'>('all');

  const loadData = () => {
    setSummary(analyticsService.getSummary());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!summary) return null;

  const displayEvents =
    filterMode === 'live'
      ? summary.recentEvents.filter((e) => e.source === 'live_campus_pilot')
      : summary.recentEvents;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📊 CircleMatch AI — Campus Pilot Telemetry & Hypotheses"
      description="Genuine recorded trial metrics and pilot research targets for Swiggy Food for Thought 2.0"
      className="max-w-3xl"
    >
      <div className="space-y-6 pt-2 text-charcoal-700">
        {/* Top Highlight Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/50 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-extrabold text-swiggy-dark flex items-center gap-1.5 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-swiggy-orange" />
              Campus Group Order Economics & Density Model
            </span>
            <p className="text-charcoal-600 mt-1 leading-relaxed">
              Aggregates individual student meals into unified group orders to reach the ₹400 group delivery fee waiver threshold and minimize delivery partner drop contention at hostel gates.
            </p>
          </div>
          <Badge variant="orange" size="sm" className="self-start sm:self-center font-bold">
            Pilot Telemetry & Research Targets
          </Badge>
        </div>

        {/* 4 Core Business KPIs with honest live vs target labels */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#FAFAF8] border border-charcoal-100 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
              AI Acceptance
            </p>
            <p className="text-2xl font-black text-emerald-600">
              {summary.liveAcceptanceRatePct !== null
                ? `${summary.liveAcceptanceRatePct}%`
                : `${summary.targetAcceptanceRatePct}% Target`}
            </p>
            <p className="text-[10px] text-charcoal-400">
              {summary.liveAcceptanceRatePct !== null
                ? 'Observed in live trials'
                : 'Pilot research consensus target'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFAF8] border border-charcoal-100 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
              Cart Completion
            </p>
            <p className="text-2xl font-black text-swiggy-orange">
              {summary.liveCartCompletionRatePct !== null
                ? `${summary.liveCartCompletionRatePct}%`
                : `${summary.targetCartCompletionRatePct}% Target`}
            </p>
            <p className="text-[10px] text-charcoal-400">
              {summary.liveCartCompletionRatePct !== null
                ? 'Live sessions finalized'
                : 'Group match to checkout target'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFAF8] border border-charcoal-100 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
              Group Order Value
            </p>
            <p className="text-2xl font-black text-charcoal-900">
              {summary.liveAvgOrderValuePaise
                ? formatPaise(summary.liveAvgOrderValuePaise)
                : `${formatPaise(summary.targetAOVPaise)} Target`}
            </p>
            <p className="text-[10px] text-charcoal-400">
              {summary.liveAvgOrderValuePaise
                ? 'Observed live cart subtotal'
                : 'Target pooled cart size'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFAF8] border border-charcoal-100 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
              Decision Time
            </p>
            <p className="text-2xl font-black text-charcoal-900">
              {summary.liveAvgDecisionTimeSec
                ? `${summary.liveAvgDecisionTimeSec}s`
                : `<${summary.targetDecisionTimeSec}s Target`}
            </p>
            <p className="text-[10px] text-charcoal-400">
              {summary.liveAvgDecisionTimeSec
                ? 'Live trial median'
                : 'Target vs unstructured chat'}
            </p>
          </div>
        </div>

        {/* Live Event Activity Feed */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="font-bold text-xs uppercase tracking-wider text-charcoal-500">
                Event Telemetry Log
              </p>
              <div className="flex items-center gap-1 bg-charcoal-100 p-0.5 rounded-lg text-[10px]">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    filterMode === 'all'
                      ? 'bg-white text-charcoal-900 shadow-sm'
                      : 'text-charcoal-500 hover:text-charcoal-800'
                  }`}
                >
                  All ({summary.recentEvents.length})
                </button>
                <button
                  onClick={() => setFilterMode('live')}
                  className={`px-2 py-0.5 rounded font-bold transition flex items-center gap-1 ${
                    filterMode === 'live'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-charcoal-500 hover:text-charcoal-800'
                  }`}
                >
                  <Filter className="w-2.5 h-2.5" />
                  Live Pilot Only (
                  {summary.recentEvents.filter((e) => e.source === 'live_campus_pilot').length})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => analyticsService.downloadCampusPilotCSV(true)}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition hover:scale-105"
                title="Export genuine recorded campus pilot events only"
              >
                <Download className="w-3 h-3" />
                Live CSV
              </button>
              <button
                onClick={() => analyticsService.downloadCampusPilotCSV(false)}
                className="text-[11px] text-swiggy-orange hover:text-orange-700 flex items-center gap-1 font-bold bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 transition hover:scale-105"
                title="Download full CSV dataset including baseline benchmarks"
              >
                <Download className="w-3 h-3" />
                All CSV
              </button>
              <button
                onClick={() => {
                  analyticsService.resetAnalytics();
                  loadData();
                }}
                className="text-[11px] text-charcoal-400 hover:text-charcoal-700 flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Log
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-charcoal-200 overflow-hidden bg-white max-h-48 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-50 border-b border-charcoal-200 text-charcoal-500 font-bold">
                <tr>
                  <th className="py-2 px-3">Event</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Circle</th>
                  <th className="py-2 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-charcoal-700">
                {displayEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-charcoal-400 italic">
                      No live campus pilot events recorded yet. Complete a group order to generate telemetry!
                    </td>
                  </tr>
                ) : (
                  displayEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-charcoal-50/50">
                      <td className="py-2 px-3 font-mono font-semibold text-charcoal-900">
                        {evt.event}
                      </td>
                      <td className="py-2 px-3">
                        {evt.source === 'live_campus_pilot' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            LIVE PILOT
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-charcoal-100 text-charcoal-600">
                            BASELINE
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-charcoal-500 text-[11px]">
                        {evt.circleId.replace('circle-', '')}
                      </td>
                      <td className="py-2 px-3 text-right text-charcoal-400 font-mono text-[10px]">
                        {new Date(evt.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-2 flex justify-between items-center text-xs text-charcoal-400">
          <span>All metrics are derived from genuine pilot sessions or research targets.</span>
          <Button size="sm" onClick={onClose} className="rounded-xl font-bold text-xs">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
