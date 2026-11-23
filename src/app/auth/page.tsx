'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useApp } from '@/lib/store/demo-context';
import {
  Mail,
  Lock,
  User,
  School,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Flame,
  UtensilsCrossed,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const router = useRouter();
  const { addProfile } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [dietaryPref, setDietaryPref] = useState<'veg' | 'non-veg' | 'flexible'>('flexible');
  const [budget, setBudget] = useState(250);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (!college.trim()) {
          throw new Error('Please enter your college or campus name.');
        }

        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
              data: {
                full_name: fullName.trim(),
                college: college.trim(),
                dietary_pref: dietaryPref,
                preferred_budget: Number(budget),
              },
            },
          });

          if (error) throw error;

          // Set user profile in state
          addProfile({
            full_name: fullName.trim(),
            college: college.trim(),
            dietary_preference: dietaryPref,
            preferred_budget: Number(budget),
          });

          if (data.session) {
            setSuccessMsg('Account created! Entering your campus circles...');
            setTimeout(() => router.push('/dashboard'), 700);
          } else {
            setSuccessMsg('Account created successfully! Check your email to confirm or sign in directly.');
          }
        } else {
          addProfile({
            full_name: fullName.trim(),
            college: college.trim(),
            dietary_preference: dietaryPref,
            preferred_budget: Number(budget),
          });
          setSuccessMsg('Profile created! Redirecting to your circles...');
          setTimeout(() => router.push('/dashboard'), 600);
        }
      } else {
        // Mode === 'login'
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          });

          if (error) throw error;

          if (data.user) {
            const userMeta = data.user.user_metadata || {};
            const profileName = userMeta.full_name || email.split('@')[0] || 'Member';
            const userCollege = userMeta.college || 'Campus';
            addProfile({
              full_name: profileName,
              college: userCollege,
              dietary_preference: userMeta.dietary_pref || 'flexible',
              preferred_budget: userMeta.preferred_budget || 250,
            });
            setSuccessMsg('Signed in! Welcome back.');
            setTimeout(() => router.push('/dashboard'), 600);
          }
        } else {
          const profileName = email.split('@')[0] || 'Campus User';
          addProfile({
            full_name: profileName,
            college: 'Campus',
            dietary_preference: 'flexible',
            preferred_budget: 250,
          });
          setSuccessMsg('Logged in! Redirecting...');
          setTimeout(() => router.push('/dashboard'), 500);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during authentication';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center px-4 py-12 overflow-hidden selection:bg-swiggy-orange selection:text-white">
      {/* 3D Atmospheric Glowing Blurs and Ambient Swiggy Mesh Orbs */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Core Swiggy Orange Radial */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-orange-500/35 via-amber-500/25 to-red-500/20 blur-[130px] animate-pulse-glow" />
        
        {/* Deep Amber Floating Orb Top-Left */}
        <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/20 blur-[110px] animate-float-slow" />
        
        {/* Warm Rose/Crimson Floating Orb Bottom-Right */}
        <div className="absolute -bottom-24 -right-16 w-[480px] h-[480px] rounded-full bg-gradient-to-tl from-orange-600/30 via-red-500/20 to-amber-400/15 blur-[120px] animate-float-reverse" />
        
        {/* Subtle grid pattern background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(252,128,25,0.06)_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Floating 3D Badge Pill */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-orange-200/80 dark:border-orange-500/20 shadow-lg shadow-orange-500/10 text-xs font-black tracking-wide text-charcoal-900 dark:text-white hover:scale-105 transition-all cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-swiggy-orange opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-swiggy-orange" />
            </span>
            <span className="bg-gradient-to-r from-swiggy-orange to-amber-500 bg-clip-text text-transparent uppercase tracking-wider text-[11px]">
              Swiggy Food for Thought 2.0
            </span>
            <span className="text-charcoal-300 dark:text-slate-600">•</span>
            <span className="text-[11px] text-charcoal-600 dark:text-slate-300 flex items-center gap-1 font-semibold">
              <Zap className="w-3 h-3 text-swiggy-orange" /> Campus Circles
            </span>
          </div>
        </div>

        {/* Branding Title */}
        <div className="text-center space-y-2 mb-7">
          <Link href="/" className="inline-block group mb-1">
            <div className="relative w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-swiggy-orange via-orange-500 to-amber-400 p-[2px] shadow-2xl shadow-orange-500/35 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              <div className="w-full h-full rounded-[22px] bg-gradient-to-b from-swiggy-orange to-orange-600 flex items-center justify-center text-white font-black text-3xl shadow-inner">
                S
              </div>
            </div>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-charcoal-900 dark:text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Join Your Campus Circle'}
          </h1>
          <p className="text-sm text-charcoal-600 dark:text-slate-400 font-medium">
            {mode === 'login'
              ? 'Sign in to access your shared carts, group splits & food orders'
              : 'Create your account to order together and unlock zero delivery fees'}
          </p>
        </div>

        {/* 3D Glassmorphism Box */}
        <div className="glass-ultra rounded-[32px] p-6 sm:p-9 shadow-2xl relative transition-all duration-300 border border-white/60 dark:border-white/10">
          {/* Floating decorative mini-badge */}
          <div className="absolute -top-3 right-6 bg-gradient-to-r from-swiggy-orange to-amber-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md shadow-orange-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Supabase Auth</span>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex bg-charcoal-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl mb-7 border border-charcoal-200/50 dark:border-slate-800 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white shadow-md shadow-black/5 scale-[1.02]'
                  : 'text-charcoal-500 dark:text-slate-400 hover:text-charcoal-900 dark:hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-swiggy-orange" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-800 text-charcoal-900 dark:text-white shadow-md shadow-black/5 scale-[1.02]'
                  : 'text-charcoal-500 dark:text-slate-400 hover:text-charcoal-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-black text-charcoal-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Your Full Name
                  </label>
                  <div className="relative group">
                    <User className="w-4 h-4 text-charcoal-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-swiggy-orange transition-colors" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aditya Singh"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-charcoal-200/90 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-charcoal-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-swiggy-orange focus:border-transparent transition-all placeholder:text-charcoal-400 dark:placeholder:text-slate-500 shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-charcoal-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    College / Campus & Hostel
                  </label>
                  <div className="relative group">
                    <School className="w-4 h-4 text-charcoal-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-swiggy-orange transition-colors" />
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. IIT Delhi - Kumaon Hostel"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-charcoal-200/90 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-charcoal-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-swiggy-orange focus:border-transparent transition-all placeholder:text-charcoal-400 dark:placeholder:text-slate-500 shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-black text-charcoal-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                      Diet Preference
                    </label>
                    <select
                      value={dietaryPref}
                      onChange={(e) => setDietaryPref(e.target.value as 'veg' | 'non-veg' | 'flexible')}
                      className="w-full px-3.5 py-3 rounded-2xl border border-charcoal-200/90 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-charcoal-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-swiggy-orange transition-all shadow-inner cursor-pointer"
                    >
                      <option value="veg">🌱 Pure Veg</option>
                      <option value="non-veg">🍗 Non-Veg</option>
                      <option value="flexible">✨ Anything / Both</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-charcoal-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                      Meal Budget (₹)
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={2000}
                      step={50}
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full px-3.5 py-3 rounded-2xl border border-charcoal-200/90 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-charcoal-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-swiggy-orange transition-all shadow-inner"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-black text-charcoal-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                College Email or Username
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-charcoal-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-swiggy-orange transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu or gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-charcoal-200/90 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-charcoal-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-swiggy-orange focus:border-transparent transition-all placeholder:text-charcoal-400 dark:placeholder:text-slate-500 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-charcoal-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-charcoal-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-swiggy-orange transition-colors" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-charcoal-200/90 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-charcoal-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-swiggy-orange focus:border-transparent transition-all placeholder:text-charcoal-400 dark:placeholder:text-slate-500 shadow-inner"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-md flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 font-semibold animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md flex items-start gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in duration-200">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Glowing 3D Shimmer Button */}
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-swiggy-orange via-orange-500 to-amber-500 hover:from-swiggy-hover hover:to-amber-600 shadow-xl shadow-orange-500/35 hover:shadow-orange-500/50 hover:scale-[1.01] active:scale-[0.98] transition-all border border-orange-400/30 flex items-center justify-center gap-2"
                isLoading={isLoading}
              >
                <span>{mode === 'login' ? 'Sign In to Account' : 'Register & Enter Circles'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Trust badges footer */}
          <div className="mt-6 pt-5 border-t border-charcoal-100/70 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-charcoal-500 dark:text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Supabase Auth
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-swiggy-orange" /> Real-time Group Sync
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
