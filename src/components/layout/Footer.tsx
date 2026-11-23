import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, ShieldAlert } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-charcoal-900 text-white border-t border-charcoal-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-swiggy-orange flex items-center justify-center text-white font-black text-lg">
                S
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Swiggy Campus Circles
              </span>
            </div>
            <p className="text-charcoal-400 text-sm max-w-md leading-relaxed">
              A campus-first collaborative group-ordering platform. Designed to eliminate coordination chaos, split bills automatically, beat delivery fees, and bring college communities together over food.
            </p>
            <div className="inline-flex items-center gap-2 bg-charcoal-800/80 px-3 py-1.5 rounded-xl border border-charcoal-700 text-xs text-charcoal-300">
              <Sparkles className="w-3.5 h-3.5 text-swiggy-orange" />
              <span>Concept Prototype for <strong>Swiggy Food for Thought 2.0</strong></span>
            </div>
          </div>

          {/* Fast Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mb-3">
              Prototype Journey
            </h4>
            <ul className="space-y-2 text-sm text-charcoal-300">
              <li>
                <Link href="/dashboard" className="hover:text-swiggy-orange transition">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link href="/circles/create" className="hover:text-swiggy-orange transition">
                  Create a Circle
                </Link>
              </li>
              <li>
                <Link href="/circles/circle-cse-lunch-squad" className="hover:text-swiggy-orange transition">
                  Active CSE Circle & Cart
                </Link>
              </li>
              <li>
                <Link href="/join/CAMPUS24" className="hover:text-swiggy-orange transition">
                  Test Invite Flow
                </Link>
              </li>
            </ul>
          </div>

          {/* Prototype Notice */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mb-3">
              Competition Disclaimer
            </h4>
            <div className="text-xs text-charcoal-400 space-y-2">
              <p>
                This application is an educational & product innovation concept prototype created for the Swiggy Food for Thought 2.0 competition.
              </p>
              <p className="text-amber-400/90 flex items-center gap-1.5 font-medium">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                Simulated orders only — no real financial transactions.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-400 gap-4">
          <p>© {new Date().getFullYear()} Swiggy Campus Circles Concept Prototype. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for college students with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
