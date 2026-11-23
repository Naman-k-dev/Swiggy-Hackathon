'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store/demo-context';
import { Users, Sparkles, RefreshCw, Radio, BarChart3, Sun, Moon, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { JudgeGuideModal } from '@/components/shared/JudgeGuideModal';
import { AnalyticsModal } from '@/components/shared/AnalyticsModal';
import { AddProfileModal } from '@/components/shared/AddProfileModal';

export function PersonaSwitcherBar() {
  const {
    currentUser,
    isRealtimeConnected,
    isSupabaseActive,
    resetDemoData,
    theme,
    toggleTheme,
  } = useApp();

  const [guideOpen, setGuideOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [addProfileOpen, setAddProfileOpen] = useState(false);

  // Auto prompt custom profile creation if user hasn't created one
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const hasCustomProfile = localStorage.getItem('scc_has_custom_profile_v1');
      if (!hasCustomProfile) {
        // Small delay to allow clean initial render
        const timer = setTimeout(() => {
          setAddProfileOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleReset = () => {
    if (confirm('Reset prototype to initial state?')) {
      resetDemoData();
    }
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-orange-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left: Judge Guide & Active Profile */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGuideOpen(true)}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-swiggy-orange to-amber-500 hover:from-swiggy-hover hover:to-amber-600 text-white font-extrabold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase shadow-md shadow-orange-500/20 transition-all duration-200 transform hover:scale-105"
                title="Click to view competition evaluation guide"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Judge Guide</span>
              </button>

              <div className="flex items-center gap-2 bg-orange-50/80 dark:bg-slate-800 px-3 py-1 rounded-full border border-orange-200/60 dark:border-slate-700">
                <Users className="w-3.5 h-3.5 text-swiggy-orange" />
                <div className="w-5 h-5 rounded-full overflow-hidden relative border border-orange-300 dark:border-slate-600 flex-shrink-0">
                  <Image
                    src={currentUser.avatar_url || ''}
                    alt={currentUser.full_name}
                    width={20}
                    height={20}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span className="font-bold text-xs text-charcoal-900 dark:text-white">{currentUser.full_name}</span>
                <span className="text-[10px] text-charcoal-500 dark:text-slate-400 hidden sm:inline">({currentUser.college})</span>
              </div>
            </div>

            {/* Center: Add Profile Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddProfileOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 transition-all duration-200 hover:scale-105"
                title="Add your custom profile"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Profile</span>
              </button>
            </div>

            {/* Right: Theme Toggle, AI Metrics, Sync Status & Reset */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-full bg-charcoal-50 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-slate-700 text-charcoal-700 dark:text-slate-200 border border-charcoal-200/60 dark:border-slate-700 transition-all duration-200 hover:scale-105"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                onClick={() => setAnalyticsOpen(true)}
                className="flex items-center gap-1.5 bg-charcoal-50 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-slate-700 text-charcoal-700 dark:text-slate-200 px-2.5 py-1 text-[10px] font-medium rounded-full border border-charcoal-200/60 dark:border-slate-700 transition-all duration-200 hover:scale-105"
                title="View live business telemetry and conversion metrics"
              >
                <BarChart3 className="w-3.5 h-3.5 text-swiggy-orange" />
                <span className="hidden sm:inline">AI Metrics</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 text-charcoal-700 dark:text-slate-300 bg-charcoal-50 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-charcoal-200/60 dark:border-slate-700">
                <Radio
                  className={`w-2.5 h-2.5 ${
                    isRealtimeConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'
                  }`}
                />
                <span className="text-[10px] font-medium">
                  {isSupabaseActive ? 'Realtime' : 'Sync'}
                </span>
              </div>

              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-charcoal-700 dark:text-slate-300 hover:text-charcoal-900 dark:hover:text-white bg-charcoal-50 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-slate-700 px-2.5 py-1 text-[10px] font-medium rounded-full border border-charcoal-200/60 dark:border-slate-700 transition-all duration-200 hover:scale-105"
                title="Reset test data back to default"
              >
                <RefreshCw className="w-3 h-3 text-swiggy-orange" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <JudgeGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      <AnalyticsModal isOpen={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
      <AddProfileModal isOpen={addProfileOpen} onClose={() => setAddProfileOpen(false)} />
    </>
  );
}
