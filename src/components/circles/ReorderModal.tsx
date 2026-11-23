'use client';

import React, { useState } from 'react';
import { DemoOrder, CartItem } from '@/types';
import { useApp } from '@/lib/store/demo-context';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPaise } from '@/lib/utils';
import { RotateCcw, Check, AlertCircle } from 'lucide-react';

interface ReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: DemoOrder;
  circleId: string;
}

export function ReorderModal({ isOpen, onClose, order, circleId }: ReorderModalProps) {
  const { startReorderSession, addToCart, currentUser } = useApp();

  // Track which items are checked to be reordered
  // Flatten past items
  const allPastItems: Array<CartItem & { memberName: string; memberAvatar?: string }> = [];
  order.member_breakdowns.forEach((mb) => {
    mb.items.forEach((item) => {
      allPastItems.push({
        ...item,
        memberName: mb.user_name,
        memberAvatar: mb.user_avatar,
      });
    });
  });

  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    allPastItems.forEach((item) => {
      initial[item.id] = true; // Selected by default
    });
    return initial;
  });

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedCount = Object.values(selectedItemIds).filter(Boolean).length;

  const handleConfirmReorder = () => {
    try {
      const { session } = startReorderSession(order.id);

      // Add selected items to the new session
      allPastItems.forEach((item) => {
        if (selectedItemIds[item.id]) {
          addToCart(
            session.id,
            circleId,
            {
              id: item.item_id,
              name: item.item_name,
              price_paise: item.item_price_paise,
              is_veg: item.item_is_veg,
            },
            'Reordered from previous meal',
            item.user_id
          );
        }
      });

      onClose();
    } catch {
      alert('Unable to start reorder session. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔄 One-Click Squad Reorder">
      <div className="space-y-5">
        <div className="bg-orange-50/50 p-4 rounded-2xl border border-swiggy-soft flex items-center justify-between">
          <div>
            <Badge variant="orange" size="sm" className="font-bold text-[10px] mb-1">
              Previous Order: {order.order_code}
            </Badge>
            <h3 className="font-extrabold text-base text-charcoal-900">
              {order.restaurant_name}
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Original Total: {formatPaise(order.total_paise)} • {order.total_items_count} items
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white border border-swiggy-soft flex items-center justify-center text-xl shadow-xs">
            🍱
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-charcoal-900 uppercase tracking-wide">
              Review Past Selections ({selectedCount} selected)
            </span>
            <span className="text-charcoal-400">Uncheck any item to omit</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {allPastItems.map((item) => {
              const isSelected = selectedItemIds[item.id] !== false;
              const isMine = item.user_id === currentUser.id;

              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-swiggy-orange/30 shadow-xs'
                      : 'bg-charcoal-50 border-charcoal-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-swiggy-orange border-swiggy-orange text-white'
                          : 'border-charcoal-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        {item.item_is_veg ? (
                          <span className="veg-icon" />
                        ) : (
                          <span className="non-veg-icon" />
                        )}
                        <span className="font-bold text-xs text-charcoal-900">
                          {item.item_name}
                        </span>
                        {isMine && (
                          <Badge variant="orange" size="sm" className="text-[9px] py-0 px-1.5">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-charcoal-400 mt-0.5">
                        For {item.memberName}
                      </p>
                    </div>
                  </div>

                  <span className="font-black text-xs text-charcoal-900">
                    {formatPaise(item.item_price_paise)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Starting a reorder launches a new active order session for your circle. Every squad member can still add or customize their items in the live group cart.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-100">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmReorder}
            disabled={selectedCount === 0}
            className="rounded-xl font-black gap-1.5 shadow-md bg-swiggy-orange hover:bg-swiggy-hover text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Launch Reorder ({selectedCount} items)</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
