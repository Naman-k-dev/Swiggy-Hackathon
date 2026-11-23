'use client';

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/store/demo-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, AlertCircle } from 'lucide-react';
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
    joinCircle,
    currentUser,
    getCircleMembers,
  } = useApp();

  const circle = getCircleByInviteCode(inviteCode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!circle) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-charcoal-900">
          Circle Not Found
        </h1>
        <p className="text-xs text-charcoal-500">
          The invite code &quot;{inviteCode}&quot; does not match any active campus circles or may have expired.
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button size="md" variant="secondary">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const members = getCircleMembers(circle.id);
  const isAlreadyMember = members.some((m) => m.user_id === currentUser.id);

  const handleJoin = () => {
    const res = joinCircle(circle.id);
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
      <Card className="rounded-3xl shadow-xl border-charcoal-200/80 p-6 sm:p-8 space-y-6">
        {/* Circle Card Presentation */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-charcoal-50 border border-charcoal-100 flex items-center justify-center text-3xl mx-auto shadow-sm">
            {circle.emoji || '🍱'}
          </div>

          <div>
            <Badge variant="orange" size="sm" className="mb-1.5 font-bold">
              {circle.type} Circle
            </Badge>
            <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">
              {circle.name}
            </h1>
            <p className="text-xs text-charcoal-500 font-medium mt-1">
              {circle.college}
            </p>
          </div>

          <p className="text-xs text-charcoal-600 leading-relaxed bg-charcoal-50 p-3 rounded-2xl border border-charcoal-100">
            {circle.description || 'Join this circle to plan orders and split delivery fees together.'}
          </p>
        </div>

        {/* Member Preview */}
        <div className="p-3.5 rounded-2xl bg-white border border-charcoal-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              {members.slice(0, 4).map((m, idx) => (
                <div
                  key={idx}
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white overflow-hidden relative"
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
            <span className="text-xs font-bold text-charcoal-800">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </span>
          </div>

          <span className="text-xs text-swiggy-orange font-bold">
            Budget: ₹{circle.preferred_budget}/meal
          </span>
        </div>

        {/* Current Active Persona Banner */}
        <div className="border-t border-charcoal-100 pt-4 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">
            Joining as:
          </p>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-charcoal-50 border border-charcoal-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden relative border border-white">
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
                <p className="text-xs font-bold text-charcoal-900">{currentUser.full_name}</p>
                <p className="text-[10px] text-charcoal-500">{currentUser.dietary_pref}</p>
              </div>
            </div>

            <Link href="/auth" className="text-[11px] font-bold text-swiggy-orange hover:underline">
              Switch
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        {isAlreadyMember ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
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
          >
            <span>Join {circle.name}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </Card>
    </div>
  );
}
