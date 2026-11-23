'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Vote,
  Clock,
  Users,
  CheckCircle2,
  Trophy,
  Sparkles,
  IndianRupee,
  AlertTriangle,
} from 'lucide-react';
import { CircleVoteSession, CircleVoteOption } from '@/types/circlevote';
import { StudentProfile } from '@/types';
import { resolveVoteWinner } from '@/lib/circlevote/circlevote-engine';

interface CircleVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: CircleVoteSession | null;
  currentUser: StudentProfile;
  isAdmin: boolean;
  onCastVote: (optionId: string) => void;
  onFinalizeVote: (sessionId: string) => void;
  onSelectWinningRestaurant?: (restaurantId: string) => void;
}

export function CircleVoteModal({
  isOpen,
  onClose,
  session,
  currentUser,
  isAdmin,
  onCastVote,
  onFinalizeVote,
  onSelectWinningRestaurant,
}: CircleVoteModalProps) {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Cutoff countdown timer
  useEffect(() => {
    if (!session || !isOpen) return;

    const updateTimer = () => {
      const remainingMs = new Date(session.cutoff_time).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeftStr('00:00');
        setIsExpired(true);
      } else {
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeftStr(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
        setIsExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session, isOpen]);

  if (!session) return null;

  const userVotedOptionId = session.votes[currentUser.id]?.option_id;
  const isCompleted = session.status === 'completed';
  const totalVotes = Object.keys(session.votes).length;

  // Resolve winner preview
  const winnerPreview = session.options.length > 0 ? resolveVoteWinner(session) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🗳️ The Decision Room — CircleVote"
      description="Less debating. More eating. Group restaurant consensus powered by Swiggy Campus Circles."
      className="max-w-4xl"
    >
      <div className="space-y-6 pt-1 text-charcoal-800">
        {/* Top Header Information Bar */}
        <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-charcoal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-swiggy-light flex items-center justify-center text-swiggy-orange font-black">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-charcoal-900 text-sm">{session.title}</p>
              <div className="flex items-center gap-2 mt-0.5 text-charcoal-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-charcoal-400" />
                  {totalVotes} vote{totalVotes === 1 ? '' : 's'} recorded
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">1 active vote per student</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-swiggy-dark font-mono font-bold text-xs">
                <Clock className="w-3.5 h-3.5 text-swiggy-orange" />
                <span>{timeLeftStr} remaining</span>
              </div>
            ) : (
              <Badge variant="success" size="sm" className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Decision Finalized
              </Badge>
            )}
          </div>
        </div>

        {/* Winner Highlight Banner if completed */}
        {isCompleted && session.winning_restaurant_name && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Winning Restaurant Selected
                </span>
                <p className="text-base font-extrabold text-emerald-950">
                  {session.winning_restaurant_name}
                </p>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  {session.winner_reason}
                </p>
              </div>
            </div>

            {session.winning_restaurant_id && onSelectWinningRestaurant && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onSelectWinningRestaurant(session.winning_restaurant_id!);
                  onClose();
                }}
                className="font-bold shrink-0 rounded-xl"
              >
                View Menu & Order 🍽️
              </Button>
            )}
          </div>
        )}

        {/* 3 Candidate Restaurant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {session.options.map((option: CircleVoteOption) => {
            const hasVotedForThis = userVotedOptionId === option.id;
            const isLeading = winnerPreview?.winningOption.id === option.id;

            return (
              <div
                key={option.id}
                className={`rounded-2xl border transition-all flex flex-col overflow-hidden bg-white ${
                  hasVotedForThis
                    ? 'border-swiggy-orange ring-2 ring-orange-200 shadow-md'
                    : 'border-charcoal-200 hover:border-charcoal-300'
                }`}
              >
                {/* Restaurant Image Banner */}
                <div className="relative h-32 w-full bg-charcoal-100">
                  {option.restaurant_image ? (
                    <Image
                      src={option.restaurant_image}
                      alt={option.restaurant_name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🍲
                    </div>
                  )}

                  {/* Badges on image */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-white/90 text-charcoal-800 backdrop-blur-sm shadow-sm">
                      {option.source === 'swiggy_mcp_verified'
                        ? 'Swiggy MCP'
                        : option.source === 'circlematch_ai'
                        ? 'AI Match'
                        : 'Campus Catalog'}
                    </span>
                  </div>

                  {isLeading && !isCompleted && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                        <Trophy className="w-2.5 h-2.5" />
                        Leading
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-extrabold text-charcoal-900 text-sm leading-tight">
                        {option.restaurant_name}
                      </h4>
                    </div>

                    <p className="text-[11px] text-charcoal-500 mt-1 truncate">
                      {option.cuisine.join(' • ')}
                    </p>

                    {/* Compatibility & Pricing pills */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-charcoal-500 flex items-center gap-1 text-[11px]">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Group Fit
                        </span>
                        <span className="font-black text-emerald-600 font-mono text-[11px]">
                          {option.group_compatibility_score}% Match
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-charcoal-500 flex items-center gap-1 text-[11px]">
                          <IndianRupee className="w-3 h-3 text-charcoal-400" />
                          Range
                        </span>
                        <span className="font-semibold text-charcoal-800 text-[11px]">
                          {option.price_range_text}
                        </span>
                      </div>

                      {/* Dietary note */}
                      <div className="p-2 rounded-xl bg-charcoal-50 text-[10px] text-charcoal-600 leading-snug">
                        <span className="font-bold text-charcoal-700 block">Dietary & Budget:</span>
                        {option.dietary_summary}
                      </div>
                    </div>
                  </div>

                  {/* Vote Count & Action */}
                  <div className="pt-2 border-t border-charcoal-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-charcoal-600 text-[11px]">
                        Votes ({option.vote_count})
                      </span>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {option.voter_user_ids.slice(0, 3).map((uid) => (
                          <div
                            key={uid}
                            className="w-5 h-5 rounded-full bg-swiggy-orange text-white text-[9px] font-black flex items-center justify-center border border-white"
                          >
                            {uid.substring(uid.length - 2).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>

                    {!isCompleted ? (
                      <Button
                        variant={hasVotedForThis ? 'primary' : 'outline'}
                        size="sm"
                        disabled={isExpired}
                        onClick={() => onCastVote(option.id)}
                        className={`w-full font-bold text-xs rounded-xl ${
                          hasVotedForThis ? 'bg-swiggy-orange hover:bg-orange-600' : ''
                        }`}
                      >
                        {hasVotedForThis ? '✓ Your Vote Cast' : 'Vote for This'}
                      </Button>
                    ) : (
                      <div className="text-center py-1.5 text-xs font-bold text-charcoal-500">
                        {option.vote_count} Total Vote{option.vote_count === 1 ? '' : 's'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Tie-Break Transparency Note */}
        {!isCompleted && winnerPreview?.isTieBroken && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Tie-Break Transparency:</strong> {winnerPreview.reason}
            </span>
          </div>
        )}

        {/* Footer Admin Actions */}
        <div className="pt-2 border-t border-charcoal-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-charcoal-500">
            {isCompleted
              ? 'Voting completed. Selected restaurant locked for the group cart.'
              : isExpired
              ? 'Cutoff reached. Ready for admin to finalize decision.'
              : 'Students can switch their vote until voting closes.'}
          </span>

          <div className="flex items-center gap-2">
            {isAdmin && !isCompleted && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onFinalizeVote(session.id)}
                className="font-bold text-xs rounded-xl bg-swiggy-dark hover:bg-black"
              >
                Finalize Decision 🔒
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
              Close Room
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
