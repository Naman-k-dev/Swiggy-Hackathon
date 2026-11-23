'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/demo-context';
import { CircleType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Sparkles, ArrowRight, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CreateCirclePage() {
  const router = useRouter();
  const { createCircle, currentUser } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<CircleType>('Classmates');
  const [college, setCollege] = useState(currentUser.college);
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🍱');
  const [preferredBudget, setPreferredBudget] = useState(250);

  // Success state & invite modal
  const [createdCircle, setCreatedCircle] = useState<{ id: string; invite_code: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const emojiList = ['🍱', '🍕', '🍔', '🌯', '🍜', '☕', '🥗', '🍩', '🌮'];

  const circleTypes: CircleType[] = ['Classmates', 'Hostel', 'Friends', 'Club', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCircle = createCircle({
      name: name.trim(),
      type,
      college: college.trim() || currentUser.college,
      description: description.trim(),
      emoji,
      preferred_budget: preferredBudget,
    });

    // Fire celebration confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FC8019', '#00A343', '#FFD700', '#FF4500'],
    });

    setCreatedCircle({
      id: newCircle.id,
      invite_code: newCircle.invite_code,
      name: newCircle.name,
    });
  };

  const inviteLink = createdCircle
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${createdCircle.invite_code}`
    : '';

  const copyToClipboard = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-swiggy-light text-swiggy-dark text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-swiggy-orange" />
            Recurring Campus Community
          </span>
          <h1 className="text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
            Create a Campus Circle
          </h1>
          <p className="text-sm text-charcoal-500 dark:text-slate-400 max-w-md mx-auto">
            Permanent group for your classmates, hostel floor, or project team. Invite members once and order together anytime.
          </p>
        </div>

        <Card className="rounded-3xl shadow-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Emoji Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
                Circle Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {emojiList.map((e) => (
                  <button
                    type="button"
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center border transition ${
                      emoji === e
                        ? 'border-swiggy-orange bg-swiggy-light scale-105 shadow-sm'
                        : 'border-charcoal-200 dark:border-slate-700 hover:bg-charcoal-50 dark:bg-slate-800'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Circle Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
                Circle Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CSE Lunch Squad, Hostel 3 West Wing, Roboclub Foodies"
                className="w-full px-4 py-3 rounded-2xl border border-charcoal-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange font-medium"
                required
              />
            </div>

            {/* Circle Type */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
                Group Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {circleTypes.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition ${
                      type === t
                        ? 'border-swiggy-orange bg-swiggy-light text-swiggy-dark font-bold'
                        : 'border-charcoal-200 dark:border-slate-700 hover:bg-charcoal-50 dark:bg-slate-800 text-charcoal-700 dark:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* College Campus */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
                College Campus
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-charcoal-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange font-medium"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
                Description & Ordering Cadence
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Daily lunch after 12:30 PM lab, late-night hackathon fuel, exam week snacks..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-charcoal-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange font-medium"
              />
            </div>

            {/* Preferred Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300">
                  Target Meal Budget per Member
                </label>
                <span className="text-sm font-black text-swiggy-orange">
                  ₹{preferredBudget}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="500"
                step="25"
                value={preferredBudget}
                onChange={(e) => setPreferredBudget(Number(e.target.value))}
                className="w-full accent-swiggy-orange cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-charcoal-400 font-medium">
                <span>₹100 (Hostel Budget)</span>
                <span>₹250 (Standard)</span>
                <span>₹500 (Feast)</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-2xl font-bold text-sm shadow-md"
            >
              Create Circle & Generate Invite Link
            </Button>
          </form>
        </Card>
      </div>

      {/* Success Modal */}
      {createdCircle && (
        <Modal
          isOpen={true}
          onClose={() => router.push(`/circles/${createdCircle.id}`)}
          title="🎉 Circle Created Successfully!"
          description={`"${createdCircle.name}" is now live. Share the invite link with your campus mates so they can join.`}
        >
          <div className="space-y-5 pt-2">
            {/* Invite Code Box */}
            <div className="rounded-2xl bg-charcoal-50 dark:bg-slate-800 p-4 border border-charcoal-200 dark:border-slate-700 text-center space-y-1">
              <p className="text-xs font-semibold text-charcoal-500 dark:text-slate-400 uppercase tracking-wider">
                Circle 6-Letter Invite Code
              </p>
              <p className="text-3xl font-black font-mono tracking-widest text-swiggy-orange">
                {createdCircle.invite_code}
              </p>
            </div>

            {/* Shareable Link Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal-700 dark:text-slate-300">
                Shareable Invitation Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 dark:border-slate-700 bg-charcoal-50 dark:bg-slate-800 font-mono text-charcoal-700 dark:text-slate-300"
                />
                <Button
                  size="sm"
                  variant={copied ? 'secondary' : 'primary'}
                  onClick={copyToClipboard}
                  className="flex-shrink-0 text-xs font-bold"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full rounded-2xl font-bold text-sm shadow-md"
              onClick={() => router.push(`/circles/${createdCircle.id}`)}
            >
              <span>Enter Circle Now</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
