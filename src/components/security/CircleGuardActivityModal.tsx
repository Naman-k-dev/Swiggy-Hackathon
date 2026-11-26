'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  History,
  AlertCircle,
  CheckCircle,
  Lock,
  UserPlus,
  RefreshCcw,
  ChevronRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface SecurityEvent {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}

export function CircleGuardActivityModal({ isOpen, onClose, userId }: { isOpen: boolean, onClose: () => void, userId: string }) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/security/audit?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to fetch security events', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen, fetchEvents]);

  const getEventIcon = (action: string, severity: string) => {
    if (severity === 'warning' || severity === 'critical') return <AlertCircle className="text-red-500" size={18} />;
    if (action.includes('Approved') || action.includes('Joined') || action.includes('Successful')) return <CheckCircle className="text-green-500" size={18} />;
    if (action.includes('Locked')) return <Lock className="text-amber-500" size={18} />;
    if (action.includes('Join Request')) return <UserPlus className="text-blue-500" size={18} />;
    return <Info className="text-neutral-400" size={18} />;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CircleGuard Security Center">
      <div className="space-y-6 pb-6">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-6 rounded-2xl text-white space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Shield className="text-orange-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400 font-medium">Security Status</p>
              <h3 className="text-xl font-bold">Hardened & Protected</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">RLS Protection</p>
              <p className="text-sm font-semibold flex items-center gap-1 mt-1">
                <CheckCircle size={12} className="text-green-400" /> Active
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Audit Logging</p>
              <p className="text-sm font-semibold flex items-center gap-1 mt-1">
                <CheckCircle size={12} className="text-green-400" /> Enabled
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-neutral-900 flex items-center gap-2">
              <History size={18} /> Recent Activity
            </h3>
            <Button variant="ghost" size="sm" onClick={fetchEvents} className="h-8 text-xs gap-1 text-neutral-500">
              <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-neutral-50 rounded-xl border border-neutral-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-center gap-4 p-3 bg-white border border-neutral-100 rounded-xl hover:border-neutral-200 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    event.severity === 'warning' ? 'bg-red-50' :
                    event.severity === 'critical' ? 'bg-red-100' : 'bg-neutral-50'
                  }`}>
                    {getEventIcon(event.action, event.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-neutral-900 truncate">{event.action}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-neutral-500 uppercase font-medium">{event.resourceType}</p>
                      <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                      <p className="text-[10px] text-neutral-400">{new Date(event.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-neutral-300" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 space-y-2">
          <p className="text-xs font-bold text-orange-900 flex items-center gap-1">
            <AlertCircle size={14} /> Safety Disclaimer
          </p>
          <p className="text-[10px] text-orange-800 leading-relaxed">
            CircleGuard monitors for suspicious activity to keep our campus food community safe. We never log your clear-text passwords, private keys, or full payment details. Audit logs are retained for 30 days.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl h-12 text-sm font-bold gap-2">
            <Shield size={16} /> Privacy Controls
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl h-12 text-sm font-bold gap-2">
            <Lock size={16} /> Account Security
          </Button>
        </div>
      </div>
    </Modal>
  );
}
