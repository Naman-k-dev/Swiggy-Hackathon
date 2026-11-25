'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/store/demo-context';
import { Circle } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, AlertCircle, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface JoinPageProps {
  params: Promise<{
    inviteCode: string;
  }>;
}

export default function JoinCirclePage({ params }: JoinPageProps) {
  const resolvedParams = use(params);
  const inviteCode = resolvedParams.inviteCode;

  const router = useRouter();
  const {
    getCircleByInviteCode,
    resolveInviteCode,
    joinCircle,
    currentUser,
    isAuthenticated,
    getCircleMembers,
    importDemoData,
  } = useApp();

  const [resolvedCircle, setResolvedCircle] = useState<Circle | undefined>(() =>
    getCircleByInviteCode(inviteCode)
  );
  const [lookingUp, setLookingUp] = useState(!resolvedCircle);
  const [joining, setJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    resolveInviteCode(inviteCode).then((found) => {
      if (active) {
        setResolvedCircle(found);
        setLookingUp(false);
      }
    });
    return () => {
      active = false;
    };
  }, [inviteCode, resolveInviteCode]);

  const circle = resolvedCircle || getCircleByInviteCode(inviteCode);

  if (lookingUp) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-swiggy-orange border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-semibold text-charcoal-500 dark:text-slate-400">
          Verifying circle invite code &quot;{inviteCode}&quot;...
        </p>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-white">
          Circle Not Found
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-slate-400">
          The invite code &quot;{inviteCode}&quot; does not match any active campus circles or requires the Demo Sandbox for sample codes like <code className="font-mono font-bold text-swiggy-orange">CAMPUS24</code>.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-2">
          <Link href="/dashboard">
            <Button size="md" variant="secondary">
              Back to Dashboard
            </Button>
          </Link>
          {process.env.NEXT_PUBLIC_ENABLE_DEMO_PRESETS !== 'false' && (
            <Button
              size="md"
              variant="outline"
              onClick={() => {
                importDemoData();
              }}
            >
              Load Sample Demo Circle
            </Button>
          )}
        </div>
      </div>
    );
  }

  const members = getCircleMembers(circle.id);
  const isAlreadyMember = isAuthenticated && members.some((m) => m.user_id === currentUser.id);

  const handleJoin = async () => {
    setJoining(true);
    setErrorMsg(null);
    const res = await joinCircle(circle.id, inviteCode);
    setJoining(false);
    if (res.success) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
      router.push(`/circles/${circle.id}`);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card className="rounded-3xl shadow-xl border-charcoal-200 dark:border-slate-700/80 p-6 sm:p-8 space-y-6">
        {/* Circle Card Presentation */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-charcoal-50 dark:bg-slate-800 border border-charcoal-100 dark:border-slate-800 flex items-center justify-center text-3xl mx-auto shadow-sm">
            {circle.emoji || '🍱'}
          </div>

          <div>
            <Badge variant="orange" size="sm" className="mb-1.5 font-bold">
              {circle.type} Circle
            </Badge>
            <h1 className="text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">
              {circle.name}
            </h1>
            <p className="text-xs text-charcoal-500 dark:text-slate-400 font-medium mt-1">
              {circle.college}
            </p>
          </div>

          <p className="text-xs text-charcoal-600 dark:text-slate-400 leading-relaxed bg-charcoal-50 dark:bg-slate-800 p-3 rounded-2xl border border-charcoal-100 dark:border-slate-800">
            {circle.description || 'Join this circle to plan orders and split delivery fees together.'}
          </p>
        </div>

        {/* Member Preview */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              {members.slice(0, 4).map((m, idx) => (
                <div
                  key={idx}
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 overflow-hidden relative"
                >
                  <Image
                    src={m.profile.avatar_url || ''}
                    alt={m.profile.full_name}
                    width={28}
                    height={28}
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-charcoal-800 dark:text-slate-200">
              {members.length || circle.member_count || 1}{' '}
              {(members.length || circle.member_count || 1) === 1 ? 'member' : 'members'}
            </span>
          </div>

          <span className="text-xs text-swiggy-orange font-bold">
            Budget: ₹{circle.preferred_budget}/meal
          </span>
        </div>

        {/* Auth Check */}
        {!isAuthenticated ? (
          <div className="border-t border-charcoal-100 dark:border-slate-800 pt-4 space-y-3">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>Please sign in or register your student account to join this circle.</span>
            </div>
            <Link href="/auth" className="block">
              <Button size="lg" className="w-full rounded-2xl font-bold shadow-md gap-2">
                <span>Sign In to Join {circle.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="border-t border-charcoal-100 dark:border-slate-800 pt-4 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">
                Joining as:
              </p>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-charcoal-50 dark:bg-slate-800 border border-charcoal-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden relative border border-white dark:border-slate-700">
                    <Image
                      src={currentUser.avatar_url || ''}
                      alt={currentUser.full_name}
                      width={32}
                      height={32}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-charcoal-900 dark:text-white">{currentUser.full_name}</p>
                    <p className="text-[10px] text-charcoal-500 dark:text-slate-400">{currentUser.dietary_pref}</p>
                  </div>
                </div>

                <Link href="/auth" className="text-[11px] font-bold text-swiggy-orange hover:underline">
                  Switch
                </Link>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {isAlreadyMember ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                  <Check className="w-4 h-4" />
                  <span>You are already a member of this Circle!</span>
                </div>
                <Link href={`/circles/${circle.id}`} className="block">
                  <Button size="lg" className="w-full rounded-2xl font-bold shadow-md">
                    Enter Circle
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full rounded-2xl font-bold shadow-md gap-2"
                onClick={handleJoin}
                isLoading={joining}
              >
                <span>Join {circle.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
