'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  Wallet,
  CheckCircle2,
  Info,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import type { StudentProfile } from '@/types';

interface Recommendation {
  circleId: string;
  circleName: string;
  score: number;
  explanation: string;
  isCompatible: boolean;
}

export function BuddyMatchModal({ isOpen, onClose, userProfile }: { isOpen: boolean, onClose: () => void, userProfile: StudentProfile | null }) {
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [requestStatus, setRequestStatus] = useState<Record<string, string>>({});

  const handleOptIn = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    setIsOptedIn(true);
    setLoading(false);
    fetchRecommendations();
  };

  const fetchRecommendations = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/buddymatch/recommendations?userId=${userProfile.id}&college=${encodeURIComponent(userProfile.college || 'PW Institute of Innovation Noida')}`);
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (circleId: string) => {
    if (!userProfile) return;
    setRequestStatus(prev => ({ ...prev, [circleId]: 'pending' }));
    try {
      await fetch('/api/buddymatch/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userProfile.id, circleId, action: 'request' })
      });
      // Simulate success
      setTimeout(() => {
        setRequestStatus(prev => ({ ...prev, [circleId]: 'sent' }));
      }, 1000);
    } catch (err) {
      console.error('Failed to send join request', err);
      setRequestStatus(prev => ({ ...prev, [circleId]: 'idle' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Campus BuddyMatch">
      <div className="space-y-6 pb-6">
        {!isOptedIn ? (
          <div className="flex flex-col items-center text-center py-8 px-4 space-y-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <Users size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Find Your Food Squad</h2>
              <p className="text-neutral-600 max-w-xs mx-auto">
                Discover compatible campus circles and save on delivery fees. No more solo orders!
              </p>
            </div>

            <div className="w-full bg-neutral-50 rounded-xl p-4 border border-neutral-100 space-y-4">
              <div className="flex items-start gap-3 text-left">
                <div className="mt-1 text-orange-500"><ShieldCheck size={18} /></div>
                <div>
                  <p className="text-sm font-semibold">Privacy First</p>
                  <p className="text-xs text-neutral-500">Only discoverable circles you opt into see your basic meal preferences.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <div className="mt-1 text-orange-500"><Sparkles size={18} /></div>
                <div>
                  <p className="text-sm font-semibold">Smart Matching</p>
                  <p className="text-xs text-neutral-500">We match you based on meal times, budget, and cuisine interests.</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleOptIn}
              disabled={loading}
              className="w-full bg-[#FC8019] hover:bg-[#e67316] text-white py-6 rounded-xl font-bold text-lg shadow-lg"
            >
              {loading ? 'Setting up...' : 'Opt-in & Find Circles'}
            </Button>
            <p className="text-xs text-neutral-400">You can opt-out anytime from settings.</p>
          </div>
        ) : (
          <div className="space-y-6 px-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                Compatible Squads <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">{recommendations.length}</Badge>
              </h3>
              <Button variant="ghost" size="sm" className="text-neutral-500 text-xs gap-1">
                <Filter size={14} /> Filters
              </Button>
            </div>

            {loading ? (
              <div className="space-y-4 py-8 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-neutral-100 rounded-xl" />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Card key={rec.circleId} className="overflow-hidden border-neutral-200 shadow-sm hover:border-orange-200 transition-colors">
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-neutral-900">{rec.circleName}</h4>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                              {rec.score}% Match
                            </Badge>
                          </div>
                          <p className="text-xs text-neutral-500 mt-1">{rec.explanation}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <CheckCircle2 size={14} className="text-green-500" /> Verified Campus Circle
                        </span>
                        {requestStatus[rec.circleId] === 'sent' ? (
                          <Button size="sm" disabled className="bg-green-100 text-green-800 text-xs font-bold h-8">
                            Request Sent
                          </Button>
                        ) : requestStatus[rec.circleId] === 'pending' ? (
                          <Button size="sm" disabled className="bg-neutral-100 text-neutral-600 text-xs font-bold h-8">
                            Sending...
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleJoinRequest(rec.circleId)}
                            className="bg-[#FC8019] hover:bg-[#e67316] text-white text-xs font-bold h-8"
                          >
                            Request to Join
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <Info className="w-10 h-10 text-neutral-300 mx-auto" />
                <p className="text-sm font-medium text-neutral-600">No matching open circles found right now.</p>
                <p className="text-xs text-neutral-400">Try adjusting your preferences or create a new circle!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
