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
  } = useApp();

  const [pickupEditing, setPickupEditing] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(
    session.pickup_note || 'Hostel Main Gate / Reception'
  );

  const readyMemberIds = session.ready_member_ids || [];
  const isCurrentUserReady = readyMemberIds.includes(currentUser.id);
  const readyCount = readyMemberIds.length;
  const totalMembers = members.length;
  const readinessPercent = totalMembers > 0 ? Math.round((readyCount / totalMembers) * 100) : 0;
  const allReady = readyCount >= totalMembers && totalMembers > 0;

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
    <div className="rounded-3xl bg-white border border-charcoal-100 p-6 shadow-sm space-y-6">
      {/* 1. Header: Restaurant Info, Session Status & Cutoff */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-charcoal-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden relative bg-charcoal-100 flex-shrink-0 border border-charcoal-200/50 shadow-xs">
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">
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
            <h2 className="text-xl font-black text-charcoal-900 leading-tight mt-0.5">
              {session.restaurant_name}
            </h2>
          </div>
        </div>

        {/* Cutoff & Current Cart Total */}
        <div className="flex items-center gap-3 sm:text-right">
          <div className="bg-swiggy-light px-3.5 py-1.5 rounded-2xl border border-swiggy-soft">
            <p className="text-[10px] font-black uppercase tracking-wider text-swiggy-orange flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Cutoff Time
            </p>
            <p className="text-sm font-black text-charcoal-900 mt-0.5">{timeLeftStr}</p>
          </div>

          <div className="bg-charcoal-50 px-3.5 py-1.5 rounded-2xl border border-charcoal-100">
            <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-400">
              Cart Subtotal
            </p>
            <p className="text-sm font-black text-charcoal-900 mt-0.5">
              {formatPaise(subtotalPaise)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Feature A & D: Group Readiness Status & Member Progress */}
      <div className="bg-gradient-to-br from-charcoal-50 to-orange-50/30 rounded-2xl p-4 sm:p-5 border border-charcoal-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-charcoal-900">
                Squad Readiness: {readyCount} of {totalMembers} Ready ({readinessPercent}%)
              </span>
              {allReady && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  All Set! 🎉
                </span>
              )}
            </div>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
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
                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                  : 'bg-swiggy-orange hover:bg-swiggy-hover text-white'
              }`}
            >
              {isCurrentUserReady ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
        <div className="w-full bg-charcoal-200/60 rounded-full h-2.5 overflow-hidden">
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
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-white border-charcoal-200 text-charcoal-500'
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
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Clock className="w-3 h-3 text-amber-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Feature E: Campus Pickup Point Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-swiggy-orange flex-shrink-0" />
          <div>
            <span className="font-bold text-charcoal-900">Campus Pickup Spot: </span>
            <span className="text-charcoal-600 font-medium">{selectedPickup}</span>
            <span className="text-[10px] text-charcoal-400 block sm:inline sm:ml-2">
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
                  className="text-xs bg-white border border-charcoal-200 rounded-xl px-2.5 py-1 text-charcoal-800 font-medium"
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
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-charcoal-100">
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
              className="rounded-xl text-xs font-bold gap-1.5 border-charcoal-300"
              title="Toggle Cart Lock"
            >
              {session.status === 'open' ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-charcoal-600" />
                  <span>Lock Cart</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
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
    </div>
  );
}
