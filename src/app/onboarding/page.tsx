'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/demo-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DietaryPref } from '@/types';
import { Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, updateProfile } = useApp();

  const [fullName, setFullName] = useState(currentUser.full_name);
  const [college, setCollege] = useState(currentUser.college);
  const [academicYear, setAcademicYear] = useState(currentUser.academic_year || '3rd Year B.Tech');
  const [dietaryPref, setDietaryPref] = useState<DietaryPref>(currentUser.dietary_pref || 'BOTH');
  const [preferredBudget, setPreferredBudget] = useState(currentUser.preferred_budget || 200);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateProfile({
      full_name: fullName.trim() || currentUser.full_name,
      college: college.trim() || currentUser.college,
      academic_year: academicYear,
      dietary_pref: dietaryPref,
      preferred_budget: Number(preferredBudget),
    });

    setIsSaved(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  const years = [
    '1st Year B.Tech / UG',
    '2nd Year B.Tech / UG',
    '3rd Year B.Tech / UG',
    '4th Year B.Tech / UG',
    'Postgraduate / Ph.D.',
  ];

  const colleges = [
    'BITS Pilani - Hyderabad Campus',
    'BITS Pilani - Pilani Campus',
    'BITS Pilani - Goa Campus',
    'IIT Delhi',
    'IIT Bombay',
    'IIIT Hyderabad',
    'Manipal University',
    'VIT Vellore',
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-swiggy-light text-swiggy-dark text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-swiggy-orange" />
            Step 2 of 2: Student Profile
          </span>
          <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Customize Your Dining Preferences
          </h1>
          <p className="text-sm text-charcoal-500 max-w-md mx-auto">
            These help your circle suggest the right restaurants and stay within budget.
          </p>
        </div>

        <Card className="rounded-3xl shadow-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full px-4 py-3 rounded-2xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange font-medium"
                required
              />
            </div>

            {/* College Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                College Campus
              </label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange font-medium bg-white"
              >
                {colleges.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                Academic Year
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {years.map((yr) => (
                  <button
                    type="button"
                    key={yr}
                    onClick={() => setAcademicYear(yr)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition ${
                      academicYear === yr
                        ? 'border-swiggy-orange bg-swiggy-light text-swiggy-dark'
                        : 'border-charcoal-200 hover:bg-charcoal-50 text-charcoal-700'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Preference */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                Dietary Preference
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDietaryPref('VEG')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition ${
                    dietaryPref === 'VEG'
                      ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-800'
                      : 'border-charcoal-200 hover:bg-charcoal-50 text-charcoal-700'
                  }`}
                >
                  <span className="veg-icon !w-4 !h-4" />
                  <span className="text-xs">Strictly Veg</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDietaryPref('NON_VEG')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition ${
                    dietaryPref === 'NON_VEG'
                      ? 'border-red-500 bg-red-50 font-bold text-red-800'
                      : 'border-charcoal-200 hover:bg-charcoal-50 text-charcoal-700'
                  }`}
                >
                  <span className="non-veg-icon !w-4 !h-4" />
                  <span className="text-xs">Non-Veg</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDietaryPref('BOTH')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition ${
                    dietaryPref === 'BOTH'
                      ? 'border-swiggy-orange bg-swiggy-light font-bold text-swiggy-dark'
                      : 'border-charcoal-200 hover:bg-charcoal-50 text-charcoal-700'
                  }`}
                >
                  <span className="text-base">🥗🍗</span>
                  <span className="text-xs">Flexible / Both</span>
                </button>
              </div>
            </div>

            {/* Per-Meal Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                  Target Per-Meal Budget
                </label>
                <span className="text-sm font-black text-swiggy-orange">
                  ₹{preferredBudget}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="500"
                step="20"
                value={preferredBudget}
                onChange={(e) => setPreferredBudget(Number(e.target.value))}
                className="w-full accent-swiggy-orange cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-charcoal-400 font-medium">
                <span>₹100 (Hostel Budget)</span>
                <span>₹250 (Standard)</span>
                <span>₹500 (Feast)</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-2xl font-bold text-sm shadow-md"
              isLoading={isSaved}
            >
              Save Preferences & Enter Dashboard
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
