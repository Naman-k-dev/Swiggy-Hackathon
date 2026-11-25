'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { DemoOrder, StudentProfile, MemberBreakdown } from '@/types';
import { formatPaise } from '@/lib/utils';

interface SettlementStatus {
  settlement_status?: 'pending' | 'sent' | 'confirmed';
}

interface CirclePayTrackerProps {
  order: DemoOrder;
  currentUser: StudentProfile;
  isAdmin: boolean;
  onUpdateSettlementStatus: (userId: string, newStatus: 'pending' | 'sent' | 'confirmed') => void;
}

export function CirclePayTracker({
  order,
  currentUser,
  isAdmin,
  onUpdateSettlementStatus,
}: CirclePayTrackerProps) {
  const isOrganizer = isAdmin || order.placed_by_id === currentUser.id;

  // Calculate settlement progress
  const totalMembers = order.member_breakdowns.length;
  const settledMembers = order.member_breakdowns.filter(
    (mb) => (mb as SettlementStatus).settlement_status === 'confirmed'
  ).length;
  const sentMembers = order.member_breakdowns.filter(
    (mb) => (mb as SettlementStatus).settlement_status === 'sent'
  ).length;

  const progressPercent = Math.round((settledMembers / totalMembers) * 100);

  const totalOutstandingPaise = order.member_breakdowns
    .filter((mb) => (mb as SettlementStatus).settlement_status !== 'confirmed')
    .reduce((sum, mb) => sum + mb.share_paise, 0);

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-black">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200">
                CirclePay Contribution Tracker
              </span>
              <Badge variant="success" size="sm" className="font-bold">
                {progressPercent}% Settled
              </Badge>
            </div>
            <h3 className="text-lg font-black text-charcoal-900 dark:text-white mt-0.5">
              Group Settlement & Splits
            </h3>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-500">Total Outstanding</p>
          <p className="text-xl font-black text-swiggy-orange">{formatPaise(totalOutstandingPaise)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold text-charcoal-500">
          <span>Settlement Progress</span>
          <span>{settledMembers} of {totalMembers} members settled</span>
        </div>
        <div className="w-full h-2.5 bg-charcoal-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: `${Math.round((sentMembers / totalMembers) * 100)}%` }}
          />
        </div>
        <div className="flex gap-4 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-charcoal-500 font-medium">Confirmed</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-charcoal-500 font-medium">Marked as Sent</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-charcoal-200 dark:bg-slate-700" />
            <span className="text-charcoal-500 font-medium">Pending</span>
          </div>
        </div>
      </div>

      {/* Member Settlement List */}
      <div className="space-y-3">
        {order.member_breakdowns.map((mb) => {
          const isYou = mb.user_id === currentUser.id;
          const status = (mb as SettlementStatus).settlement_status || 'pending';

          return (
            <div
              key={mb.user_id}
              className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                status === 'confirmed'
                  ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10'
                  : status === 'sent'
                  ? 'bg-amber-50/30 border-amber-100 dark:bg-amber-950/10'
                  : 'bg-[#FAFAF8] dark:bg-slate-800/60 border-charcoal-100 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden relative border border-white shrink-0">
                  <img src={mb.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mb.user_id}`} alt={mb.user_name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-black text-sm text-charcoal-900 dark:text-white flex items-center gap-1.5">
                    {mb.user_name}
                    {isYou && <Badge variant="orange" size="sm" className="py-0">You</Badge>}
                  </p>
                  <p className="text-xs font-bold text-swiggy-orange">
                    {formatPaise(mb.share_paise)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {status === 'pending' && isYou && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onUpdateSettlementStatus(mb.user_id, 'sent')}
                    className="rounded-xl text-xs font-bold gap-1.5 bg-swiggy-orange hover:bg-swiggy-hover"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Mark as Sent
                  </Button>
                )}

                {status === 'sent' && isYou && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateSettlementStatus(mb.user_id, 'pending')}
                    className="rounded-xl text-xs font-bold text-charcoal-500"
                  >
                    Undo Mark as Sent
                  </Button>
                )}

                {status === 'sent' && isOrganizer && !isYou && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onUpdateSettlementStatus(mb.user_id, 'confirmed')}
                    className="rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Confirm Received
                  </Button>
                )}

                {status === 'confirmed' && isOrganizer && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onUpdateSettlementStatus(mb.user_id, 'sent')}
                    className="rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                  >
                    Undo Confirmation
                  </Button>
                )}

                {/* Status Badges */}
                {status === 'pending' && !isYou && (
                  <Badge variant="outline" className="text-charcoal-400 font-semibold">
                    <Clock className="w-3 h-3 mr-1" />
                    Waiting for Member
                  </Badge>
                )}

                {status === 'sent' && !isYou && !isOrganizer && (
                  <Badge variant="warning" className="font-bold">
                    <Send className="w-3 h-3 mr-1" />
                    Marked as Sent
                  </Badge>
                )}

                {status === 'confirmed' && (
                  <Badge variant="success" className="font-bold">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Settled
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimers & Info */}
      <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300">
          <AlertCircle className="w-4 h-4" />
          Internal Tracking Only
        </div>
        <p className="text-[11px] text-blue-700/80 dark:text-blue-400 leading-relaxed">
          CirclePay is a manual contribution tracking system. It does not initiate real UPI payments or bank transfers.
          Always verify actual funds in your banking app before confirming receipt as an organizer.
        </p>
      </div>

      {/* Feature stats for analytics */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-600">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>Avg. Settlement Time: 4.2 mins</span>
        </div>
      </div>
    </div>
  );
}
