'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  StudentProfile,
  Circle,
  CircleMember,
  OrderingSession,
  CartItem,
  DemoOrder,
  Restaurant,
  MemberBreakdown,
} from '@/types';
import {
  DEMO_PERSONAS,
  INITIAL_CIRCLES,
  INITIAL_CIRCLE_MEMBERS,
  INITIAL_SESSIONS,
  INITIAL_CART_ITEMS,
  INITIAL_DEMO_ORDERS,
  DEFAULT_CAMPUS_NAME,
} from '@/lib/data/mock-seed';
import { DEMO_RESTAURANTS } from '@/lib/data/mock-restaurants';
import { generateInviteCode, calculateMemberSplit } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface AppContextType {
  // Current user & personas
  currentUser: StudentProfile;
  personas: StudentProfile[];
  switchPersona: (personaId: string) => void;
  updateProfile: (data: Partial<StudentProfile>) => void;

  // Circles
  circles: Circle[];
  createCircle: (data: {
    name: string;
    type: Circle['type'];
    college: string;
    description: string;
    emoji?: string;
    preferred_budget?: number;
  }) => Circle;
  getCircle: (circleId: string) => Circle | undefined;
  getCircleByInviteCode: (code: string) => Circle | undefined;
  joinCircle: (circleId: string) => { success: boolean; message: string };
  getUserCircles: () => Circle[];

  // Members
  getCircleMembers: (circleId: string) => (CircleMember & { profile: StudentProfile })[];
  isCircleAdmin: (circleId: string) => boolean;

  // Ordering Sessions
  getSession: (circleId: string) => OrderingSession | undefined;
  startSession: (circleId: string, restaurantId: string, cutoffMinutes?: number) => OrderingSession;
  lockSession: (sessionId: string) => void;
  reopenSession: (sessionId: string) => void;
  finalizeSession: (
    sessionId: string,
    deliveryLocation: string,
    instructions?: string
  ) => DemoOrder;

  // Cart
  cartItems: CartItem[];
  getSessionCartItems: (sessionId: string) => CartItem[];
  addToCart: (
    sessionId: string,
    circleId: string,
    item: {
      id: string;
      name: string;
      price_paise: number;
      is_veg: boolean;
    },
    customization?: string,
    targetUserId?: string
  ) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;

  // Orders
  demoOrders: DemoOrder[];
  getOrder: (orderId: string) => DemoOrder | undefined;
  getOrdersForUser: () => DemoOrder[];

  // Restaurants
  restaurants: Restaurant[];
  getRestaurant: (id: string) => Restaurant | undefined;

  // Phase 3 High-Value Features & Budget Guardrails
  isLoaded: boolean;
  toggleMemberReady: (sessionId: string, userId?: string) => void;
  updatePickupNote: (sessionId: string, pickupNote: string) => void;
  startReorderSession: (orderId: string) => { session: OrderingSession; previousItems: CartItem[] };
  getMemberCartTotalPaise: (sessionId: string, userId: string) => number;
  getMemberRemainingBudgetPaise: (sessionId: string, userId: string, circleId: string) => number;

  // Reset & Status
  isRealtimeConnected: boolean;
  isSupabaseActive: boolean;
  resetDemoData: () => void;
}

const STORAGE_KEYS = {
  USER: 'scc_current_user_v1',
  CIRCLES: 'scc_circles_v1',
  MEMBERS: 'scc_members_v1',
  SESSIONS: 'scc_sessions_v1',
  CART: 'scc_cart_v1',
  ORDERS: 'scc_orders_v1',
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // State
  const [currentUser, setCurrentUser] = useState<StudentProfile>(DEMO_PERSONAS[0]);
  const [circles, setCircles] = useState<Circle[]>(INITIAL_CIRCLES);
  const [members, setMembers] = useState<CircleMember[]>(INITIAL_CIRCLE_MEMBERS);
  const [sessions, setSessions] = useState<OrderingSession[]>(INITIAL_SESSIONS);
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [demoOrders, setDemoOrders] = useState<DemoOrder[]>(INITIAL_DEMO_ORDERS);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Initialize from LocalStorage if available
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedCircles = localStorage.getItem(STORAGE_KEYS.CIRCLES);
      const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.college === 'BITS Pilani - Hyderabad Campus') {
          parsed.college = DEFAULT_CAMPUS_NAME;
        }
        setCurrentUser(parsed);
      }
      if (storedCircles) {
        const parsedCircles: Circle[] = JSON.parse(storedCircles);
        const updatedCircles = parsedCircles.map((c) =>
          c.college === 'BITS Pilani - Hyderabad Campus'
            ? { ...c, college: DEFAULT_CAMPUS_NAME }
            : c
        );
        setCircles(updatedCircles);
      }
      if (storedMembers) setMembers(JSON.parse(storedMembers));
      if (storedSessions) setSessions(JSON.parse(storedSessions));
      if (storedCart) setCartItems(JSON.parse(storedCart));
      if (storedOrders) setDemoOrders(JSON.parse(storedOrders));
    } catch {
      // localStorage read fallback
    }
    setMounted(true);
  }, []);

  // Sync to LocalStorage
  const persistState = useCallback(
    (
      u = currentUser,
      c = circles,
      m = members,
      s = sessions,
      cart = cartItems,
      o = demoOrders
    ) => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
        localStorage.setItem(STORAGE_KEYS.CIRCLES, JSON.stringify(c));
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(m));
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(s));
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(o));
      } catch {
        // LocalStorage save error
      }
    },
    [currentUser, circles, members, sessions, cartItems, demoOrders]
  );

  // Broadcast Channel for cross-tab realtime sync on same machine
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const channel = new BroadcastChannel('swiggy_campus_circles_sync');

    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'SYNC_ALL') {
        if (payload.circles) setCircles(payload.circles);
        if (payload.members) setMembers(payload.members);
        if (payload.sessions) setSessions(payload.sessions);
        if (payload.cartItems) setCartItems(payload.cartItems);
        if (payload.demoOrders) setDemoOrders(payload.demoOrders);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Broadcast state updates to other tabs
  const broadcastUpdate = useCallback(
    (payload: {
      circles?: Circle[];
      members?: CircleMember[];
      sessions?: OrderingSession[];
      cartItems?: CartItem[];
      demoOrders?: DemoOrder[];
    }) => {
      if (typeof window === 'undefined') return;
      try {
        const channel = new BroadcastChannel('swiggy_campus_circles_sync');
        channel.postMessage({ type: 'SYNC_ALL', payload });
        channel.close();
      } catch {
        // broadcast fallback
      }
    },
    []
  );

  // Supabase Realtime synchronization listener (if configured)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel('campus_circles_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cart_items' },
        () => {
          // In real Supabase mode, re-fetch or apply updates
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, []);

  // Switch active persona
  const switchPersona = useCallback(
    (personaId: string) => {
      const target = DEMO_PERSONAS.find((p) => p.id === personaId);
      if (target) {
        setCurrentUser(target);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(target));
        }
      }
    },
    []
  );

  // Update profile
  const updateProfile = useCallback(
    (data: Partial<StudentProfile>) => {
      setCurrentUser((prev) => {
        const updated = { ...prev, ...data, updated_at: new Date().toISOString() };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
        }
        return updated;
      });
    },
    []
  );

  // Create circle
  const createCircle = useCallback(
    (data: {
      name: string;
      type: Circle['type'];
      college: string;
      description: string;
      emoji?: string;
      preferred_budget?: number;
    }): Circle => {
      const newCircleId = `circle-${Date.now()}`;
      const inviteCode = generateInviteCode(6);

      const gradients = [
        'from-orange-500 to-amber-500',
        'from-rose-500 to-orange-500',
        'from-emerald-500 to-teal-500',
        'from-indigo-500 to-blue-500',
        'from-purple-500 to-pink-500',
      ];
      const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

      const newCircle: Circle = {
        id: newCircleId,
        name: data.name,
        type: data.type,
        college: data.college,
        description: data.description,
        emoji: data.emoji || '🍕',
        banner_gradient: randomGradient,
        invite_code: inviteCode,
        preferred_budget: data.preferred_budget || 200,
        admin_id: currentUser.id,
        created_at: new Date().toISOString(),
        member_count: 1,
      };

      const adminMembership: CircleMember = {
        id: `cm-${Date.now()}`,
        circle_id: newCircleId,
        user_id: currentUser.id,
        role: 'admin',
        joined_at: new Date().toISOString(),
      };

      const updatedCircles = [newCircle, ...circles];
      const updatedMembers = [...members, adminMembership];

      setCircles(updatedCircles);
      setMembers(updatedMembers);
      persistState(currentUser, updatedCircles, updatedMembers);
      broadcastUpdate({ circles: updatedCircles, members: updatedMembers });

      return newCircle;
    },
    [currentUser, circles, members, persistState, broadcastUpdate]
  );

  // Get circle by ID
  const getCircle = useCallback(
    (circleId: string) => {
      const circle = circles.find((c) => c.id === circleId);
      if (!circle) return undefined;
      const count = members.filter((m) => m.circle_id === circleId).length;
      return { ...circle, member_count: count };
    },
    [circles, members]
  );

  // Get circle by invite code
  const getCircleByInviteCode = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      const circle = circles.find((c) => c.invite_code.toUpperCase() === normalized);
      if (!circle) return undefined;
      const count = members.filter((m) => m.circle_id === circle.id).length;
      return { ...circle, member_count: count };
    },
    [circles, members]
  );

  // Join circle
  const joinCircle = useCallback(
    (circleId: string) => {
      const circle = circles.find((c) => c.id === circleId);
      if (!circle) return { success: false, message: 'Circle not found' };

      const existing = members.find(
        (m) => m.circle_id === circleId && m.user_id === currentUser.id
      );
      if (existing) {
        return { success: true, message: 'Already a member of this Circle' };
      }

      const newMembership: CircleMember = {
        id: `cm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        circle_id: circleId,
        user_id: currentUser.id,
        role: 'member',
        joined_at: new Date().toISOString(),
      };

      const updatedMembers = [...members, newMembership];
      setMembers(updatedMembers);
      persistState(currentUser, circles, updatedMembers);
      broadcastUpdate({ members: updatedMembers });

      return { success: true, message: `Successfully joined ${circle.name}!` };
    },
    [circles, members, currentUser, persistState, broadcastUpdate]
  );

  // User circles
  const getUserCircles = useCallback(() => {
    const userCircleIds = new Set(
      members.filter((m) => m.user_id === currentUser.id).map((m) => m.circle_id)
    );
    return circles
      .filter((c) => userCircleIds.has(c.id))
      .map((c) => ({
        ...c,
        member_count: members.filter((m) => m.circle_id === c.id).length,
      }));
  }, [circles, members, currentUser]);

  // Circle members with profile enrichment
  const getCircleMembers = useCallback(
    (circleId: string) => {
      const circleMemberships = members.filter((m) => m.circle_id === circleId);
      return circleMemberships.map((m) => {
        const found = DEMO_PERSONAS.find((p) => p.id === m.user_id) || {
          id: m.user_id,
          full_name: m.user_id === currentUser.id ? currentUser.full_name : 'Fellow Student',
          email: `${m.user_id}@campus.edu`,
          avatar_url:
            m.user_id === currentUser.id
              ? currentUser.avatar_url
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          college: currentUser.college,
          academic_year: 'Student',
          dietary_pref: 'BOTH' as const,
          preferred_budget: 200,
        };
        return { ...m, profile: found };
      });
    },
    [members, currentUser]
  );

  // Check if current user is circle admin
  const isCircleAdmin = useCallback(
    (circleId: string) => {
      const member = members.find(
        (m) => m.circle_id === circleId && m.user_id === currentUser.id
      );
      if (member?.role === 'admin') return true;
      const circle = circles.find((c) => c.id === circleId);
      return circle?.admin_id === currentUser.id;
    },
    [members, circles, currentUser]
  );

  // Ordering Session
  const getSession = useCallback(
    (circleId: string) => {
      return sessions.find(
        (s) => s.circle_id === circleId && (s.status === 'open' || s.status === 'locked')
      );
    },
    [sessions]
  );

  const startSession = useCallback(
    (circleId: string, restaurantId: string, cutoffMinutes = 30): OrderingSession => {
      const rest = DEMO_RESTAURANTS.find((r) => r.id === restaurantId);
      const restaurantName = rest ? rest.name : 'Campus Partner';
      const restaurantImage = rest ? rest.image : '';

      const newSession: OrderingSession = {
        id: `sess-${Date.now()}`,
        circle_id: circleId,
        created_by: currentUser.id,
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        restaurant_image: restaurantImage,
        status: 'open',
        cutoff_time: new Date(Date.now() + cutoffMinutes * 60000).toISOString(),
        delivery_location: 'Hostel Main Gate / Common Reception',
        created_at: new Date().toISOString(),
      };

      // Close previous sessions for this circle
      const updatedSessions = sessions
        .map((s) => (s.circle_id === circleId && s.status === 'open' ? { ...s, status: 'cancelled' as const } : s))
        .concat(newSession);

      setSessions(updatedSessions);
      persistState(currentUser, circles, members, updatedSessions);
      broadcastUpdate({ sessions: updatedSessions });

      return newSession;
    },
    [currentUser, sessions, circles, members, persistState, broadcastUpdate]
  );

  const lockSession = useCallback(
    (sessionId: string) => {
      const updated = sessions.map((s) =>
        s.id === sessionId ? { ...s, status: 'locked' as const, updated_at: new Date().toISOString() } : s
      );
      setSessions(updated);
      persistState(currentUser, circles, members, updated);
      broadcastUpdate({ sessions: updated });
    },
    [sessions, currentUser, circles, members, persistState, broadcastUpdate]
  );

  const reopenSession = useCallback(
    (sessionId: string) => {
      const updated = sessions.map((s) =>
        s.id === sessionId ? { ...s, status: 'open' as const, updated_at: new Date().toISOString() } : s
      );
      setSessions(updated);
      persistState(currentUser, circles, members, updated);
      broadcastUpdate({ sessions: updated });
    },
    [sessions, currentUser, circles, members, persistState, broadcastUpdate]
  );

  // Feature A: Member Ready Status
  const toggleMemberReady = useCallback(
    (sessionId: string, userId = currentUser.id) => {
      setSessions((prev) => {
        const updated = prev.map((s) => {
          if (s.id !== sessionId) return s;
          const currentReady = s.ready_member_ids || [];
          const isReady = currentReady.includes(userId);
          const nextReady = isReady
            ? currentReady.filter((id) => id !== userId)
            : [...currentReady, userId];
          return { ...s, ready_member_ids: nextReady, updated_at: new Date().toISOString() };
        });
        persistState(currentUser, circles, members, updated);
        broadcastUpdate({ sessions: updated });
        return updated;
      });
    },
    [currentUser, circles, members, persistState, broadcastUpdate]
  );

  // Feature E: Campus Pickup Notes
  const updatePickupNote = useCallback(
    (sessionId: string, pickupNote: string) => {
      setSessions((prev) => {
        const updated = prev.map((s) => {
          if (s.id !== sessionId) return s;
          return { ...s, pickup_note: pickupNote, updated_at: new Date().toISOString() };
        });
        persistState(currentUser, circles, members, updated);
        broadcastUpdate({ sessions: updated });
        return updated;
      });
    },
    [currentUser, circles, members, persistState, broadcastUpdate]
  );

  // Feature C: One-Click Reorder
  const startReorderSession = useCallback(
    (orderId: string) => {
      const order = demoOrders.find((o) => o.id === orderId || o.order_code === orderId);
      if (!order) throw new Error('Order not found');

      const rest = DEMO_RESTAURANTS.find((r) => r.id === order.restaurant_id);
      const restaurantName = rest ? rest.name : order.restaurant_name;
      const restaurantImage = rest ? rest.image : '';

      const newSession: OrderingSession = {
        id: `sess-${Date.now()}`,
        circle_id: order.circle_id,
        created_by: currentUser.id,
        restaurant_id: order.restaurant_id,
        restaurant_name: restaurantName,
        restaurant_image: restaurantImage,
        status: 'open',
        cutoff_time: new Date(Date.now() + 30 * 60000).toISOString(),
        delivery_location: order.delivery_location || 'Hostel Main Gate / Common Reception',
        pickup_note: order.delivery_instructions,
        ready_member_ids: [],
        created_at: new Date().toISOString(),
      };

      const updatedSessions = sessions
        .map((s) => (s.circle_id === order.circle_id && s.status === 'open' ? { ...s, status: 'cancelled' as const } : s))
        .concat(newSession);

      setSessions(updatedSessions);
      persistState(currentUser, circles, members, updatedSessions);
      broadcastUpdate({ sessions: updatedSessions });

      const previousItems: CartItem[] = [];
      order.member_breakdowns.forEach((mb) => {
        mb.items.forEach((item) => {
          previousItems.push({
            ...item,
            id: `reorder-${item.item_id}-${mb.user_id}-${Date.now()}`,
            session_id: newSession.id,
          });
        });
      });

      return { session: newSession, previousItems };
    },
    [demoOrders, currentUser, sessions, circles, members, persistState, broadcastUpdate]
  );

  // Feature B: Smart Budget Guardrails calculations in integer paise
  const getMemberCartTotalPaise = useCallback(
    (sessionId: string, userId: string) => {
      return cartItems
        .filter((ci) => ci.session_id === sessionId && ci.user_id === userId)
        .reduce((sum, item) => sum + item.item_price_paise * item.quantity, 0);
    },
    [cartItems]
  );

  const getMemberRemainingBudgetPaise = useCallback(
    (sessionId: string, userId: string, circleId: string) => {
      const circle = circles.find((c) => c.id === circleId);
      const user = DEMO_PERSONAS.find((p) => p.id === userId) || currentUser;
      const budgetPaise = (user.preferred_budget || circle?.preferred_budget || 200) * 100;
      const spentPaise = getMemberCartTotalPaise(sessionId, userId);
      return Math.max(0, budgetPaise - spentPaise);
    },
    [circles, currentUser, getMemberCartTotalPaise]
  );

  // Cart operations
  const getSessionCartItems = useCallback(
    (sessionId: string) => {
      return cartItems.filter((i) => i.session_id === sessionId);
    },
    [cartItems]
  );

  const addToCart = useCallback(
    (
      sessionId: string,
      circleId: string,
      item: { id: string; name: string; price_paise: number; is_veg: boolean },
      customization?: string,
      targetUserId?: string
    ) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (session && session.status !== 'open') {
        alert('This order session is locked or finalized.');
        return;
      }

      const effectiveUserId = targetUserId || currentUser.id;
      const targetProfile =
        DEMO_PERSONAS.find((p) => p.id === effectiveUserId) || currentUser;

      setCartItems((prev) => {
        // Check if user already has identical item
        const existingIndex = prev.findIndex(
          (ci) =>
            ci.session_id === sessionId &&
            ci.user_id === effectiveUserId &&
            ci.item_id === item.id &&
            (ci.customization || '') === (customization || '')
        );

        let updated: CartItem[];
        if (existingIndex > -1) {
          updated = prev.map((ci, idx) =>
            idx === existingIndex ? { ...ci, quantity: ci.quantity + 1 } : ci
          );
        } else {
          const newItem: CartItem = {
            id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            session_id: sessionId,
            circle_id: circleId,
            user_id: effectiveUserId,
            user_name: targetProfile.full_name,
            user_avatar: targetProfile.avatar_url,
            item_id: item.id,
            item_name: item.name,
            item_price_paise: item.price_paise,
            item_is_veg: item.is_veg,
            quantity: 1,
            customization: customization || undefined,
            created_at: new Date().toISOString(),
          };
          updated = [...prev, newItem];
        }

        persistState(currentUser, circles, members, sessions, updated);
        broadcastUpdate({ cartItems: updated });
        return updated;
      });
    },
    [currentUser, sessions, circles, members, persistState, broadcastUpdate]
  );

  const updateCartQuantity = useCallback(
    (cartItemId: string, delta: number) => {
      setCartItems((prev) => {
        const item = prev.find((ci) => ci.id === cartItemId);
        if (!item) return prev;

        const session = sessions.find((s) => s.id === item.session_id);
        if (session && session.status !== 'open') {
          return prev;
        }

        let updated: CartItem[];
        if (item.quantity + delta <= 0) {
          updated = prev.filter((ci) => ci.id !== cartItemId);
        } else {
          updated = prev.map((ci) =>
            ci.id === cartItemId ? { ...ci, quantity: ci.quantity + delta } : ci
          );
        }

        persistState(currentUser, circles, members, sessions, updated);
        broadcastUpdate({ cartItems: updated });
        return updated;
      });
    },
    [sessions, currentUser, circles, members, persistState, broadcastUpdate]
  );

  const removeFromCart = useCallback(
    (cartItemId: string) => {
      setCartItems((prev) => {
        const updated = prev.filter((ci) => ci.id !== cartItemId);
        persistState(currentUser, circles, members, sessions, updated);
        broadcastUpdate({ cartItems: updated });
        return updated;
      });
    },
    [currentUser, circles, members, sessions, persistState, broadcastUpdate]
  );

  // Finalize order (Simulated Checkout)
  const finalizeSession = useCallback(
    (sessionId: string, deliveryLocation: string, instructions?: string): DemoOrder => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) throw new Error('Session not found');

      const circle = circles.find((c) => c.id === session.circle_id);
      const items = cartItems.filter((i) => i.session_id === sessionId);

      if (items.length === 0) {
        throw new Error('Cannot finalize an empty cart');
      }

      // Calculate totals in integer paise
      const subtotalPaise = items.reduce(
        (sum, item) => sum + item.item_price_paise * item.quantity,
        0
      );
      const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

      // Student discount: delivery fee waived if total > ₹400 (40000 paise)
      const deliveryFeePaise = subtotalPaise > 40000 ? 0 : 3000;
      const platformFeePaise = 500; // ₹5 demo fee
      const discountPaise = subtotalPaise > 50000 ? 5000 : 0; // ₹50 off on ₹500+
      const totalPaise = subtotalPaise + deliveryFeePaise + platformFeePaise - discountPaise;

      // Calculate per member breakdown
      const breakdowns = calculateMemberSplit(
        items,
        deliveryFeePaise,
        platformFeePaise,
        discountPaise
      );

      const orderCode = `SW-CAMPUS-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder: DemoOrder = {
        id: `order-${Date.now()}`,
        order_code: orderCode,
        circle_id: session.circle_id,
        circle_name: circle ? circle.name : 'Campus Circle',
        session_id: sessionId,
        placed_by_id: currentUser.id,
        placed_by_name: currentUser.full_name,
        restaurant_name: session.restaurant_name,
        restaurant_id: session.restaurant_id,
        subtotal_paise: subtotalPaise,
        delivery_fee_paise: deliveryFeePaise,
        platform_fee_paise: platformFeePaise,
        discount_paise: discountPaise,
        total_paise: totalPaise,
        total_items_count: totalItemsCount,
        status: 'placed',
        delivery_location: deliveryLocation || session.delivery_location,
        delivery_instructions: instructions,
        member_breakdowns: breakdowns as MemberBreakdown[],
        created_at: new Date().toISOString(),
      };

      // Mark session finalized
      const updatedSessions = sessions.map((s) =>
        s.id === sessionId ? { ...s, status: 'finalized' as const, updated_at: new Date().toISOString() } : s
      );

      const updatedOrders = [newOrder, ...demoOrders];

      setSessions(updatedSessions);
      setDemoOrders(updatedOrders);
      persistState(currentUser, circles, members, updatedSessions, cartItems, updatedOrders);
      broadcastUpdate({ sessions: updatedSessions, demoOrders: updatedOrders });

      return newOrder;
    },
    [sessions, circles, members, cartItems, currentUser, demoOrders, persistState, broadcastUpdate]
  );

  // Get order
  const getOrder = useCallback(
    (orderId: string) => {
      return demoOrders.find((o) => o.id === orderId || o.order_code === orderId);
    },
    [demoOrders]
  );

  // Get orders for current user
  const getOrdersForUser = useCallback(() => {
    return demoOrders.filter(
      (o) =>
        o.placed_by_id === currentUser.id ||
        o.member_breakdowns.some((m) => m.user_id === currentUser.id)
    );
  }, [demoOrders, currentUser]);

  // Restaurants
  const restaurants = DEMO_RESTAURANTS;
  const getRestaurant = useCallback((id: string) => {
    return DEMO_RESTAURANTS.find((r) => r.id === id);
  }, []);

  // Reset demo data
  const resetDemoData = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.CIRCLES);
      localStorage.removeItem(STORAGE_KEYS.MEMBERS);
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.CART);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
    }
    setCurrentUser(DEMO_PERSONAS[0]);
    setCircles(INITIAL_CIRCLES);
    setMembers(INITIAL_CIRCLE_MEMBERS);
    setSessions(INITIAL_SESSIONS);
    setCartItems(INITIAL_CART_ITEMS);
    setDemoOrders(INITIAL_DEMO_ORDERS);

    broadcastUpdate({
      circles: INITIAL_CIRCLES,
      members: INITIAL_CIRCLE_MEMBERS,
      sessions: INITIAL_SESSIONS,
      cartItems: INITIAL_CART_ITEMS,
      demoOrders: INITIAL_DEMO_ORDERS,
    });
  }, [broadcastUpdate]);

  const value = useMemo(
    () => ({
      currentUser,
      personas: DEMO_PERSONAS,
      switchPersona,
      updateProfile,
      circles,
      createCircle,
      getCircle,
      getCircleByInviteCode,
      joinCircle,
      getUserCircles,
      getCircleMembers,
      isCircleAdmin,
      getSession,
      startSession,
      lockSession,
      reopenSession,
      finalizeSession,
      cartItems,
      getSessionCartItems,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      demoOrders,
      getOrder,
      getOrdersForUser,
      restaurants,
      getRestaurant,
      isRealtimeConnected,
      isSupabaseActive: isSupabaseConfigured,
      resetDemoData,
      isLoaded: mounted,
      toggleMemberReady,
      updatePickupNote,
      startReorderSession,
      getMemberCartTotalPaise,
      getMemberRemainingBudgetPaise,
    }),
    [
      currentUser,
      switchPersona,
      updateProfile,
      circles,
      createCircle,
      getCircle,
      getCircleByInviteCode,
      joinCircle,
      getUserCircles,
      getCircleMembers,
      isCircleAdmin,
      getSession,
      startSession,
      lockSession,
      reopenSession,
      finalizeSession,
      cartItems,
      getSessionCartItems,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      demoOrders,
      getOrder,
      getOrdersForUser,
      restaurants,
      getRestaurant,
      isRealtimeConnected,
      resetDemoData,
      mounted,
      toggleMemberReady,
      updatePickupNote,
      startReorderSession,
      getMemberCartTotalPaise,
      getMemberRemainingBudgetPaise,
    ]
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#FC8019] to-[#E86F0A] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[#FC8019]/20 animate-pulse">
          🍱
        </div>
        <p className="mt-4 text-xs font-black tracking-wider text-[#171717] uppercase">
          Swiggy Campus Circles
        </p>
        <p className="text-[11px] text-[#737373] mt-1 font-medium">
          Loading campus squad...
        </p>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
