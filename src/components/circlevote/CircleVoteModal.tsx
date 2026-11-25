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
  Plus,
} from 'lucide-react';
import { CircleVoteSession, CircleVoteOption } from '@/types/circlevote';
import { Restaurant, StudentProfile } from '@/types';
import { resolveVoteWinner } from '@/lib/circlevote/circlevote-engine';

interface CircleVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: CircleVoteSession | null;
  currentUser: StudentProfile;
  isAdmin: boolean;
  restaurants?: Restaurant[];
  onStartVoteSession?: (candidateRestaurantIds: string[], cutoffMinutes: number, title: string) => void;
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
  restaurants = [],
  onStartVoteSession,
  onCastVote,
  onFinalizeVote,
  onSelectWinningRestaurant,
}: CircleVoteModalProps) {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [creatingNew, setCreatingNew] = useState<boolean>(false);

  // New vote session setup form state
  const [pollTitle, setPollTitle] = useState('Squad Meal Decision Room');
  const [cutoffMins, setCutoffMins] = useState(15);
  const [selectedRestIds, setSelectedRestIds] = useState<string[]>(() =>
    restaurants.slice(0, 3).map((r) => r.id)
  );

  // Live Gemini AI winner summary state
  const [aiExplanation, setAiExplanation] = useState<{
    text: string;
    provider: 'gemini' | 'deterministic';
    modelUsed?: string;
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (restaurants.length > 0 && selectedRestIds.length === 0) {
      setSelectedRestIds(restaurants.slice(0, 3).map((r) => r.id));
    }
  }, [restaurants, selectedRestIds.length]);

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

  // Fetch Gemini explanation when decision room completes
  useEffect(() => {
    if (!isOpen || !session || session.status !== 'completed' || !session.winning_restaurant_name) {
      setAiExplanation(null);
      return;
    }

    const winningOpt = session.options.find(
      (o) => o.id === session.winning_option_id || o.restaurant_id === session.winning_restaurant_id
    );
    if (!winningOpt) return;

    let cancelled = false;
    setLoadingAi(true);

    fetch('/api/circlematch/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'vote_decision',
        winningRestaurantName: winningOpt.restaurant_name,
        voteCount: winningOpt.vote_count,
        totalVotes: Object.keys(session.votes).length,
        groupCompatibilityScore: winningOpt.group_compatibility_score,
        subtotalRupees: Math.round(winningOpt.estimated_group_subtotal_paise / 100),
        dietaryNotes: winningOpt.dietary_summary,
        isTieBreak: Boolean(session.winner_reason?.toLowerCase().includes('tie-break')),
        tieBreakReason: session.winner_reason,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.explanation) {
          setAiExplanation({
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
  }, [isOpen, session]);

  const toggleRestaurantOption = (restId: string) => {
    setSelectedRestIds((prev) => {
      if (prev.includes(restId)) {
        return prev.filter((id) => id !== restId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), restId];
      }
      return [...prev, restId];
    });
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onStartVoteSession || selectedRestIds.length === 0) return;
    onStartVoteSession(selectedRestIds, cutoffMins, pollTitle.trim() || 'Squad Meal Decision Room');
    setCreatingNew(false);
  };

  // Empty state or "Create New Poll" view
  if (!session || creatingNew) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setCreatingNew(false);
          onClose();
        }}
        title="🗳️ The Decision Room — CircleVote"
        description="Less debating. More eating. Let your circle vote on up to 3 compatible restaurants."
        className="max-w-2xl"
      >
        {isAdmin && onStartVoteSession ? (
          <form onSubmit={handleCreatePoll} className="space-y-5 pt-1 text-charcoal-800 dark:text-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 dark:text-slate-400 mb-1">
                  Vote Title
                </label>
                <input
                  type="text"
                  value={pollTitle}
                  onChange={(e) => setPollTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-swiggy-orange"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 dark:text-slate-400 mb-1">
                  Timer (Mins)
                </label>
                <select
                  value={cutoffMins}
                  onChange={(e) => setCutoffMins(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-swiggy-orange"
                >
                  <option value={5}>5 mins (Quick)</option>
                  <option value={15}>15 mins</option>
                  <option value={30}>30 mins</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-charcoal-600 dark:text-slate-400">
                  Pick up to 3 Restaurants ({selectedRestIds.length}/3 selected)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {restaurants.map((r) => {
                  const chosen = selectedRestIds.includes(r.id);
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => toggleRestaurantOption(r.id)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center justify-between gap-2 ${
                        chosen
                          ? 'border-swiggy-orange bg-orange-50/70 dark:bg-orange-500/15 ring-1 ring-swiggy-orange'
                          : 'border-charcoal-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 hover:border-charcoal-300'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-extrabold text-charcoal-900 dark:text-white">
                          {r.name}
                        </p>
                        <p className="text-[10px] text-charcoal-500 dark:text-slate-400">
                          {r.cuisine.slice(0, 2).join(' • ')} • ₹{r.price_for_one}/one
                        </p>
                      </div>
                      {chosen && (
                        <CheckCircle2 className="w-4 h-4 text-swiggy-orange flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-charcoal-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCreatingNew(false);
                  if (!session) onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={selectedRestIds.length === 0}
                className="rounded-xl font-bold text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start Decision Room Poll</span>
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-10 text-center space-y-3">
            <Vote className="w-10 h-10 text-swiggy-orange mx-auto" />
            <h3 className="text-base font-extrabold text-charcoal-900 dark:text-white">
              No Active Decision Room Vote
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-slate-400 max-w-sm mx-auto">
              Ask your Circle Admin to start a Decision Room vote to pick the squad&apos;s next restaurant democratically.
            </p>
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
              Close Room
            </Button>
          </div>
        )}
      </Modal>
    );
  }

  const userVotedOptionId = session.votes[currentUser.id]?.option_id;
  const isCompleted = session.status === 'completed';
  const totalVotes = Object.keys(session.votes).length;
  const winnerPreview = session.options.length > 0 ? resolveVoteWinner(session) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🗳️ The Decision Room — CircleVote"
      description="Less debating. More eating. Group restaurant consensus powered by Swiggy Campus Circles."
      className="max-w-4xl"
    >
      <div className="space-y-6 pt-1 text-charcoal-800 dark:text-slate-200">
        {/* Top Header Information Bar */}
        <div className="p-4 rounded-2xl bg-[#FAFAF8] dark:bg-slate-800/80 border border-charcoal-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-swiggy-light dark:bg-orange-500/20 flex items-center justify-center text-swiggy-orange font-black">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-charcoal-900 dark:text-white text-sm">{session.title}</p>
              <div className="flex items-center gap-2 mt-0.5 text-charcoal-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-charcoal-400" />
                  {totalVotes} vote{totalVotes === 1 ? '' : 's'} recorded
                </span>
                <span>•</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">1 active vote per student</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 text-swiggy-dark dark:text-orange-300 font-mono font-bold text-xs">
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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 dark:from-emerald-950/60 dark:via-teal-950/50 dark:to-emerald-900/40 border border-emerald-300 dark:border-emerald-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Winning Restaurant Selected
                  </span>
                  {aiExplanation && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/80 dark:bg-slate-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {aiExplanation.provider === 'gemini'
                        ? `✨ Gemini (${aiExplanation.modelUsed || 'Flash'})`
                        : 'Deterministic Rule Summary'}
                    </span>
                  )}
                </div>
                <p className="text-base font-extrabold text-emerald-950 dark:text-white">
                  {session.winning_restaurant_name}
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  {loadingAi
                    ? 'Generating AI consensus summary...'
                    : aiExplanation?.text || session.winner_reason}
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
                className={`rounded-2xl border transition-all flex flex-col overflow-hidden bg-white dark:bg-slate-800/80 ${
                  hasVotedForThis
                    ? 'border-swiggy-orange ring-2 ring-orange-200 dark:ring-orange-500/40 shadow-md'
                    : 'border-charcoal-200 dark:border-slate-700 hover:border-charcoal-300 dark:hover:border-slate-600'
                }`}
              >
                {/* Restaurant Image Banner */}
                <div className="relative h-32 w-full bg-charcoal-100 dark:bg-slate-800">
                  {option.restaurant_image ? (
                    <Image
                      src={option.restaurant_image}
                      alt={option.restaurant_name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🍲
                    </div>
                  )}

                  {/* Badges on image */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-white/90 dark:bg-slate-900/90 text-charcoal-800 dark:text-slate-200 backdrop-blur-sm shadow-sm">
                      {option.source === 'swiggy_mcp_verified'
                        ? 'Swiggy MCP Schema'
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
                      <h4 className="font-extrabold text-charcoal-900 dark:text-white text-sm leading-tight">
                        {option.restaurant_name}
                      </h4>
                    </div>

                    <p className="text-[11px] text-charcoal-500 dark:text-slate-400 mt-1 truncate">
                      {option.cuisine.join(' • ')}
                    </p>

                    {/* Compatibility & Pricing pills */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-charcoal-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Group Fit
                        </span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                          {option.group_compatibility_score}% Match
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-charcoal-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                          <IndianRupee className="w-3 h-3 text-charcoal-400" />
                          Range
                        </span>
                        <span className="font-semibold text-charcoal-800 dark:text-slate-200 text-[11px]">
                          {option.price_range_text}
                        </span>
                      </div>

                      {/* Dietary note */}
                      <div className="p-2 rounded-xl bg-charcoal-50 dark:bg-slate-900/70 text-[10px] text-charcoal-600 dark:text-slate-300 leading-snug">
                        <span className="font-bold text-charcoal-700 dark:text-slate-200 block">Dietary & Budget:</span>
                        {option.dietary_summary}
                      </div>
                    </div>
                  </div>

                  {/* Vote Count & Action */}
                  <div className="pt-2 border-t border-charcoal-100 dark:border-slate-700 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-charcoal-600 dark:text-slate-300 text-[11px]">
                        Votes ({option.vote_count})
                      </span>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {option.voter_user_ids.slice(0, 3).map((uid) => (
                          <div
                            key={uid}
                            className="w-5 h-5 rounded-full bg-swiggy-orange text-white text-[9px] font-black flex items-center justify-center border border-white dark:border-slate-800"
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
                      <div className="text-center py-1.5 text-xs font-bold text-charcoal-500 dark:text-slate-400">
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
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Tie-Break Transparency:</strong> {winnerPreview.reason}
            </span>
          </div>
        )}

        {/* Footer Admin Actions */}
        <div className="pt-2 border-t border-charcoal-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-charcoal-500 dark:text-slate-400">
            {isCompleted
              ? 'Voting completed. Selected restaurant ready for the group cart.'
              : isExpired
              ? 'Cutoff reached. Ready for admin to finalize decision.'
              : 'Students can switch their vote until voting closes.'}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && isCompleted && onStartVoteSession && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreatingNew(true)}
                className="rounded-xl text-xs font-bold gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Poll</span>
              </Button>
            )}
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
