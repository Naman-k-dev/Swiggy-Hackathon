'use client';

import React, { useState } from 'react';
import { OrderingSession, StudentProfile } from '@/types';
import { useApp } from '@/lib/store/demo-context';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Lock,
  Unlock,
  Plus,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { formatPaise } from '@/lib/utils';
import { MealWindowSchedulerModal } from '@/components/circles/MealWindowSchedulerModal';
import { Calendar, Radio } from 'lucide-react';

interface OrderReadinessDashboardProps {
  session: OrderingSession;
  circleId: string;
  members: Array<{ user_id: string; profile: StudentProfile }>;
  isAdmin: boolean;
  timeLeftStr: string;
  subtotalPaise: number;
  onOpenFinalizeModal: () => void;
}

export function OrderReadinessDashboard({
  session,
  circleId,
  members,
  isAdmin,
  timeLeftStr,
  subtotalPaise,
  onOpenFinalizeModal,
}: OrderReadinessDashboardProps) {
  const {
    currentUser,
    toggleMemberReady,
    lockSession,
    reopenSession,
    updatePickupNote,
    updateParticipation,
    isSupabaseActive,
    supabaseSchemaStatus,
    isDemoMode,
  } = useApp();

  const [pickupEditing, setPickupEditing] = useState(false);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(
    session.pickup_note || 'Hostel Main Gate / Reception'
  );

  const readyMemberIds = session.ready_member_ids || [];
  const isCurrentUserReady = readyMemberIds.includes(currentUser.id);
  const readyCount = readyMemberIds.length;
  const totalMembers = members.length;
  const readinessPercent = totalMembers > 0 ? Math.round((readyCount / totalMembers) * 100) : 0;
  const allReady = readyCount >= totalMembers && totalMembers > 0;

  // Participation counts
  const participations = session.participations || {};
  const myParticipation = participations[currentUser.id]?.status || 'undecided';
  const joiningCount = Object.values(participations).filter((p) => p.status === 'joining').length;
  const skippedCount = Object.values(participations).filter((p) => p.status === 'skipped').length;

  const handleToggleMyReady = () => {
    toggleMemberReady(session.id, currentUser.id);
  };

  const handleSavePickupNote = (note: string) => {
    setSelectedPickup(note);
    updatePickupNote(session.id, note);
    setPickupEditing(false);
  };

  const handleAdminLock = () => {
    if (session.status === 'open') {
      const unreadyMembers = members.filter((m) => !readyMemberIds.includes(m.user_id));
      if (unreadyMembers.length > 0) {
        const names = unreadyMembers.map((m) => m.profile.full_name.split(' ')[0]).join(', ');
        const confirmLock = confirm(
          `Notice: ${unreadyMembers.length} member(s) (${names}) have not marked themselves as ready yet.\n\nLock the group cart anyway?`
        );
        if (!confirmLock) return;
      }
      lockSession(session.id);
    } else {
      reopenSession(session.id);
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* 0. Top Sync & Recurring Window Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pb-3 border-b border-charcoal-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            {isSupabaseActive && supabaseSchemaStatus === 'ready' && !isDemoMode
              ? 'Cloud Sync: Active (Supabase)'
              : isSupabaseActive && supabaseSchemaStatus === 'migrations_missing' && !isDemoMode
              ? 'Auth Active • Local Sync (DB Migrations Pending)'
              : 'Realtime: Multi-Tab Broadcast Active'}
          </span>
          {session.session_name && (
            <span className="text-charcoal-700 dark:text-slate-200 font-bold bg-orange-50 dark:bg-orange-500/20 border border-orange-200/60 dark:border-orange-500/30 px-2.5 py-0.5 rounded-full">
              🗓️ {session.session_name} ({session.recurrence || 'Weekdays'})
            </span>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={() => setSchedulerOpen(true)}
            className="text-swiggy-orange font-bold hover:underline flex items-center gap-1 text-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Meal Window</span>
          </button>
        )}
      </div>

      {/* 1. Header: Restaurant Info, Session Status & Cutoff */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-charcoal-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden relative bg-charcoal-100 dark:bg-slate-800 flex-shrink-0 border border-charcoal-200/50 dark:border-slate-700 shadow-xs">
            {session.restaurant_image ? (
              <Image
                src={session.restaurant_image}
                alt={session.restaurant_name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                🍱
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 dark:text-slate-400">
                Active Order Session
              </span>
              {session.status === 'open' ? (
                <Badge variant="success" size="sm" className="font-bold gap-1 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Order Open
                </Badge>
              ) : (
                <Badge variant="warning" size="sm" className="font-bold gap-1 text-[10px]">
                  <Lock className="w-3 h-3" />
                  Cart Locked
                </Badge>
              )}
            </div>
            <h2 className="text-xl font-black text-charcoal-900 dark:text-white leading-tight mt-0.5">
              {session.restaurant_name}
            </h2>
          </div>
        </div>

        {/* Cutoff & Current Cart Total */}
        <div className="flex items-center gap-3 sm:text-right">
          <div className="bg-swiggy-light dark:bg-orange-500/20 px-3.5 py-1.5 rounded-2xl border border-swiggy-soft dark:border-orange-500/30">
            <p className="text-[10px] font-black uppercase tracking-wider text-swiggy-orange flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Cutoff Time
            </p>
            <p className="text-sm font-black text-charcoal-900 dark:text-white mt-0.5">{timeLeftStr}</p>
          </div>

          <div className="bg-charcoal-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-2xl border border-charcoal-100 dark:border-slate-700">
            <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-400 dark:text-slate-400">
              Cart Subtotal
            </p>
            <p className="text-sm font-black text-charcoal-900 dark:text-white mt-0.5">
              {formatPaise(subtotalPaise)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Feature A & D: Group Readiness Status & Member Progress */}
      <div className="bg-gradient-to-br from-charcoal-50 to-orange-50/30 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl p-4 sm:p-5 border border-charcoal-100 dark:border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-charcoal-900 dark:text-white">
                Squad Readiness: {readyCount} of {totalMembers} Ready ({readinessPercent}%)
              </span>
              {allReady && (
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  All Set! 🎉
                </span>
              )}
            </div>
            <p className="text-[11px] text-charcoal-500 dark:text-slate-400 mt-0.5">
              {allReady
                ? 'Everyone has confirmed their items! Admin can safely finalize the order.'
                : 'Members can toggle their status when finished picking food.'}
            </p>
          </div>

          {/* Member 1-Click Ready Toggle */}
          {session.status === 'open' && (
            <Button
              size="sm"
              onClick={handleToggleMyReady}
              variant={isCurrentUserReady ? 'secondary' : 'primary'}
              className={`rounded-xl text-xs font-black shadow-xs gap-1.5 transition-all ${
                isCurrentUserReady
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                  : 'bg-swiggy-orange hover:bg-swiggy-hover text-white'
              }`}
            >
              {isCurrentUserReady ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>I&apos;m Ready (Click to edit)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Mark Myself as Ready</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-charcoal-200/60 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              readinessPercent === 100
                ? 'bg-emerald-500'
                : readinessPercent > 50
                ? 'bg-swiggy-orange'
                : 'bg-amber-400'
            }`}
            style={{ width: `${Math.max(readinessPercent, 5)}%` }}
          />
        </div>

        {/* Member Avatar Ready Indicators */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {members.map((m) => {
            const isReady = readyMemberIds.includes(m.user_id);
            const isSelf = m.user_id === currentUser.id;

            return (
              <div
                key={m.user_id}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                  isReady
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-900 border-charcoal-200 dark:border-slate-700 text-charcoal-500 dark:text-slate-300'
                }`}
                title={isReady ? `${m.profile.full_name} is Ready` : `${m.profile.full_name} is still selecting`}
              >
                <div className="w-4 h-4 rounded-full overflow-hidden relative">
                  <Image
                    src={m.profile.avatar_url || ''}
                    alt={m.profile.full_name}
                    width={16}
                    height={16}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span>
                  {m.profile.full_name.split(' ')[0]} {isSelf && '(You)'}
                </span>
                {isReady ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="w-3 h-3 text-amber-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* Participation Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-charcoal-200/50 dark:border-slate-700 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-charcoal-500 dark:text-slate-400 font-medium">Squad Attendance:</span>
            <span className="font-bold text-charcoal-900 dark:text-white bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-charcoal-100 dark:border-slate-700">
              {joiningCount} Joining • {skippedCount} Skipped
            </span>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <span className="text-[11px] text-charcoal-400 dark:text-slate-400 mr-1">Your status:</span>
            <button
              onClick={() => updateParticipation(session.id, currentUser.id, 'joining')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                myParticipation === 'joining'
                  ? 'bg-swiggy-orange text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-charcoal-200 dark:border-slate-700 text-charcoal-600 dark:text-slate-300 hover:bg-charcoal-50 dark:hover:bg-slate-800'
              }`}
            >
              🍱 I&apos;m In
            </button>
            <button
              onClick={() => updateParticipation(session.id, currentUser.id, 'skipped')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                myParticipation === 'skipped'
                  ? 'bg-charcoal-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-charcoal-200 dark:border-slate-700 text-charcoal-600 dark:text-slate-300 hover:bg-charcoal-50 dark:hover:bg-slate-800'
              }`}
            >
              ✋ Skip
            </button>
          </div>
        </div>
      </div>

      {/* 3. Feature E: Campus Pickup Point Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-swiggy-orange flex-shrink-0" />
          <div>
            <span className="font-bold text-charcoal-900 dark:text-white">Campus Pickup Spot: </span>
            <span className="text-charcoal-600 dark:text-slate-300 font-medium">{selectedPickup}</span>
            <span className="text-[10px] text-charcoal-400 dark:text-slate-500 block sm:inline sm:ml-2">
              (Peer coordination reference)
            </span>
          </div>
        </div>

        {isAdmin && session.status === 'open' && (
          <div>
            {pickupEditing ? (
              <div className="flex items-center gap-2">
                <select
                  value={selectedPickup}
                  onChange={(e) => handleSavePickupNote(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-800 border border-charcoal-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-charcoal-800 dark:text-white font-medium"
                >
                  <option value="Hostel Main Gate / Reception">Hostel Main Gate / Reception</option>
                  <option value="Campus Main Gate Security Point">Campus Main Gate Security Point</option>
                  <option value="Academic Block C Quadrangle">Academic Block C Quadrangle</option>
                  <option value="Central Library Portico">Central Library Portico</option>
                  <option value="Dining Hall Common Room">Dining Hall Common Room</option>
                </select>
                <button
                  onClick={() => setPickupEditing(false)}
                  className="text-[11px] text-charcoal-400 hover:underline"
                >
                  Done
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPickupEditing(true)}
                className="text-swiggy-orange font-bold text-xs hover:underline"
              >
                Change Pickup Spot
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-charcoal-100 dark:border-slate-800">
        <Link href={`/circles/${circleId}/restaurants/${session.restaurant_id}`}>
          <Button
            size="sm"
            variant={session.status === 'open' ? 'primary' : 'outline'}
            disabled={session.status !== 'open'}
            className="rounded-xl text-xs font-bold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Browse Restaurant Menu</span>
          </Button>
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAdminLock}
              className="rounded-xl text-xs font-bold gap-1.5 border-charcoal-300 dark:border-slate-700"
              title="Toggle Cart Lock"
            >
              {session.status === 'open' ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-charcoal-600 dark:text-slate-300" />
                  <span>Lock Cart</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Reopen Cart</span>
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              disabled={subtotalPaise === 0}
              onClick={onOpenFinalizeModal}
              className="rounded-xl text-xs font-black shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Finalize & Place Order</span>
            </Button>
          </div>
        )}
      </div>

      <MealWindowSchedulerModal
        isOpen={schedulerOpen}
        onClose={() => setSchedulerOpen(false)}
        circleId={circleId}
      />
    </div>
  );
}
