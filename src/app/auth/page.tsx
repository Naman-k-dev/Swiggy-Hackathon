'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/demo-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sparkles, Mail, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function AuthPage() {
  const router = useRouter();
  const { personas, switchPersona, currentUser } = useApp();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) {
          setMessage(`Supabase error: ${error.message}`);
        } else {
          setMessage('Check your email for the magic sign-in link!');
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        setMessage(`Error: ${errMsg}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Offline / Demo Mode: Map email or create student session
      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/onboarding');
      }, 500);
    }
  };

  const handleSelectPersona = (personaId: string) => {
    switchPersona(personaId);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-swiggy-orange flex items-center justify-center text-white font-black text-2xl mx-auto shadow-md">
            S
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Welcome to Campus Circles
          </h1>
          <p className="text-sm text-charcoal-500">
            Sign in to start ordering with your campus circles
          </p>
        </div>

        {/* Competition Judge Fast-Track */}
        <Card className="border-orange-200 bg-gradient-to-b from-orange-50/50 to-white shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-swiggy-orange uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Judge & Competition Demo Mode</span>
            </div>
            <CardTitle className="text-base">Instant Student Personas</CardTitle>
            <CardDescription className="text-xs">
              Select any student persona to test multi-user group orders immediately:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {personas.map((p) => {
              const isSelected = p.id === currentUser.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPersona(p.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-swiggy-orange bg-swiggy-light/60 font-semibold'
                      : 'border-charcoal-100 hover:border-charcoal-300 hover:bg-charcoal-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden relative border border-white">
                      <Image
                        src={p.avatar_url || ''}
                        alt={p.full_name}
                        width={32}
                        height={32}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-charcoal-900 flex items-center gap-1.5">
                        {p.full_name}
                        {p.id.endsWith('1') && (
                          <span className="text-[10px] text-swiggy-orange font-bold">(Admin)</span>
                        )}
                      </p>
                      <p className="text-[10px] text-charcoal-500">
                        {p.academic_year} • {p.dietary_pref}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-charcoal-400" />
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Standard Email Sign-In */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sign In with College Email</CardTitle>
            <CardDescription className="text-xs">
              Enter your student email (.edu or campus address)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@bits-pilani.ac.in"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {message && (
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-swiggy-dark font-medium">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                variant="secondary"
                size="md"
                className="w-full rounded-xl text-xs font-bold"
                isLoading={isSubmitting}
              >
                Continue to Campus Circles
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
