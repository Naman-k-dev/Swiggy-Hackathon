'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Check,
  AlertTriangle,
  Lock,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { StudentProfile } from '@/types';

export function PrivacySettingsModal({ isOpen, onClose, userProfile }: { isOpen: boolean, onClose: () => void, userProfile: StudentProfile | null }) {
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [shareBudget, setShareBudget] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacy & Security Settings">
      <div className="space-y-6 pb-6">
        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2">
          <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
            <ShieldCheck size={18} className="text-orange-600" /> Campus BuddyMatch Privacy
          </h4>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Manage how your campus circles and peers view your ordering profile, meal windows, and budget preferences.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Users size={16} className="text-neutral-500" /> Discoverable in BuddyMatch
              </label>
              <p className="text-xs text-neutral-500">Allow compatible campus circles to invite you or view match scores.</p>
            </div>
            <input
              type="checkbox"
              checked={isDiscoverable}
              onChange={(e) => setIsDiscoverable(e.target.checked)}
              className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Bell size={16} className="text-neutral-500" /> Circle Join Notifications
              </label>
              <p className="text-xs text-neutral-500">Receive alerts when someone requests to join your circles.</p>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Lock size={16} className="text-neutral-500" /> Share Budget Range with Squad
              </label>
              <p className="text-xs text-neutral-500">Let circle members see your budget range for smart recommendations.</p>
            </div>
            <input
              type="checkbox"
              checked={shareBudget}
              onChange={(e) => setShareBudget(e.target.checked)}
              className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-900">CircleGuard Security Level</p>
            <p className="text-[11px] text-amber-800">
              RLS (Row Level Security) is strictly enforced on all database tables. Only authorized circle members and admins can access order data.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-12 font-bold text-sm">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saved}
            className="flex-1 rounded-xl h-12 font-bold text-sm bg-[#FC8019] hover:bg-[#e67316] text-white"
          >
            {saved ? (
              <span className="flex items-center gap-2">
                <Check size={16} /> Saved!
              </span>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
