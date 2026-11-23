'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/demo-context';
import { DEFAULT_CAMPUS_NAME } from '@/lib/data/mock-seed';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Sparkles, CheckCircle2 } from 'lucide-react';

export function DemoPreview() {
  const { circles } = useApp();
  const sampleCircle = circles[0];

  return (
    <section className="py-20 bg-charcoal-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-swiggy-orange/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Badge variant="orange" size="md">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Judge Guided Journey
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to test Campus Circles in action?
          </h2>

          <p className="text-charcoal-300 text-base sm:text-lg leading-relaxed">
            We have pre-seeded a full simulation for <strong>{sampleCircle?.college || DEFAULT_CAMPUS_NAME}</strong> with 4 student personas, an active ordering session at <strong>Rolls & Bowls Co.</strong>, and live shared cart synchronisation.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {sampleCircle && (
              <Link href={`/circles/${sampleCircle.id}`}>
                <Button size="lg" className="w-full sm:w-auto font-bold text-base px-8 gap-2 shadow-lg">
                  <Play className="w-4 h-4 fill-white" />
                  <span>Launch Live Demo ({sampleCircle.name})</span>
                </Button>
              </Link>
            )}

            <Link href="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-white border-charcoal-700 bg-charcoal-800/80 hover:bg-charcoal-700"
              >
                Open Student Dashboard
              </Button>
            </Link>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-charcoal-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Instant 4-student persona switcher
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Real-time cross-tab sync
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Integer paise math
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
