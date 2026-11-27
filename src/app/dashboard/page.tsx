'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/demo-context';
import {
  Users,
  Plus,
  KeyRound,
  ShoppingBag,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Calendar,
  AlertCircle,
  Database,
  CheckCircle2,
  Shield,
  Search,
  Lock,
  FlaskConical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatPaise } from '@/lib/utils';
import { BuddyMatchModal } from '@/components/buddymatch/BuddyMatchModal';
import { CircleGuardActivityModal } from '@/components/security/CircleGuardActivityModal';
import { PrivacySettingsModal } from '@/components/security/PrivacySettingsModal';
import { PilotLabDashboardModal } from '@/components/pilot/PilotLabDashboardModal';

export default function DashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    isAuthenticated,
    getUserCircles,
    getCircleMembers,
    getSession,
    getOrdersForUser,
    getCircleByInviteCode,
    resolveInviteCode,
    joinCircle,
    importDemoData,
    hasDemoData,
    supabaseSchemaStatus,
    isDemoMode,
  } = useApp();

  const [demoLoadedMsg, setDemoLoadedMsg] = useState(false);
  const [buddyMatchOpen, setBuddyMatchOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [pilotLabOpen, setPilotLabOpen] = useState(false);

  const handleImportDemo = () => {
    importDemoData();
    setDemoLoadedMsg(true);
    setTimeout(() => setDemoLoadedMsg(false), 3500);
  };

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth');
    }

    const handleOpenBuddyMatch = () => {
      setBuddyMatchOpen(true);
    };

    const handleOpenSecurity = () => {
      setSecurityOpen(true);
    };

    const handleOpenPrivacy = () => {
      setPrivacyOpen(true);
    };

    const handleOpenPilotLab = () => {
      setPilotLabOpen(true);
    };

    window.addEventListener('open-buddymatch', handleOpenBuddyMatch);
    window.addEventListener('open-security', handleOpenSecurity);
    window.addEventListener('open-privacy', handleOpenPrivacy);
    window.addEventListener('open-pilot-lab', handleOpenPilotLab);

    return () => {
      window.removeEventListener('open-buddymatch', handleOpenBuddyMatch);
      window.removeEventListener('open-security', handleOpenSecurity);
      window.removeEventListener('open-privacy', handleOpenPrivacy);
      window.removeEventListener('open-pilot-lab', handleOpenPilotLab);
    };
  }, [isAuthenticated, router]);

  const userCircles = getUserCircles();
  const userOrders = getOrdersForUser();
  const waivedOrdersCount = userOrders.filter((o) => o.delivery_fee_paise === 0).length;
  const estimatedDeliverySavedPaise = waivedOrdersCount * 3000;

  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Today's formatted date
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Check if any circle has an active ordering session
  const activeSessionCircle = userCircles.find((c) => {
    const session = getSession(c.id);
    return session && (session.status === 'open' || session.status === 'locked');
  });
  const activeSession = activeSessionCircle ? getSession(activeSessionCircle.id) : null;

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    const code = inviteCodeInput.trim().toUpperCase();
    if (!code) return;

    const circle = (await resolveInviteCode(code)) || getCircleByInviteCode(code);
    if (!circle) {
      setJoinError('Invalid invite code. Try "CAMPUS24" or "NIGHT300".');
      return;
    }

    const res = await joinCircle(circle.id, code);
    if (res.success) {
      setJoinModalOpen(false);
      setInviteCodeInput('');
      router.push(`/circles/${circle.id}`);
    } else {
      setJoinError(res.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 bg-[#FAFAF8] dark:bg-slate-950 min-h-screen transition-colors">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-orange-200/20 dark:from-orange-500/10 via-transparent to-transparent blur-[120px] -z-10 pointer-events-none rounded-full" />

      {/* 1. Header & Welcome Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-charcoal-200/60 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 glass-pill dark:bg-slate-900 dark:border-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-charcoal-700 dark:text-slate-300 mb-3">
            <Calendar className="w-3.5 h-3.5 text-swiggy-orange" />
            <span>{todayFormatted}</span>
            <span className="text-charcoal-300 dark:text-slate-700">•</span>
            <span className="text-charcoal-700 dark:text-slate-200 font-bold">{currentUser.college}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white tracking-tight flex items-center gap-2">
            Welcome back, {currentUser.full_name.split(' ')[0]}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-slate-400 mt-1">
            Manage your food circles, coordinate meals, and save delivery costs with classmates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setPilotLabOpen(true)}
            className="glass-pill dark:bg-slate-900 dark:border-orange-500/30 text-swiggy-orange hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-2xl gap-1.5 text-xs font-bold"
            title="Campus Pilot Lab — Student Empirical Research & Telemetry"
          >
            <FlaskConical className="w-3.5 h-3.5 text-swiggy-orange" />
            <span>Pilot Lab</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleImportDemo}
            className="glass-pill dark:bg-slate-900 dark:border-orange-500/30 text-swiggy-orange hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-2xl gap-1.5 text-xs font-bold"
            title="Pre-populate mock campus squads and active carts for judging"
          >
            {demoLoadedMsg ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Demo Loaded!</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-swiggy-orange" />
                <span>{hasDemoData ? 'Re-import Demo Data' : 'Import Demo Data'}</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => setJoinModalOpen(true)}
            className="glass-pill dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 rounded-2xl gap-2 text-xs font-bold"
          >
            <KeyRound className="w-4 h-4 text-charcoal-600 dark:text-slate-400" />
            Join Circle
          </Button>

          <Link href="/circles/create">
            <Button size="md" className="rounded-2xl gap-2 text-xs font-bold shadow-highlight bg-gradient-to-r from-swiggy-orange to-orange-600 text-white border-none">
              <Plus className="w-4 h-4" />
              Create Circle
            </Button>
          </Link>
        </div>
      </div>

      {/* Cloud Migration Transparency Notice */}
      {supabaseSchemaStatus === 'migrations_missing' && !isDemoMode && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200">
                Supabase Auth Live • Database Schema Migrations Pending
              </p>
              <p className="text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                Signed-in account authentication is active via Supabase, while shared circles and carts currently persist in this browser until SQL migrations in <code className="font-mono">supabase/migrations/</code> are applied.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportDemo}
            className="rounded-xl text-xs font-bold border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 whitespace-nowrap"
          >
            Load Sample Sandbox
          </Button>
        </div>
      )}

      {/* CircleMatch AI Feature Spotlight Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-r from-orange-500 via-amber-500 to-swiggy-orange text-white p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              <span>Phase 2 Live: CircleMatch AI</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Different cravings? One perfect circle meal.
            </h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
              Eliminate campus group dining debates in seconds. CircleMatch AI automatically balances veg/non-veg diets, individual student budgets, and cravings across your circle.
            </p>
          </div>
          {userCircles.length > 0 && (
            <Link href={`/circles/${userCircles[0].id}`}>
              <Button
                size="lg"
                className="bg-white text-swiggy-orange hover:bg-orange-50 font-black text-sm px-6 py-5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap border-none"
              >
                <Sparkles className="w-4 h-4 text-swiggy-orange animate-pulse" />
                <span>Launch CircleMatch AI ✨</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Active Session Alert (If any) */}
      {activeSessionCircle && activeSession && (
        <div className="rounded-[2.5rem] glass-card dark:bg-slate-900 dark:border-slate-800 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl glass-pill dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
              {activeSessionCircle.emoji || '🍱'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold glass-pill dark:bg-orange-500/20 dark:border-orange-500/30 text-swiggy-orange dark:text-orange-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Active Order Session
                </span>
                <span className="text-xs text-charcoal-400 dark:text-slate-400">• {activeSessionCircle.name}</span>
              </div>
              <h3 className="text-lg font-black mt-1 text-charcoal-900 dark:text-white">
                Ordering from {activeSession.restaurant_name}
              </h3>
              <p className="text-xs text-charcoal-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-swiggy-orange" />
                Status: <strong className="uppercase text-charcoal-700 dark:text-slate-200">{activeSession.status}</strong> • Drop Point: {activeSession.delivery_location}
              </p>
            </div>
          </div>

          <Link href={`/circles/${activeSessionCircle.id}`}>
            <Button
              variant="secondary"
              size="md"
              className="w-full md:w-auto font-black text-xs px-5 rounded-xl glass-card dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 hover:bg-white/50 gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-swiggy-orange" />
              <span>Enter Group Cart</span>
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl glass-card dark:bg-slate-900 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-charcoal-500 dark:text-slate-400 uppercase tracking-wide">My Circles</p>
            <p className="text-2xl font-black text-charcoal-900 dark:text-white mt-1">{userCircles.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl glass-pill dark:bg-slate-800 dark:border-slate-700 text-swiggy-orange flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl glass-card dark:bg-slate-900 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-charcoal-500 dark:text-slate-400 uppercase tracking-wide">Delivery Fees Saved</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatPaise(estimatedDeliverySavedPaise)}
            </p>
            <p className="text-[10px] text-charcoal-400 dark:text-slate-500 mt-0.5">
              {waivedOrdersCount > 0
                ? `${waivedOrdersCount} group ${waivedOrdersCount === 1 ? 'order' : 'orders'} waived`
                : '₹30 saved per ₹400+ group order'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl glass-pill dark:bg-slate-800 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl glass-card dark:bg-slate-900 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-charcoal-500 dark:text-slate-400 uppercase tracking-wide">Target Meal Budget</p>
            <p className="text-2xl font-black text-charcoal-900 dark:text-white mt-1">₹{currentUser.preferred_budget}</p>
          </div>
          <div className="w-10 h-10 rounded-xl glass-pill dark:bg-slate-800 dark:border-slate-700 text-swiggy-orange flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* BuddyMatch Discovery Section */}
      <div id="buddymatch" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-charcoal-900 dark:text-white tracking-tight flex items-center gap-2">
              <Search className="text-swiggy-orange" size={24} />
              Find My Food Squad
            </h2>
            <p className="text-xs text-charcoal-500 dark:text-slate-400">
              Discover compatible campus circles based on your meal preferences and budget
            </p>
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-gradient-to-r from-orange-500 via-amber-500 to-swiggy-orange text-white p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                <span>Phase 8: BuddyMatch Discovery</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight">
                Order together. Split delivery. Save more.
              </h3>
              <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
                Campus BuddyMatch helps you find compatible ordering groups based on meal times, budgets, and cuisine preferences. Admins approve join requests for safety.
              </p>
            </div>
            <Button
              onClick={() => {
                // Open BuddyMatch modal from Navbar
                window.dispatchEvent(new CustomEvent('open-buddymatch'));
              }}
              size="lg"
              className="bg-white text-swiggy-orange hover:bg-orange-50 font-black text-sm px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap border-none"
            >
              <Users className="w-4 h-4 text-swiggy-orange" />
              <span>Discover Compatible Squads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* CircleGuard Security Section */}
      <div id="security" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-charcoal-900 dark:text-white tracking-tight flex items-center gap-2">
              <Shield className="text-swiggy-orange" size={24} />
              CircleGuard Security Center
            </h2>
            <p className="text-xs text-charcoal-500 dark:text-slate-400">
              Monitor account activity, join request history, and privacy controls
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl glass-card dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm flex items-start gap-4 border-l-4 border-swiggy-orange">
            <div className="p-3 bg-orange-100 dark:bg-orange-950 rounded-xl text-swiggy-orange">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-charcoal-900 dark:text-white">Real-time Activity Monitoring</h4>
              <p className="text-xs text-charcoal-500 dark:text-slate-400 mt-1">
                Track circle joins, request approvals, session finalizations, and security events in one timeline.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 rounded-xl text-xs font-bold border-swiggy-orange text-swiggy-orange hover:bg-orange-50 dark:hover:bg-orange-500/10"
                onClick={() => window.dispatchEvent(new CustomEvent('open-security'))}
              >
                View Security Activity
              </Button>
            </div>
          </div>

          <div className="rounded-2xl glass-card dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm flex items-start gap-4 border-l-4 border-emerald-500">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 rounded-xl text-emerald-600">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-charcoal-900 dark:text-white">Privacy & Data Controls</h4>
              <p className="text-xs text-charcoal-500 dark:text-slate-400 mt-1">
                Manage BuddyMatch discoverability, budget visibility, notification preferences, and opt-out anytime.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 rounded-xl text-xs font-bold border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                onClick={() => window.dispatchEvent(new CustomEvent('open-privacy'))}
              >
                Open Privacy Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. My Circles Grid */}
      <div id="circles" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-charcoal-900 dark:text-white tracking-tight">
              My Campus Circles
            </h2>
            <p className="text-xs text-charcoal-500 dark:text-slate-400">
              Your recurring groups for daily meals, hostel orders, and late-night snacks
            </p>
          </div>
        </div>

        {userCircles.length === 0 ? (
          <div className="rounded-[2.5rem] glass-card dark:bg-slate-900 dark:border-slate-800 p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl glass-pill dark:bg-slate-800 text-swiggy-orange flex items-center justify-center mx-auto text-xl">
              🍕
            </div>
            <div>
              <h3 className="font-black text-base text-charcoal-900 dark:text-white">
                You haven&apos;t joined any Circles yet
              </h3>
              <p className="text-xs text-charcoal-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                Create a circle for your hostel roommates or join an existing circle with an invite code.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="sm"
                onClick={handleImportDemo}
                className="rounded-xl font-bold bg-swiggy-orange text-white shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Import Demo Squads & Cart</span>
              </Button>
              <Button size="sm" onClick={() => setJoinModalOpen(true)} variant="outline" className="glass-pill dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                Join with Code
              </Button>
              <Link href="/circles/create">
                <Button size="sm" variant="outline" className="rounded-xl border-dashed dark:border-slate-700 dark:text-slate-300">Create Circle</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCircles.map((circle) => {
              const session = getSession(circle.id);
              const members = getCircleMembers(circle.id);
              const isUserAdmin = circle.admin_id === currentUser.id;

              return (
                <div
                  key={circle.id}
                  className="rounded-[2rem] glass-card dark:bg-slate-900 dark:border-slate-800 p-6 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Top: Emoji & Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl glass-pill dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                        {circle.emoji || '🍱'}
                      </div>

                      {session?.status === 'open' ? (
                        <Badge variant="success" size="sm" className="font-bold animate-pulse">
                          Order Open
                        </Badge>
                      ) : session?.status === 'locked' ? (
                        <Badge variant="warning" size="sm" className="font-bold">
                          Cart Locked
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm" className="dark:bg-slate-800 dark:text-slate-300">
                          Idle
                        </Badge>
                      )}
                    </div>

                    {/* Circle Name & Details */}
                    <h3 className="font-black text-lg text-charcoal-900 dark:text-white group-hover:text-swiggy-orange transition-colors">
                      {circle.name}
                    </h3>
                    <p className="text-xs text-charcoal-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {circle.description || 'Active campus group'}
                    </p>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" size="sm" className="text-[10px] dark:border-slate-700 dark:text-slate-300">
                        {circle.type}
                      </Badge>
                      <Badge variant="orange" size="sm" className="text-[10px] dark:bg-orange-500/20 dark:border-orange-500/30 dark:text-orange-400">
                        Budget: ₹{circle.preferred_budget}/meal
                      </Badge>
                      {isUserAdmin && (
                        <Badge variant="neutral" size="sm" className="text-[10px] dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Member Avatars & Enter Button */}
                  <div className="mt-6 pt-4 border-t border-charcoal-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex -space-x-2 overflow-hidden">
                        {members.slice(0, 4).map((m, idx) => (
                          <div
                            key={idx}
                            className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 overflow-hidden relative border border-charcoal-200 dark:border-slate-700"
                          >
                            <Image
                              src={m.profile.avatar_url || ''}
                              alt={m.profile.full_name}
                              width={28}
                              height={28}
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-charcoal-500 dark:text-slate-400 ml-2">
                        {members.length} {members.length === 1 ? 'member' : 'members'}
                      </span>
                    </div>

                    <Link href={`/circles/${circle.id}`}>
                      <Button size="sm" className="rounded-xl text-xs font-bold gap-1 bg-swiggy-orange text-white hover:bg-swiggy-hover">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Match</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Recent Circle Orders History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
              Recent Circle Orders
            </h2>
            <p className="text-xs text-charcoal-500 dark:text-slate-400">
              Track simulated order status, itemized receipts, and member contributions
            </p>
          </div>
        </div>

        {userOrders.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 p-6 text-center text-xs text-charcoal-500 dark:text-slate-400">
            No past orders found. Finalize a group order in one of your circles to see it here!
          </div>
        ) : (
          <div className="space-y-3">
            {userOrders.map((order) => {
              const myContribution = order.member_breakdowns.find(
                (m) => m.user_id === currentUser.id
              );

              return (
                <div
                  key={order.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-charcoal-100 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:border-charcoal-200 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-swiggy-orange">
                        {order.order_code}
                      </span>
                      <Badge variant="success" size="sm" className="text-[10px] uppercase font-bold">
                        {order.status}
                      </Badge>
                      <span className="text-xs text-charcoal-400 dark:text-slate-500">•</span>
                      <span className="text-xs text-charcoal-600 dark:text-slate-300 font-semibold">{order.circle_name}</span>
                    </div>

                    <h4 className="text-base font-bold text-charcoal-900 dark:text-white">
                      {order.restaurant_name}
                    </h4>

                    <p className="text-xs text-charcoal-500 dark:text-slate-400">
                      {order.total_items_count} dishes • Delivered to {order.delivery_location}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-charcoal-100 dark:border-slate-800">
                    <div className="text-right">
                      <p className="text-xs text-charcoal-500 dark:text-slate-400">
                        {myContribution ? 'Your Share' : 'Group Total'}
                      </p>
                      <p className="text-base font-black text-charcoal-900 dark:text-white">
                        {myContribution
                          ? formatPaise(myContribution.share_paise)
                          : formatPaise(order.total_paise)}
                      </p>
                    </div>

                    <Link href={`/circles/${order.circle_id}/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                        View Tracking
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Join Circle Modal */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => {
          setJoinModalOpen(false);
          setJoinError(null);
        }}
        title="Join a Campus Circle"
        description="Enter the 6-letter invite code provided by your circle admin (e.g. CAMPUS24 or NIGHT300)."
      >
        <form onSubmit={handleJoinByCode} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-slate-300 mb-1.5">
              Invite Code
            </label>
            <input
              type="text"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
              placeholder="CAMPUS24"
              maxLength={8}
              className="w-full px-4 py-3 text-center font-mono text-lg font-bold tracking-widest rounded-2xl border border-charcoal-200 dark:border-slate-700 bg-charcoal-50/50 dark:bg-slate-800 text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-swiggy-orange uppercase"
              autoFocus
              required
            />
          </div>

          {joinError && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{joinError}</span>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="flex-1 rounded-xl dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => setJoinModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="md" className="flex-1 rounded-xl font-bold bg-swiggy-orange text-white">
              Join Circle
            </Button>
          </div>
        </form>
      </Modal>

      {/* BuddyMatch Modal */}
      <BuddyMatchModal isOpen={buddyMatchOpen} onClose={() => setBuddyMatchOpen(false)} userProfile={currentUser} />

      {/* CircleGuard Security Modal */}
      <CircleGuardActivityModal isOpen={securityOpen} onClose={() => setSecurityOpen(false)} userId={currentUser?.id || ''} />

      {/* Privacy Settings Modal */}
      <PrivacySettingsModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} userProfile={currentUser} />

      {/* Campus Pilot Lab Modal */}
      <PilotLabDashboardModal isOpen={pilotLabOpen} onClose={() => setPilotLabOpen(false)} currentUser={currentUser} />
    </div>
  );
}
