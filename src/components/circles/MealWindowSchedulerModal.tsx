'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store/demo-context';
import { DEMO_RESTAURANTS } from '@/lib/data/mock-restaurants';
import { MealType, RecurrencePattern } from '@/types';
import {
  Calendar,
  Clock,
  MapPin,
  Utensils,
  Sparkles,
  Repeat,
  CheckCircle2,
} from 'lucide-react';

interface MealWindowSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
}

const PRESET_MEALS: Array<{
  mealType: MealType;
  title: string;
  targetTime: string;
  cutoffMinutes: number;
  recurrence: RecurrencePattern;
  pickupPoint: string;
  defaultRestId: string;
  description: string;
}> = [
  {
    mealType: 'Lunch',
    title: 'Daily Post-Lab Lunch',
    targetTime: '13:15',
    cutoffMinutes: 30,
    recurrence: 'weekdays',
    pickupPoint: 'Academic Block 1 - Main Portico',
    defaultRestId: 'rest-rolls-bowls',
    description: 'Post-class coordinated lunch with your circle',
  },
  {
    mealType: 'Snacks',
    title: 'Evening Chai & Snacks Break',
    targetTime: '17:30',
    cutoffMinutes: 20,
    recurrence: 'weekdays',
    pickupPoint: 'Library Lawn Gate',
    defaultRestId: 'rest-chai-bytes',
    description: 'Samosas, tea, and quick bites between study sessions',
  },
  {
    mealType: 'Dinner',
    title: 'Hostel Late-Night Dinner',
    targetTime: '20:45',
    cutoffMinutes: 45,
    recurrence: 'daily',
    pickupPoint: 'Hostel Block C - Ground Floor Reception',
    defaultRestId: 'rest-spice-symphony',
    description: 'Daily biryani, rolls, and curries delivered right to the hostel gate',
  },
];

export function MealWindowSchedulerModal({
  isOpen,
  onClose,
  circleId,
}: MealWindowSchedulerModalProps) {
  const { scheduleMealWindow } = useApp();

  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(0);
  const [mealType, setMealType] = useState<MealType>('Lunch');
  const [title, setTitle] = useState(PRESET_MEALS[0].title);
  const [targetTime, setTargetTime] = useState(PRESET_MEALS[0].targetTime);
  const [cutoffMinutes, setCutoffMinutes] = useState(PRESET_MEALS[0].cutoffMinutes);
  const [recurrence, setRecurrence] = useState<RecurrencePattern>(PRESET_MEALS[0].recurrence);
  const [restaurantId, setRestaurantId] = useState(PRESET_MEALS[0].defaultRestId);
  const [pickupPoint, setPickupPoint] = useState(PRESET_MEALS[0].pickupPoint);
  const [openImmediately, setOpenImmediately] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const preset = PRESET_MEALS[idx];
    setMealType(preset.mealType);
    setTitle(preset.title);
    setTargetTime(preset.targetTime);
    setCutoffMinutes(preset.cutoffMinutes);
    setRecurrence(preset.recurrence);
    setPickupPoint(preset.pickupPoint);
    setRestaurantId(preset.defaultRestId);
  };

  const handleCustomMode = () => {
    setSelectedPresetIndex(null);
    setMealType('Custom');
    setTitle('Custom Circle Meal Window');
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();

    scheduleMealWindow({
      circleId,
      mealType,
      title: title.trim() || 'Scheduled Meal Window',
      targetTime,
      cutoffMinutesBefore: cutoffMinutes,
      recurrence,
      restaurantId,
      pickupPoint: pickupPoint.trim() || 'Campus Main Reception',
      startSessionImmediately: openImmediately,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recurring Campus Meal Window">
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-4 border border-orange-200/70">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-swiggy-orange text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-charcoal-900">
                  Fixed Campus Break Scheduler
                </h4>
                <Badge variant="orange" size="sm">
                  Differentiator
                </Badge>
              </div>
              <p className="text-xs text-charcoal-600 mt-0.5 leading-relaxed">
                Schedule recurring meal windows tailored to PW IOI class breaks and hostel schedules.
                Members can declare participation, set custom budgets, and beat delivery charges together.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2">
            1. Select a Campus Preset or Custom
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {PRESET_MEALS.map((preset, idx) => {
              const isSelected = selectedPresetIndex === idx;
              return (
                <button
                  type="button"
                  key={preset.title}
                  onClick={() => handleSelectPreset(idx)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-swiggy-orange bg-swiggy-light/40 shadow-xs ring-1 ring-swiggy-orange'
                      : 'border-charcoal-100 bg-white hover:border-charcoal-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-charcoal-900">
                      {preset.mealType === 'Lunch' ? '🍱' : preset.mealType === 'Dinner' ? '🌙' : '☕'}{' '}
                      {preset.mealType}
                    </span>
                    <span className="text-[10px] font-bold text-swiggy-dark bg-white px-2 py-0.5 rounded-full border border-orange-200">
                      {preset.targetTime} IST
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-charcoal-600 mt-1 line-clamp-1">
                    {preset.title}
                  </p>
                  <p className="text-[10px] text-charcoal-400 mt-0.5 capitalize">
                    {preset.recurrence} • {preset.cutoffMinutes}m cutoff
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={handleCustomMode}
              className={`text-xs font-bold transition ${
                selectedPresetIndex === null
                  ? 'text-swiggy-orange underline'
                  : 'text-charcoal-500 hover:text-charcoal-800'
              }`}
            >
              + Create Custom Window
            </button>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              Window Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange"
              placeholder="e.g. CSE Batch Daily Lunch"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">
                Meal Target Time (Asia/Kolkata)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">
                Order Cutoff Lead Time
              </label>
              <select
                value={cutoffMinutes}
                onChange={(e) => setCutoffMinutes(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange bg-white"
              >
                <option value={15}>15 minutes before meal</option>
                <option value={30}>30 minutes before meal (Recommended)</option>
                <option value={45}>45 minutes before meal</option>
                <option value={60}>60 minutes before meal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">
                Recurrence Pattern
              </label>
              <div className="relative">
                <Repeat className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as RecurrencePattern)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange bg-white"
                >
                  <option value="daily">Every Day (Including Weekends)</option>
                  <option value="weekdays">Mon to Fri (College Weekdays)</option>
                  <option value="none">One-Time Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">
                Preferred Restaurant
              </label>
              <div className="relative">
                <Utensils className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange bg-white"
                >
                  {DEMO_RESTAURANTS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.cuisine[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              Campus Collection Point (PW IOI Noida)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={pickupPoint}
                onChange={(e) => setPickupPoint(e.target.value)}
                placeholder="e.g. Academic Block 1 - Main Portico"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-swiggy-orange"
                required
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-50 border border-charcoal-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-charcoal-900">
                Activate ordering session immediately
              </p>
              <p className="text-[10px] text-charcoal-500">
                Opens the group cart right now with a {cutoffMinutes}-minute countdown
              </p>
            </div>
            <input
              type="checkbox"
              checked={openImmediately}
              onChange={(e) => setOpenImmediately(e.target.checked)}
              className="w-4 h-4 text-swiggy-orange rounded focus:ring-swiggy-orange"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="font-bold gap-2"
              disabled={isSuccess}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Scheduled!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save & Schedule Window</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
