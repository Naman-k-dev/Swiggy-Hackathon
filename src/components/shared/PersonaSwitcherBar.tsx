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
      <div className="sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="glass-pill rounded-full border-white/30 shadow-glass">
            <div className="flex flex-wrap items-center justify-between gap-3 p-1">
              {/* Left: Competition Badge & Persona indicator */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 glass-pill bg-swiggy-orange/90 hover:bg-swiggy-orange text-white font-bold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase shadow-[0_4px_16px_-2px_rgba(252,128,25,0.3)] transition-all duration-200 hover:shadow-[0_6px_20px_-2px_rgba(252,128,25,0.4)] hover:-translate-y-0.5"
                  title="Click to view competition evaluation guide"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Judge Guide</span>
                </button>
                <span className="text-white/30 hidden sm:inline">|</span>
                <div className="flex items-center gap-1.5 text-white/80">
                  <Users className="w-3.5 h-3.5 text-swiggy-orange" />
                  <span className="hidden md:inline text-white/60">Viewing as:</span>
                  <span className="font-semibold text-white">{currentUser.full_name}</span>
                  {currentUser.id.endsWith('1') && (
                    <Badge variant="orange" size="sm" className="text-[10px] py-0 px-2 glass-pill border-swiggy-orange/30 bg-swiggy-orange/10 text-swiggy-orange">
                      Circle Admin
                    </Badge>
                  )}
                </div>
              </div>

              {/* Center: Quick Student Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                <span className="text-white/40 text-[11px] mr-1 hidden lg:inline">Switch Student:</span>
                {personas.map((persona) => {
                  const isActive = persona.id === currentUser.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => switchPersona(persona.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? 'glass-pill bg-white/20 text-white shadow-[0_4px_16px_-2px_rgba(255,255,255,0.1)] ring-1 ring-white/20'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:scale-105'
                      }`}
                      title={`Switch active view to ${persona.full_name}`}
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden relative border border-white/20 flex-shrink-0">
                        <Image
                          src={persona.avatar_url || ''}
                          alt={persona.full_name}
                          width={20}
                          height={20}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span>{persona.full_name.split(' ')[0]}</span>
                      {isActive && <Check className="w-3.5 h-3.5 ml-0.5 text-swiggy-orange" />}
                    </button>
                  );
                })}
              </div>

              {/* Right: Sync Status & Reset */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setAnalyticsOpen(true)}
                  className="glass-pill px-3 py-1.5 text-white/80 hover:text-white hover:bg-white/10 text-[11px] font-medium rounded-full transition-all duration-200 hover:scale-105 inline-flex items-center gap-1.5"
                  title="View live business telemetry and conversion metrics"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-swiggy-orange" />
                  <span className="hidden sm:inline">AI Metrics</span>
                </button>

                <div className="hidden sm:flex items-center gap-1.5 text-white/60">
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
                  onClick={handleReset}
                  className="glass-pill px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/10 text-[11px] font-medium rounded-full transition-all duration-200 hover:scale-105 inline-flex items-center gap-1"
                  title="Reset test orders, members and cart back to default"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Seed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <JudgeGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      <AnalyticsModal isOpen={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
    </>
  );
}
