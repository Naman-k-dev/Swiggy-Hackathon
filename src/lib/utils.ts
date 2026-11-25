import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format integer paise into Indian Rupee display (e.g. 17900 -> ₹179 or ₹179.50)
 */
export function formatPaise(paise: number, showDecimalsIfZero = false): string {
  const rupees = paise / 100;
  if (showDecimalsIfZero || paise % 100 !== 0) {
    return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₹${rupees.toLocaleString('en-IN')}`;
}

/**
 * Format a number in rupees directly
 */
export function formatRupees(rupees: number): string {
  return `₹${rupees.toLocaleString('en-IN')}`;
}

/**
 * Generate a random 6-character alphanumeric invite code (e.g. CAMPUS, FOOD88)
 */
export function generateInviteCode(length = 6): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Calculate per-member breakdown with equitable distribution of delivery fees & platform discounts
 */
export function calculateMemberSplit<
  T extends { user_id: string; user_name: string; user_avatar?: string; item_price_paise: number; quantity: number }
>(
  items: T[],
  deliveryFeePaise: number,
  platformFeePaise: number,
  discountPaise: number
) {
  const memberMap = new Map<string, {
    user_id: string;
    user_name: string;
    user_avatar?: string;
    items_count: number;
    subtotal_paise: number;
    share_paise: number;
    items: T[];
  }>();

  for (const item of items) {
    const itemTotal = item.item_price_paise * item.quantity;

    const existing = memberMap.get(item.user_id) || {
      user_id: item.user_id,
      user_name: item.user_name,
      user_avatar: item.user_avatar,
      items_count: 0,
      subtotal_paise: 0,
      share_paise: 0,
      items: [] as T[],
    };

    existing.items_count += item.quantity;
    existing.subtotal_paise += itemTotal;
    existing.items.push(item);
    memberMap.set(item.user_id, existing);
  }

  const memberCount = memberMap.size;
  if (memberCount === 0) return [];

  // Split shared extra fee/discount equally among participating members
  const netExtrasPaise = deliveryFeePaise + platformFeePaise - discountPaise;
  const perMemberExtra = Math.round(netExtrasPaise / memberCount);

  const breakdowns = Array.from(memberMap.values()).map((m) => {
    return {
      ...m,
      share_paise: Math.max(0, m.subtotal_paise + perMemberExtra),
    };
  });

  return breakdowns;
}
