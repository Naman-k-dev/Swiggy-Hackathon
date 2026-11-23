'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store/demo-context';
import { Users, Sparkles, RefreshCw, Radio, Check, BarChart3 } from 'lucide-react';
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
  const [mcpStatus, setMcpStatus] = useState<{ isConnected: boolean; isLive: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/auth/swiggy/status')
      .then((r) => r.json())
      .then((d) => setMcpStatus(d))
      .catch(() => setMcpStatus({ isConnected: false, isLive: false }));
  }, []);

  const handleToggleMCP = async () => {
    if (mcpStatus?.isLive) {
      if (confirm('Disconnect Swiggy Food MCP and switch to Campus Verified Demo Menus?')) {
        await fetch('/api/auth/swiggy/disconnect', { method: 'POST' });
        setMcpStatus({ isConnected: false, isLive: false });
        window.location.reload();
      }
    } else {
      window.location.href = '/api/auth/swiggy/authorize?mode=sandbox';
    }
  };

  const handleReset = () => {
    if (confirm('Reset prototype to initial seeded state (Aarav, Ananya, Rohan, Priya & sample orders)?')) {
      resetDemoData();
    }
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left: Judge Guide & Active Persona */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setGuideOpen(true)}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-swiggy-orange to-amber-500 hover:from-swiggy-hover hover:to-amber-600 text-white font-extrabold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase shadow-md shadow-orange-500/20 transition-all duration-200 transform hover:scale-105"
                title="Click to view competition evaluation guide"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Judge Guide</span>
              </button>
              <span className="text-charcoal-300 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5 text-charcoal-800">
                <Users className="w-3.5 h-3.5 text-swiggy-orange" />
                <span className="hidden md:inline text-charcoal-500 text-xs">Viewing:</span>
                <span className="font-bold text-xs text-charcoal-900">{currentUser.full_name}</span>
                {currentUser.id.endsWith('1') && (
                  <span className="text-[10px] font-bold text-swiggy-dark bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
                    Admin
                  </span>
                )}
              </div>
            </div>

            {/* Center: Student Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-charcoal-500 text-[11px] mr-1 hidden lg:inline font-medium">Switch:</span>
              {personas.map((persona) => {
                const isActive = persona.id === currentUser.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => switchPersona(persona.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-swiggy-orange to-amber-500 text-white shadow-md shadow-orange-500/30 ring-1 ring-orange-200 font-bold scale-105'
                        : 'bg-charcoal-50 text-charcoal-700 hover:bg-orange-100 hover:text-charcoal-900 border border-charcoal-200/60'
                    }`}
                    title={`Switch active view to ${persona.full_name}`}
                  >
                    <div className="w-4 h-4 rounded-full overflow-hidden relative border border-orange-300 flex-shrink-0 shadow-sm">
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

            {/* Right: MCP Status Pill, AI Metrics & Reset */}
            <div className="flex items-center gap-2.5">
              {/* Data Source & MCP Status Pill */}
              <button
                onClick={handleToggleMCP}
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all duration-200 hover:scale-105 ${
                  mcpStatus?.isLive
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-orange-50 text-orange-800 border-orange-200'
                }`}
                title={
                  mcpStatus?.isLive
                    ? 'Connected to Swiggy Food MCP. Click to toggle to Demo mode.'
                    : 'Click to connect Swiggy Food MCP OAuth 2.1.'
                }
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    mcpStatus?.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-swiggy-orange'
                  }`}
                />
                <span>{mcpStatus?.isLive ? '🟢 Swiggy MCP Live' : '🏷️ Campus Demo'}</span>
              </button>

              <button
                onClick={() => setAnalyticsOpen(true)}
                className="flex items-center gap-1.5 bg-charcoal-50 hover:bg-orange-100 text-charcoal-700 hover:text-charcoal-900 px-2.5 py-1 text-[10px] font-medium rounded-full border border-charcoal-200/60 transition-all duration-200 hover:scale-105"
                title="View live business telemetry and conversion metrics"
              >
                <BarChart3 className="w-3.5 h-3.5 text-swiggy-orange" />
                <span className="hidden sm:inline">AI Metrics</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 text-charcoal-700 bg-charcoal-50 px-2.5 py-1 rounded-full border border-charcoal-200/60">
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
                className="flex items-center gap-1 text-charcoal-700 hover:text-charcoal-900 bg-charcoal-50 hover:bg-orange-100 px-2.5 py-1 text-[10px] font-medium rounded-full border border-charcoal-200/60 transition-all duration-200 hover:scale-105"
                title="Reset test orders, members and cart back to default"
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
    </>
  );
}
