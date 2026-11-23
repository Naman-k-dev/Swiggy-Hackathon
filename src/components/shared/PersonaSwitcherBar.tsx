'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/demo-context';
import { Users, Sparkles, RefreshCw, Radio, Check, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { JudgeGuideModal } from '@/components/shared/JudgeGuideModal';
import { AnalyticsModal } from '@/components/shared/AnalyticsModal';

export function PersonaSwitcherBar() {
  const {
    currentUser,
    personas,
    switchPersona,
    isRealtimeConnected,
    isSupabaseActive,
    resetDemoData,
  } = useApp();

  const [guideOpen, setGuideOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const handleReset = () => {
    if (confirm('Reset prototype to initial seeded state (Aarav, Ananya, Rohan, Priya & sample orders)?')) {
      resetDemoData();
    }
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-charcoal-900 text-white text-xs border-b border-charcoal-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Competition Badge & Persona indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setGuideOpen(true)}
              className="inline-flex items-center gap-1.5 bg-swiggy-orange hover:bg-swiggy-hover text-white font-bold px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase shadow-xs transition"
              title="Click to view competition evaluation guide"
            >
              <Sparkles className="w-3 h-3" />
              <span>Judge Guide</span>
            </button>
            <span className="text-charcoal-400 hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5 text-charcoal-300">
              <Users className="w-3.5 h-3.5 text-swiggy-orange" />
              <span className="hidden md:inline text-charcoal-400">Viewing as:</span>
              <span className="font-semibold text-white">{currentUser.full_name}</span>
              {currentUser.id.endsWith('1') && (
                <Badge variant="orange" size="sm" className="text-[10px] py-0 px-1.5">
                  Circle Admin
                </Badge>
              )}
            </div>
          </div>

          {/* Center: Quick Student Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-charcoal-400 text-[11px] mr-1 hidden lg:inline">Switch Student:</span>
            {personas.map((persona) => {
              const isActive = persona.id === currentUser.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => switchPersona(persona.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-swiggy-orange text-white shadow-sm ring-1 ring-white/20'
                      : 'bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700 hover:text-white'
                  }`}
                  title={`Switch active view to ${persona.full_name}`}
                >
                  <div className="w-4 h-4 rounded-full overflow-hidden relative border border-white/20 flex-shrink-0">
                    <Image
                      src={persona.avatar_url || ''}
                      alt={persona.full_name}
                      width={16}
                      height={16}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <span>{persona.full_name.split(' ')[0]}</span>
                  {isActive && <Check className="w-3 h-3 ml-0.5 text-white" />}
                </button>
              );
            })}
          </div>

          {/* Right: Sync Status & Reset */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-charcoal-400">
              <Radio
                className={`w-3 h-3 ${
                  isRealtimeConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
                }`}
              />
              <span className="text-[11px]">
                {isSupabaseActive ? 'Supabase Realtime' : 'Cross-Tab Sync'}
              </span>
            </div>

            <button
              onClick={() => setAnalyticsOpen(true)}
              className="hidden md:flex items-center gap-1 text-charcoal-400 hover:text-white text-[11px] hover:underline"
              title="View live business telemetry and conversion metrics"
            >
              <BarChart3 className="w-3.5 h-3.5 text-swiggy-orange" />
              <span>AI Metrics</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-charcoal-400 hover:text-white text-[11px] hover:underline"
              title="Reset test orders, members and cart back to default"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset Seed</span>
            </button>
          </div>
        </div>
      </div>

      <JudgeGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      <AnalyticsModal isOpen={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
    </>
  );
}
