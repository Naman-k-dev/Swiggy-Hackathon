'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store/demo-context';
import {
  PlusCircle,
  ShoppingBag,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  BarChart3,
  Users,
  Shield,
  Lock,
  FlaskConical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JudgeGuideModal } from '@/components/shared/JudgeGuideModal';
import { AnalyticsModal } from '@/components/shared/AnalyticsModal';
import { BuddyMatchModal } from '@/components/buddymatch/BuddyMatchModal';
import { CircleGuardActivityModal } from '@/components/security/CircleGuardActivityModal';
import { PrivacySettingsModal } from '@/components/security/PrivacySettingsModal';
import { PilotLabDashboardModal } from '@/components/pilot/PilotLabDashboardModal';

export function Navbar() {
  const pathname = usePathname();
  const {
    currentUser,
    isAuthenticated,
    logout,
    getUserCircles,
    getSession,
    cartItems,
    theme,
    toggleTheme,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [buddyMatchOpen, setBuddyMatchOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [pilotLabOpen, setPilotLabOpen] = useState(false);

  // Check if any joined circle has an ongoing session
  const userCircles = getUserCircles();
  const activeCircle = userCircles.find((c) => Boolean(getSession(c.id))) || userCircles[0];
  const activeSession = activeCircle ? getSession(activeCircle.id) : null;
  const activeCartCount = activeSession
    ? cartItems.filter((i) => i.session_id === activeSession.id).length
    : 0;

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Explore', href: '/dashboard#circles' },
    { label: 'Guide', href: '/#how-it-works' },
    { label: 'BuddyMatch', href: '/dashboard#buddymatch' },
    { label: 'Security', href: '/dashboard#security' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-swiggy-orange flex items-center justify-center text-white font-black text-lg transition-transform group-hover:scale-105">
                  S
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base text-charcoal-900 dark:text-white tracking-tight leading-tight">
                    Campus Circles
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center gap-8">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-swiggy-orange ${
                        isActive ? 'text-swiggy-orange' : 'text-charcoal-400 dark:text-slate-400'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right Action Tools */}
            <div className="hidden md:flex items-center gap-4">
              {/* Pilot Lab Quick Button */}
              {isAuthenticated && currentUser && (
                <button
                  onClick={() => setPilotLabOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-swiggy-orange bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors border border-orange-200/60 dark:border-orange-500/20 shadow-sm"
                  title="Campus Pilot Lab — Built With Students Research & Telemetry"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Pilot Lab</span>
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-charcoal-400 dark:text-slate-500 hover:text-swiggy-orange dark:hover:text-swiggy-orange transition-colors"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>

              {isAuthenticated && currentUser ? (
                <>
                  {/* Active Group Cart */}
                  {activeCircle && (
                    <Link href={`/circles/${activeCircle.id}`}>
                      <button className="relative p-1.5 text-charcoal-400 dark:text-slate-500 hover:text-swiggy-orange transition-colors">
                        <ShoppingBag className="w-4 h-4" />
                        {activeCartCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-swiggy-orange text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                            {activeCartCount}
                          </span>
                        )}
                      </button>
                    </Link>
                  )}

                  {/* User Profile */}
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 group"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors group-hover:border-swiggy-orange">
                        <Image
                          src={currentUser.avatar_url || ''}
                          alt={currentUser.full_name}
                          width={28}
                          height={28}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-56 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50">
                        <div className="px-3 py-2 border-b border-slate-50 dark:border-slate-800">
                          <p className="font-bold text-xs text-charcoal-900 dark:text-white truncate">{currentUser.full_name}</p>
                          <p className="text-[10px] text-charcoal-400 dark:text-slate-500 truncate">{currentUser.college}</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setPilotLabOpen(true);
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-charcoal-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                          >
                            <FlaskConical className="w-3.5 h-3.5 text-swiggy-orange" />
                            <span>Campus Pilot Lab</span>
                          </button>
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setGuideOpen(true);
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-charcoal-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-swiggy-orange" />
                            <span>Judge Guide</span>
                          </button>
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setAnalyticsOpen(true);
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-charcoal-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-swiggy-orange" />
                            <span>AI Analytics</span>
                          </button>
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setBuddyMatchOpen(true);
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-charcoal-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                          >
                            <Users className="w-3.5 h-3.5 text-swiggy-orange" />
                            <span>Find Food Squad</span>
                          </button>
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setSecurityOpen(true);
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-charcoal-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                          >
                            <Shield className="w-3.5 h-3.5 text-swiggy-orange" />
                            <span>CircleGuard Security</span>
                          </button>
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setPrivacyOpen(true);
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-charcoal-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                          >
                            <Lock className="w-3.5 h-3.5 text-swiggy-orange" />
                            <span>Privacy Settings</span>
                          </button>
                          <Link
                            href="/circles/create"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-charcoal-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-swiggy-orange" />
                            <span>Create Circle</span>
                          </Link>
                          <div className="h-px bg-slate-50 dark:border-slate-800 my-1" />
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              logout();
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link href="/auth">
                  <Button
                    size="sm"
                    className="rounded-lg px-4 text-xs font-bold bg-swiggy-orange hover:bg-swiggy-dark text-white border-none h-8"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-3">
              {isAuthenticated && activeCircle && (
                <Link href={`/circles/${activeCircle.id}`}>
                  <button className="relative p-1.5 text-charcoal-400 dark:text-slate-500">
                    <ShoppingBag className="w-4 h-4" />
                    {activeCartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-swiggy-orange text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                        {activeCartCount}
                      </span>
                    )}
                  </button>
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-charcoal-400 dark:text-slate-500 hover:text-swiggy-orange transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              {isAuthenticated && (
                <>
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
                      setBuddyMatchOpen(true);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-charcoal-800 dark:text-slate-200 hover:bg-charcoal-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
                  >
                    <Users size={16} className="text-swiggy-orange" />
                    Find Food Squad
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSecurityOpen(true);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-charcoal-800 dark:text-slate-200 hover:bg-charcoal-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
                  >
                    <Shield size={16} className="text-swiggy-orange" />
                    CircleGuard Security
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setPilotLabOpen(true);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-charcoal-800 dark:text-slate-200 hover:bg-charcoal-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
                  >
                    <FlaskConical size={16} className="text-swiggy-orange" />
                    Campus Pilot Lab
                  </button>
                </>
              )}
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
      <BuddyMatchModal isOpen={buddyMatchOpen} onClose={() => setBuddyMatchOpen(false)} userProfile={currentUser} />
      <CircleGuardActivityModal isOpen={securityOpen} onClose={() => setSecurityOpen(false)} userId={currentUser?.id || ''} />
      <PrivacySettingsModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} userProfile={currentUser} />
      {currentUser && (
        <PilotLabDashboardModal
          isOpen={pilotLabOpen}
          onClose={() => setPilotLabOpen(false)}
          currentUser={currentUser}
        />
      )}
    </>
  );
}
