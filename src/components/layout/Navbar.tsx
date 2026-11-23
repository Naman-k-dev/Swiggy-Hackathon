'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store/demo-context';
import {
  PlusCircle,
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JudgeGuideModal } from '@/components/shared/JudgeGuideModal';
import { AnalyticsModal } from '@/components/shared/AnalyticsModal';

export function Navbar() {
  const pathname = usePathname();
  const {
    currentUser,
    isAuthenticated,
    logout,
    circles,
    getSession,
    cartItems,
    theme,
    toggleTheme,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // Check if active circle has an ongoing session
  const activeCircle = circles[0];
  const activeSession = activeCircle ? getSession(activeCircle.id) : null;
  const activeCartCount = activeSession
    ? cartItems.filter((i) => i.session_id === activeSession.id).length
    : 0;

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Explore Circles', href: '/dashboard#circles' },
    { label: 'How It Works', href: '/#how-it-works' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-xl border-b border-charcoal-200/50 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Concept Pill */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-swiggy-orange to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                  S
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg text-charcoal-900 dark:text-white tracking-tight leading-tight flex items-center gap-1.5">
                    Campus Circles
                    <span className="text-[10px] font-bold bg-orange-100 dark:bg-orange-500/20 text-swiggy-orange px-1.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-500/30">
                      Concept
                    </span>
                  </span>
                  <span className="text-[10px] text-charcoal-400 dark:text-slate-400 font-medium leading-none">
                    Swiggy Food for Thought 2.0
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation (Only show dashboard/circles if logged in) */}
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center gap-6">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-swiggy-orange ${
                        isActive ? 'text-swiggy-orange' : 'text-charcoal-600 dark:text-slate-300'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right Action Tools */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Judge Guide */}
              <button
                onClick={() => setGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-swiggy-orange bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all"
                title="Judge Journey Guide"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Judge Guide</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-charcoal-50 dark:bg-slate-800 text-charcoal-700 dark:text-slate-200 border border-charcoal-200 dark:border-slate-700 hover:bg-orange-50 dark:hover:bg-slate-700 transition"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-slate-700" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>

              {isAuthenticated && currentUser ? (
                <>
                  {/* Quick Action: Create Circle */}
                  <Link href="/circles/create">
                    <Button
                      size="sm"
                      className="rounded-xl gap-1.5 text-xs font-bold bg-gradient-to-r from-swiggy-orange to-amber-500 hover:from-swiggy-hover hover:to-amber-600 text-white shadow-md shadow-orange-500/20 border-none"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Create Circle</span>
                    </Button>
                  </Link>

                  {/* Active Group Cart (Only shown when logged in and active circle exists) */}
                  {activeCircle && (
                    <Link href={`/circles/${activeCircle.id}`}>
                      <button
                        className="relative px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-charcoal-50 dark:bg-slate-800 text-charcoal-800 dark:text-slate-200 border border-charcoal-200 dark:border-slate-700 hover:border-charcoal-300 dark:hover:border-slate-600 transition"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-swiggy-orange" />
                        <span>Cart</span>
                        {activeCartCount > 0 && (
                          <span className="bg-swiggy-orange text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                            {activeCartCount}
                          </span>
                        )}
                      </button>
                    </Link>
                  )}

                  {/* User Profile Pill & Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-charcoal-50 dark:bg-slate-800 border border-charcoal-200 dark:border-slate-700 hover:border-charcoal-300 dark:hover:border-slate-600 transition"
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden relative border border-orange-300 dark:border-slate-600 flex-shrink-0">
                        <Image
                          src={currentUser.avatar_url || ''}
                          alt={currentUser.full_name}
                          width={24}
                          height={24}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="text-xs font-bold text-charcoal-900 dark:text-white max-w-[100px] truncate">
                        {currentUser.full_name.split(' ')[0]}
                      </span>
                      <ChevronDown className="w-3 h-3 text-charcoal-400 dark:text-slate-400" />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-charcoal-200 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="pb-3 border-b border-charcoal-100 dark:border-slate-800">
                          <p className="font-extrabold text-sm text-charcoal-900 dark:text-white">{currentUser.full_name}</p>
                          <p className="text-xs text-charcoal-500 dark:text-slate-400">{currentUser.college}</p>
                          <div className="mt-2 flex items-center gap-1.5">
                            <Badge
                              variant={currentUser.dietary_pref === 'VEG' ? 'success' : 'danger'}
                              size="sm"
                            >
                              {currentUser.dietary_pref}
                            </Badge>
                            <Badge variant="outline" size="sm" className="dark:border-slate-700 dark:text-slate-300 text-[10px]">
                              ₹{currentUser.preferred_budget}/meal
                            </Badge>
                          </div>
                        </div>
                        <div className="pt-2 space-y-1">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setAnalyticsOpen(true);
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-charcoal-700 dark:text-slate-300 hover:bg-charcoal-50 dark:hover:bg-slate-800 rounded-xl transition"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-swiggy-orange" />
                            <span>AI Metrics Telemetry</span>
                          </button>
                          <Link
                            href="/onboarding"
                            onClick={() => setUserDropdownOpen(false)}
                            className="block px-3 py-2 text-xs font-medium text-charcoal-700 dark:text-slate-300 hover:bg-charcoal-50 dark:hover:bg-slate-800 rounded-xl transition"
                          >
                            Edit Preferences
                          </Link>
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              logout();
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
                          >
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth">
                    <Button
                      size="sm"
                      className="rounded-xl px-4 text-xs font-bold bg-swiggy-orange hover:bg-swiggy-dark text-white shadow-md shadow-orange-500/20"
                    >
                      Login / Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-charcoal-50 dark:bg-slate-800 text-charcoal-700 dark:text-slate-200 border border-charcoal-200 dark:border-slate-700"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-charcoal-700 dark:text-slate-300 hover:text-charcoal-900 dark:hover:text-white hover:bg-charcoal-100 dark:hover:bg-slate-800 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-charcoal-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 shadow-2xl">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center justify-between p-3 bg-charcoal-50 dark:bg-slate-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative border border-orange-300 dark:border-slate-600">
                    <Image
                      src={currentUser.avatar_url || ''}
                      alt={currentUser.full_name}
                      width={40}
                      height={40}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-charcoal-900 dark:text-white">{currentUser.full_name}</p>
                    <p className="text-xs text-charcoal-500 dark:text-slate-400">{currentUser.college}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="p-3 bg-charcoal-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-charcoal-900 dark:text-white">Guest Student</p>
                  <p className="text-xs text-charcoal-500 dark:text-slate-400">Sign in to join group orders</p>
                </div>
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-swiggy-orange text-white text-xs font-bold shadow-sm"
                >
                  Login / Register
                </Link>
              </div>
            )}

            <div className="space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-charcoal-800 dark:text-slate-200 hover:bg-charcoal-50 dark:hover:bg-slate-800 rounded-xl"
              >
                Dashboard & Circles
              </Link>
              <Link
                href="/circles/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-bold text-swiggy-orange hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl"
              >
                + Create New Circle
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setGuideOpen(true);
                }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-charcoal-800 dark:text-slate-200 hover:bg-charcoal-50 dark:hover:bg-slate-800 rounded-xl"
              >
                Judge Guide
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAnalyticsOpen(true);
                }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-charcoal-800 dark:text-slate-200 hover:bg-charcoal-50 dark:hover:bg-slate-800 rounded-xl"
              >
                AI Metrics Telemetry
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <JudgeGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      <AnalyticsModal isOpen={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
    </>
  );
}
