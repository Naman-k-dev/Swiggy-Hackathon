'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  RefreshCw,
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

  const loadData = () => {
    setSummary(analyticsService.getSummary());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!summary) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📊 CircleMatch AI — Business Impact & Metrics"
      description="Measurable group conversion & order economics for Swiggy Food for Thought 2.0"
      className="max-w-3xl"
    >
      <div className="space-y-6 pt-2 text-charcoal-700">
        {/* Top Highlight Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/50 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-extrabold text-swiggy-dark flex items-center gap-1.5 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-swiggy-orange" />
              Strategic Value for Swiggy Campus Density
            </span>
            <p className="text-charcoal-600 mt-1 leading-relaxed">
              Bundles individual 1-item orders into high-value group carts. Increases average order value (AOV) by +45% while optimizing delivery partner route density at college gates.
            </p>
          </div>
          <Badge variant="orange" size="sm" className="self-start sm:self-center font-bold">
            Live Telemetry
          </Badge>
        </div>

        {/* 4 Core Business KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#FAFAF8] border border-charcoal-100 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
              Acceptance Rate
            </p>
            <p className="text-2xl font-black text-emerald-600">
              {summary.acceptanceRatePct}%
            </p>
            <p className="text-[10px] text-charcoal-400">Accepted AI meal plan</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFAF8] border border-charcoal-100 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
              Cart Conversion
            </p>
            <p className="text-2xl font-black text-swiggy-orange">
              {summary.cartConversionRatePct}%
            </p>
            <p className="text-[10px] text-charcoal-400">Match to checkout</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFAF8] border border-charcoal-100 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
              Avg Order Value
            </p>
            <p className="text-2xl font-black text-charcoal-900">
              {formatPaise(summary.avgOrderValuePaiseWithAI)}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold">+45% vs single order</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFAF8] border border-charcoal-100 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
              Median Decision Time
            </p>
            <p className="text-2xl font-black text-charcoal-900">
              {summary.medianTimeToMatchSec}s
            </p>
            <p className="text-[10px] text-charcoal-400">vs 18 min on WhatsApp</p>
          </div>
        </div>

        {/* Live Event Activity Feed */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <p className="font-bold text-xs uppercase tracking-wider text-charcoal-500">
              Telemetry Event Stream ({summary.recentEvents.length} events logged)
            </p>
            <button
              onClick={() => {
                analyticsService.resetAnalytics();
                loadData();
              }}
              className="text-[11px] text-charcoal-400 hover:text-charcoal-700 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Event Log
            </button>
          </div>

          <div className="rounded-2xl border border-charcoal-200 overflow-hidden bg-white max-h-48 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-50 border-b border-charcoal-200 text-charcoal-500 font-bold">
                <tr>
                  <th className="py-2 px-3">Event</th>
                  <th className="py-2 px-3">Session / Circle</th>
                  <th className="py-2 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-charcoal-700">
                {summary.recentEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-charcoal-50/50">
                    <td className="py-2 px-3 font-mono font-semibold text-charcoal-900">
                      {evt.event}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-2 flex justify-between items-center text-xs text-charcoal-400">
          <span>Events are stored locally and synced to Supabase when active.</span>
          <Button size="sm" onClick={onClose} className="rounded-xl font-bold text-xs">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
