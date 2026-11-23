'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/demo-context';
import { X, UserPlus, Sparkles } from 'lucide-react';

interface AddProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProfileModal({ isOpen, onClose }: AddProfileModalProps) {
  const { addProfile } = useApp();

  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('IIT Delhi (Hostel 16)');
  const [dietary, setDietary] = useState<'veg' | 'non-veg' | 'flexible'>('flexible');
  const [budget, setBudget] = useState(250);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`;

    addProfile({
      full_name: fullName.trim(),
      college: college.trim(),
      avatar_url: avatarUrl,
      dietary_preference: dietary,
      preferred_budget: Number(budget),
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('scc_has_custom_profile_v1', 'true');
      } catch {}
    }

    setFullName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-orange-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-charcoal-400 hover:text-charcoal-700 dark:hover:text-white p-1 rounded-full bg-charcoal-50 dark:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-swiggy-orange">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-charcoal-900 dark:text-white">Add Custom Profile</h2>
            <p className="text-xs text-charcoal-500 dark:text-slate-400">Create & apply a profile instantly in real-time</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-charcoal-50/50 dark:bg-slate-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              College & Hostel / Dept
            </label>
            <input
              type="text"
              required
              placeholder="e.g. IIT Delhi - Kumaon Hostel"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-charcoal-50/50 dark:bg-slate-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Dietary Preference
              </label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value as 'veg' | 'non-veg' | 'flexible')}
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-charcoal-50/50 dark:bg-slate-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange"
              >
                <option value="flexible">Flexible 🍕</option>
                <option value="veg">Pure Veg 🌱</option>
                <option value="non-veg">Non-Veg 🍗</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Target Budget (₹)
              </label>
              <input
                type="number"
                min="50"
                max="2000"
                step="50"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 dark:border-slate-700 bg-charcoal-50/50 dark:bg-slate-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-swiggy-orange to-amber-500 hover:from-swiggy-hover hover:to-amber-600 text-white font-extrabold rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create & Switch Profile Instantly</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
