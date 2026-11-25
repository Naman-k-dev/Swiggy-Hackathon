'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import {
  StudentProfile,
  Circle,
  CircleMember,
  OrderingSession,
  CartItem,
  DemoOrder,
  Restaurant,
  MemberBreakdown,
  RecurringMealWindow,
  MealType,
  RecurrencePattern,
  ParticipationStatus,
  CircleVoteSession,
  OrderRescueIssue,
  OrderRescueAlternative,
  OrderRescueScenario,
} from '@/types';
import {
  DEMO_PERSONAS,
  INITIAL_CIRCLES,
  INITIAL_CIRCLE_MEMBERS,
  INITIAL_SESSIONS,
  INITIAL_CART_ITEMS,
  INITIAL_DEMO_ORDERS,
  INITIAL_MEAL_WINDOWS,
  INITIAL_VOTE_SESSIONS,
  DEFAULT_CAMPUS_NAME,
} from '@/lib/data/mock-seed';
import { DEMO_RESTAURANTS } from '@/lib/data/mock-restaurants';
import { generateInviteCode, calculateMemberSplit } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  SupabaseSchemaStatus,
  isUuid,
  createCloudId,
  checkCloudSchemaReadiness,
  upsertCloudProfile,
  fetchUserCloudState,
  createCloudCircle,
  joinCloudCircleByInvite,
  lookupCloudCircleByInvite,
  upsertCloudSession,
  upsertCloudCartItem,
  deleteCloudCartItem,
  insertCloudDemoOrder,
  insertCloudMealWindow,
  upsertCloudVoteSession,
  upsertCloudVote,
  upsertCloudRescueIssue,
} from '@/lib/supabase/cloud-sync';
import { analyticsService } from '@/lib/analytics/analytics-service';
import {
  canManageSession,
  canModifyCartItem,
  canJoinCircle,
} from '@/lib/security/authorization';
import {
  createVoteSession,
  castVote,
  completeVoteSession,
  CandidateRestaurantInput,
} from '@/lib/circlevote/circlevote-engine';
import {
  detectOrderIssue,
  getJudgeDemoRescueScenarios,
} from '@/lib/rescue/order-rescue-engine';

export const GUEST_USER: StudentProfile = {
  id: 'student-guest',
  full_name: 'Guest User',
  email: 'guest@campus.edu',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
  college: DEFAULT_CAMPUS_NAME,
  academic_year: 'Student',
  dietary_pref: 'BOTH',
  preferred_budget: 250,
};

export const DEMO_PRESETS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_PRESETS !== 'false';

function normalizeDietaryPref(pref?: string): StudentProfile['dietary_pref'] {
  if (!pref) return 'BOTH';
  const upper = pref.toUpperCase();
  if (upper === 'VEG') return 'VEG';
  if (upper === 'NON_VEG' || upper === 'NON-VEG') return 'NON_VEG';
  return 'BOTH';
}

interface AppContextType {
  // Current user & personas
  currentUser: StudentProfile;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  supabaseSchemaStatus: SupabaseSchemaStatus;
  logout: () => void;
  personas: StudentProfile[];
  switchPersona: (personaId: string) => void;
  signInWithSupabaseUser: (
    user: User,
    overrides?: {
      full_name?: string;
      college?: string;
      dietary_preference?: 'veg' | 'non-veg' | 'flexible';
      preferred_budget?: number;
    }
  ) => Promise<void>;
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
  resolveInviteCode: (code: string) => Promise<Circle | undefined>;
  joinCircle: (circleId: string, inviteCode?: string) => Promise<{ success: boolean; message: string }>;
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

  // Recurring Campus Meal Windows (Part 4)
  mealWindows: RecurringMealWindow[];
  getMealWindows: (circleId: string) => RecurringMealWindow[];
  scheduleMealWindow: (data: {
    circleId: string;
    mealType: MealType;
    title: string;
    targetTime: string;
    cutoffMinutesBefore: number;
    recurrence: RecurrencePattern;
    restaurantId: string;
    pickupPoint: string;
    startSessionImmediately?: boolean;
  }) => { window: RecurringMealWindow; session?: OrderingSession };
  updateParticipation: (
    sessionId: string,
    userId: string,
    status: ParticipationStatus,
    tempBudgetPaise?: number
  ) => void;

  // Phase 6: CircleVote — The Decision Room
  voteSessions: CircleVoteSession[];
  getActiveVoteSession: (circleId: string) => CircleVoteSession | undefined;
  startCircleVote: (
    circleId: string,
    candidateRestaurantIds: string[],
    cutoffMinutes?: number,
    title?: string
  ) => CircleVoteSession;
  castCircleVote: (sessionId: string, optionId: string) => void;
  finalizeCircleVote: (sessionId: string) => CircleVoteSession;
  applyVoteWinnerToSession: (sessionId: string, voteSessionId: string) => OrderingSession;

  // Phase 6: Order Rescue AI
  activeRescueIssue: OrderRescueIssue | null;
  triggerOrderRescue: (
    scenario: OrderRescueScenario,
    originalDish: { id: string; name: string; price_paise: number },
    customReason?: string,
    isDemo?: boolean,
    options?: {
      circleId?: string;
      affectedUser?: StudentProfile;
      restaurantId?: string;
    }
  ) => OrderRescueIssue;
  acceptRescueReplacement: (
    issue: OrderRescueIssue,
    alternative: OrderRescueAlternative
  ) => void;
  dismissRescueIssue: (issueId: string) => void;
  getJudgeDemoScenarios: (circleId: string) => Record<string, OrderRescueIssue>;

  // Checkpoint 1: Campus Pickup Pass
  markMealCollected: (orderId: string, itemId: string) => void;
  // Checkpoint 1: CirclePay Settlement Tracker
  updateSettlementStatus: (orderId: string, userId: string, newStatus: 'pending' | 'sent' | 'confirmed') => void;

  // Reset & Status
  isRealtimeConnected: boolean;
  isSupabaseActive: boolean;
  resetDemoData: () => void;
  importDemoData: () => void;
  hasDemoData: boolean;
  // Theme & Profile Creation
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  addProfile: (data: {
    full_name: string;
    college: string;
    avatar_url?: string;
    dietary_preference?: 'veg' | 'non-veg' | 'flexible';
    preferred_budget?: number;
  }) => void;
}

const STORAGE_KEYS = {
  USER: 'scc_current_user_v1',
  PERSONAS: 'scc_personas_v1',
  DEMO_MODE: 'scc_demo_mode_v1',
  CIRCLES: 'scc_circles_v1',
  MEMBERS: 'scc_members_v1',
  SESSIONS: 'scc_sessions_v1',
  CART: 'scc_cart_v1',
  ORDERS: 'scc_orders_v1',
  MEAL_WINDOWS: 'scc_meal_windows_v1',
  VOTE_SESSIONS: 'scc_vote_sessions_v1',
  RESCUE_ISSUE: 'scc_rescue_issue_v1',
  THEME: 'scc_theme_v1',
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<StudentProfile>(GUEST_USER);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [supabaseSchemaStatus, setSupabaseSchemaStatus] = useState<SupabaseSchemaStatus>(
    isSupabaseConfigured ? 'checking' : 'disabled'
  );
  const [cloudProfiles, setCloudProfiles] = useState<Map<string, StudentProfile>>(new Map());
  const [personas, setPersonas] = useState<StudentProfile[]>(DEMO_PERSONAS);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {}
    return 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const [circles, setCircles] = useState<Circle[]>([]);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [sessions, setSessions] = useState<OrderingSession[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [demoOrders, setDemoOrders] = useState<DemoOrder[]>([]);
  const [mealWindows, setMealWindows] = useState<RecurringMealWindow[]>([]);
  const [voteSessions, setVoteSessions] = useState<CircleVoteSession[]>([]);
  const [activeRescueIssue, setActiveRescueIssue] = useState<OrderRescueIssue | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);
  const [mounted, setMounted] = useState(false);

  const isAuthenticated = currentUser.id !== 'student-guest';
  const useCloudPersistence =
    isSupabaseConfigured &&
    supabaseSchemaStatus === 'ready' &&
    isUuid(currentUser.id) &&
    !isDemoMode;

  const hydrateFromCloud = useCallback(async (userId: string) => {
    const cloud = await fetchUserCloudState(userId);
    if (!cloud) {
      const status = await checkCloudSchemaReadiness();
      setSupabaseSchemaStatus(status);
      return;
    }

    setSupabaseSchemaStatus(cloud.schemaStatus);
    if (cloud.schemaStatus === 'ready') {
      setCloudProfiles(cloud.profiles);
      setCircles(cloud.circles);
      setMembers(cloud.members);
      setSessions(cloud.sessions);
      setCartItems(cloud.cartItems);
      setDemoOrders(cloud.orders);
      setMealWindows(cloud.mealWindows);
      setVoteSessions(cloud.voteSessions);
      setActiveRescueIssue(cloud.activeRescueIssue);
    }
  }, []);

  const signInWithSupabaseUser = useCallback(
    async (
      user: User,
      overrides?: {
        full_name?: string;
        college?: string;
        dietary_preference?: 'veg' | 'non-veg' | 'flexible';
        preferred_budget?: number;
      }
    ) => {
      const meta = user.user_metadata || {};
      const profile: StudentProfile = {
        id: user.id,
        full_name:
          overrides?.full_name ||
          meta.full_name ||
          user.email?.split('@')[0] ||
          'Student Member',
        email: user.email || `${user.id}@campus.edu`,
        avatar_url:
          meta.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
            overrides?.full_name || meta.full_name || user.email || user.id
          )}`,
        college: overrides?.college || meta.college || DEFAULT_CAMPUS_NAME,
        academic_year: meta.academic_year || 'Student',
        dietary_pref: normalizeDietaryPref(overrides?.dietary_preference || meta.dietary_pref),
        preferred_budget: Number(overrides?.preferred_budget || meta.preferred_budget || 250),
        updated_at: new Date().toISOString(),
      };

      setIsDemoMode(false);
      setCurrentUser(profile);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
          localStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'false');
        } catch {}
      }

      const status = await checkCloudSchemaReadiness();
      setSupabaseSchemaStatus(status);
      if (status === 'ready') {
        await upsertCloudProfile(profile);
        await hydrateFromCloud(profile.id);
      }
    },
    [hydrateFromCloud]
  );

  // Sync localStorage + Supabase Auth Session on mount
  useEffect(() => {
    let active = true;

    const init = async () => {
      let restoredUser: StudentProfile | null = null;
      let restoredDemoMode = false;

      if (typeof window !== 'undefined') {
        try {
          restoredDemoMode = localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true';
          const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
          const storedPersonas = localStorage.getItem(STORAGE_KEYS.PERSONAS);
          const storedCircles = localStorage.getItem(STORAGE_KEYS.CIRCLES);
          const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
          const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
          const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
          const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
          const storedMealWindows = localStorage.getItem(STORAGE_KEYS.MEAL_WINDOWS);
          const storedVoteSessions = localStorage.getItem(STORAGE_KEYS.VOTE_SESSIONS);
          const storedRescue = localStorage.getItem(STORAGE_KEYS.RESCUE_ISSUE);

          if (storedPersonas) setPersonas(JSON.parse(storedPersonas));
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.college === 'BITS Pilani - Hyderabad Campus') {
              parsed.college = DEFAULT_CAMPUS_NAME;
            }
            restoredUser = parsed;
            if (parsed.id && !isUuid(parsed.id) && parsed.id !== 'student-guest') {
              restoredDemoMode = true;
            }
          }

          if (restoredUser && (restoredDemoMode || !isSupabaseConfigured)) {
            if (storedCircles) setCircles(JSON.parse(storedCircles));
            if (storedMembers) setMembers(JSON.parse(storedMembers));
            if (storedSessions) setSessions(JSON.parse(storedSessions));
            if (storedCart) setCartItems(JSON.parse(storedCart));
            if (storedOrders) setDemoOrders(JSON.parse(storedOrders));
            if (storedMealWindows) setMealWindows(JSON.parse(storedMealWindows));
            if (storedVoteSessions) setVoteSessions(JSON.parse(storedVoteSessions));
            if (storedRescue) setActiveRescueIssue(JSON.parse(storedRescue));
          }
        } catch {
          // localStorage read fallback
        }
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const [schema, sessionRes] = await Promise.all([
            checkCloudSchemaReadiness(),
            supabase.auth.getSession(),
          ]);

          if (!active) return;
          setSupabaseSchemaStatus(schema);

          const sessionUser = sessionRes.data.session?.user;
          if (sessionUser && !restoredDemoMode) {
            await signInWithSupabaseUser(sessionUser);
            if (schema === 'migrations_missing' && typeof window !== 'undefined') {
              try {
                const storedCircles = localStorage.getItem(STORAGE_KEYS.CIRCLES);
                const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
                const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
                const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
                const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
                const storedMealWindows = localStorage.getItem(STORAGE_KEYS.MEAL_WINDOWS);
                const storedVoteSessions = localStorage.getItem(STORAGE_KEYS.VOTE_SESSIONS);
                const storedRescue = localStorage.getItem(STORAGE_KEYS.RESCUE_ISSUE);
                if (storedCircles) setCircles(JSON.parse(storedCircles));
                if (storedMembers) setMembers(JSON.parse(storedMembers));
                if (storedSessions) setSessions(JSON.parse(storedSessions));
                if (storedCart) setCartItems(JSON.parse(storedCart));
                if (storedOrders) setDemoOrders(JSON.parse(storedOrders));
                if (storedMealWindows) setMealWindows(JSON.parse(storedMealWindows));
                if (storedVoteSessions) setVoteSessions(JSON.parse(storedVoteSessions));
                if (storedRescue) setActiveRescueIssue(JSON.parse(storedRescue));
              } catch {}
            }
            if (active) setMounted(true);
            return;
          }
        } catch {
          if (active) setSupabaseSchemaStatus('migrations_missing');
        }
      } else {
        setSupabaseSchemaStatus('disabled');
      }

      if (active) {
        if (restoredUser) setCurrentUser(restoredUser);
        setIsDemoMode(restoredDemoMode);
        setMounted(true);
      }
    };

    init();

    return () => {
      active = false;
    };
  }, [signInWithSupabaseUser]);

  // Listen to Supabase Auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsDemoMode(false);
        setCurrentUser(GUEST_USER);
      } else if (event === 'SIGNED_IN' && session?.user) {
        signInWithSupabaseUser(session.user);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [signInWithSupabaseUser]);

  const persistState = useCallback(
    (
      u = currentUser,
      c = circles,
      m = members,
      s = sessions,
      cart = cartItems,
      o = demoOrders,
      w = mealWindows,
      vs = voteSessions,
      ri = activeRescueIssue,
      demoFlag = isDemoMode
    ) => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
        localStorage.setItem(STORAGE_KEYS.DEMO_MODE, demoFlag ? 'true' : 'false');
        localStorage.setItem(STORAGE_KEYS.CIRCLES, JSON.stringify(c));
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(m));
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(s));
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(o));
        localStorage.setItem(STORAGE_KEYS.MEAL_WINDOWS, JSON.stringify(w));
        localStorage.setItem(STORAGE_KEYS.VOTE_SESSIONS, JSON.stringify(vs));
        if (ri) {
          localStorage.setItem(STORAGE_KEYS.RESCUE_ISSUE, JSON.stringify(ri));
        } else {
          localStorage.removeItem(STORAGE_KEYS.RESCUE_ISSUE);
        }
      } catch {
        // LocalStorage save error
      }
    },
    [currentUser, circles, members, sessions, cartItems, demoOrders, mealWindows, voteSessions, activeRescueIssue, isDemoMode]
  );

  // Keep BroadcastChannel strictly isolated between Demo Sandbox and Authenticated Cloud state
  const currentScopeRef = useRef<string>('guest');
  currentScopeRef.current = isDemoMode ? 'demo' : isUuid(currentUser.id) ? 'cloud' : 'local';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const channel = new BroadcastChannel('swiggy_campus_circles_sync');

    channel.onmessage = (event) => {
      const { type, scope, payload } = event.data || {};
      if (type !== 'SYNC_ALL') return;
      // Do not mix demo broadcasts onto real authenticated accounts or vice versa
      if (scope && scope !== currentScopeRef.current) return;

      if (payload.circles) setCircles(payload.circles);
      if (payload.members) setMembers(payload.members);
      if (payload.sessions) setSessions(payload.sessions);
      if (payload.cartItems) setCartItems(payload.cartItems);
      if (payload.demoOrders) setDemoOrders(payload.demoOrders);
      if (payload.mealWindows) setMealWindows(payload.mealWindows);
      if (payload.voteSessions) setVoteSessions(payload.voteSessions);
      if (payload.activeRescueIssue !== undefined) setActiveRescueIssue(payload.activeRescueIssue);
    };

    return () => {
      channel.close();
    };
  }, []);

  const broadcastUpdate = useCallback(
    (payload: {
      circles?: Circle[];
      members?: CircleMember[];
      sessions?: OrderingSession[];
      cartItems?: CartItem[];
      demoOrders?: DemoOrder[];
      mealWindows?: RecurringMealWindow[];
      voteSessions?: CircleVoteSession[];
      activeRescueIssue?: OrderRescueIssue | null;
    }) => {
      if (typeof window === 'undefined') return;
      try {
        const channel = new BroadcastChannel('swiggy_campus_circles_sync');
        channel.postMessage({ type: 'SYNC_ALL', scope: currentScopeRef.current, payload });
        channel.close();
      } catch {
        // broadcast fallback
      }
    },
    []
  );

  // Supabase Realtime synchronization listener for live DB changes when schema is deployed
  useEffect(() => {
    if (!useCloudPersistence || !supabase) return;

    const refresh = () => {
      hydrateFromCloud(currentUser.id);
    };

    const channel = supabase
      .channel(`campus_circles_realtime_${currentUser.id.slice(0, 8)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'circle_members' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordering_sessions' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'demo_orders' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recurring_meal_windows' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'circle_vote_sessions' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'circle_votes' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_rescue_events' }, refresh)
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [useCloudPersistence, currentUser.id, hydrateFromCloud]);

  const logout = useCallback(() => {
    setIsDemoMode(false);
    setCurrentUser(GUEST_USER);
    setCircles([]);
    setMembers([]);
    setSessions([]);
    setCartItems([]);
    setDemoOrders([]);
    setMealWindows([]);
    setVoteSessions([]);
    setActiveRescueIssue(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
      } catch {}
    }
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  }, []);

  const addProfile = useCallback(
    (data: {
      full_name: string;
      college: string;
      avatar_url?: string;
      dietary_preference?: 'veg' | 'non-veg' | 'flexible';
      preferred_budget?: number;
    }) => {
      const newId = `student-custom-${Date.now()}`;
      const newProfile: StudentProfile = {
        id: newId,
        full_name: data.full_name,
        email: `${data.full_name.toLowerCase().replace(/\s+/g, '')}@campus.edu`,
        avatar_url:
          data.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.full_name)}`,
        college: data.college,
        academic_year: 'Student',
        dietary_pref: normalizeDietaryPref(data.dietary_preference),
        preferred_budget: data.preferred_budget || 250,
        updated_at: new Date().toISOString(),
      };

      setIsDemoMode(true);
      setPersonas((prev) => {
        const updated = [...prev, newProfile];
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEYS.PERSONAS, JSON.stringify(updated));
          } catch {}
        }
        return updated;
      });

      setCurrentUser(newProfile);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newProfile));
          localStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'true');
        } catch {}
      }
    },
    []
  );

  const switchPersona = useCallback(
    (personaId: string) => {
      if (!DEMO_PRESETS_ENABLED) return;
      const target = personas.find((p) => p.id === personaId);
      if (target) {
        if (isSupabaseConfigured && supabase) {
          supabase.auth.signOut().catch(() => {});
        }
        setIsDemoMode(true);
        setCurrentUser(target);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(target));
          localStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'true');
        }
      }
    },
    [personas]
  );

  const updateProfile = useCallback(
    (data: Partial<StudentProfile>) => {
      setCurrentUser((prev) => {
        const updated = { ...prev, ...data, updated_at: new Date().toISOString() };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
        }
        if (useCloudPersistence) {
          upsertCloudProfile(updated);
        }
        return updated;
      });
    },
    [useCloudPersistence]
  );

  const createCircle = useCallback(
    (data: {
      name: string;
      type: Circle['type'];
      college: string;
      description: string;
      emoji?: string;
      preferred_budget?: number;
    }): Circle => {
      if (!isAuthenticated) {
        throw new Error('Authentication required to create a circle.');
      }

      const newCircleId = useCloudPersistence ? createCloudId('circle') : `circle-${Date.now()}`;
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
        id: useCloudPersistence ? createCloudId('cm') : `cm-${Date.now()}`,
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

      if (useCloudPersistence) {
        createCloudCircle(newCircle, adminMembership);
      }

      return newCircle;
    },
    [isAuthenticated, useCloudPersistence, currentUser, circles, members, persistState, broadcastUpdate]
  );

  const getCircle = useCallback(
    (circleId: string) => {
      const circle = circles.find((c) => c.id === circleId);
      if (!circle) return undefined;
      const count = members.filter((m) => m.circle_id === circleId).length;
      return { ...circle, member_count: count };
    },
    [circles, members]
  );

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

  const resolveInviteCode = useCallback(
    async (code: string): Promise<Circle | undefined> => {
      const localMatch = getCircleByInviteCode(code);
      if (localMatch) return localMatch;

      if (useCloudPersistence) {
        const cloudCircle = await lookupCloudCircleByInvite(code);
        if (cloudCircle) {
          setCircles((prev) =>
            prev.some((c) => c.id === cloudCircle.id) ? prev : [cloudCircle, ...prev]
          );
          return cloudCircle;
        }
      }
      return undefined;
    },
    [getCircleByInviteCode, useCloudPersistence]
  );

  const joinCircle = useCallback(
    async (circleId: string, inviteCode?: string) => {
      if (!isAuthenticated) {
        return { success: false, message: 'Sign in required before joining a circle.' };
      }

      const circle = circles.find((c) => c.id === circleId);
      if (!circle) return { success: false, message: 'Circle not found' };

      if (inviteCode !== undefined) {
        const authCheck = canJoinCircle(
          { id: circle.id, adminId: circle.admin_id, inviteCode: circle.invite_code },
          inviteCode
        );
        if (!authCheck.allowed) {
          return { success: false, message: authCheck.reason || 'Invalid invite code' };
        }
      }

      const existing = members.find(
        (m) => m.circle_id === circleId && m.user_id === currentUser.id
      );
      if (existing) {
        return { success: true, message: 'Already a member of this Circle' };
      }

      if (useCloudPersistence && isUuid(circleId)) {
        const res = await joinCloudCircleByInvite(circleId, inviteCode || circle.invite_code);
        if (!res.ok) {
          return { success: false, message: res.error || 'Failed to verify circle invite on server.' };
        }
      }

      const newMembership: CircleMember = {
        id: useCloudPersistence ? createCloudId('cm') : `cm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        circle_id: circleId,
        user_id: currentUser.id,
        role: 'member',
        joined_at: new Date().toISOString(),
      };

      const updatedMembers = [...members, newMembership];
      setMembers(updatedMembers);
      persistState(currentUser, circles, updatedMembers);
      broadcastUpdate({ members: updatedMembers });

      if (useCloudPersistence) {
        hydrateFromCloud(currentUser.id);
      }

      return { success: true, message: `Successfully joined ${circle.name}!` };
    },
    [isAuthenticated, circles, members, currentUser, useCloudPersistence, persistState, broadcastUpdate, hydrateFromCloud]
  );

  const getUserCircles = useCallback(() => {
    if (!isAuthenticated) return [];
    const userCircleIds = new Set(
      members.filter((m) => m.user_id === currentUser.id).map((m) => m.circle_id)
    );
    return circles
      .filter((c) => userCircleIds.has(c.id))
      .map((c) => ({
        ...c,
        member_count: members.filter((m) => m.circle_id === c.id).length,
      }));
  }, [isAuthenticated, circles, members, currentUser]);

  const getCircleMembers = useCallback(
    (circleId: string) => {
      const circleMemberships = members.filter((m) => m.circle_id === circleId);
      return circleMemberships.map((m) => {
        if (m.user_id === currentUser.id) {
          return { ...m, profile: currentUser };
        }
        const fromCloud = cloudProfiles.get(m.user_id);
        if (fromCloud) {
          return { ...m, profile: fromCloud };
        }
        const fromPersonas = personas.find((p) => p.id === m.user_id);
        if (fromPersonas) {
          return { ...m, profile: fromPersonas };
        }
        return {
          ...m,
          profile: {
            id: m.user_id,
            full_name: 'Circle Member',
            email: `${m.user_id.slice(0, 8)}@campus.edu`,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.user_id)}`,
            college: currentUser.college,
            academic_year: 'Student',
            dietary_pref: 'BOTH' as const,
            preferred_budget: 200,
          },
        };
      });
    },
    [members, currentUser, cloudProfiles, personas]
  );

  const isCircleAdmin = useCallback(
    (circleId: string) => {
      if (!isAuthenticated) return false;
      const member = members.find(
        (m) => m.circle_id === circleId && m.user_id === currentUser.id
      );
      if (member?.role === 'admin') return true;
      const circle = circles.find((c) => c.id === circleId);
      return circle?.admin_id === currentUser.id;
    },
    [isAuthenticated, members, circles, currentUser]
  );

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
      const circle = circles.find((c) => c.id === circleId);
      const isMember = members.some((m) => m.circle_id === circleId && m.user_id === currentUser.id);
      if (!circle || (!isMember && circle.admin_id !== currentUser.id)) {
        throw new Error('Only circle members can start an ordering session.');
      }

      const rest = DEMO_RESTAURANTS.find((r) => r.id === restaurantId);
      const restaurantName = rest ? rest.name : 'Campus Partner';
      const restaurantImage = rest ? rest.image : '';

      const newSession: OrderingSession = {
        id: useCloudPersistence ? createCloudId('sess') : `sess-${Date.now()}`,
        circle_id: circleId,
        created_by: currentUser.id,
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        restaurant_image: restaurantImage,
        status: 'open',
        cutoff_time: new Date(Date.now() + cutoffMinutes * 60000).toISOString(),
        delivery_location: 'Hostel Main Gate / Common Reception',
        ready_member_ids: [],
        participations: {},
        created_at: new Date().toISOString(),
      };

      const cancelledPrev = sessions.filter((s) => s.circle_id === circleId && s.status === 'open');
      const updatedSessions = sessions
        .map((s) => (s.circle_id === circleId && s.status === 'open' ? { ...s, status: 'cancelled' as const } : s))
        .concat(newSession);

      setSessions(updatedSessions);
      persistState(currentUser, circles, members, updatedSessions);
      broadcastUpdate({ sessions: updatedSessions });

      if (useCloudPersistence) {
        cancelledPrev.forEach((prev) => upsertCloudSession({ ...prev, status: 'cancelled' }));
        upsertCloudSession(newSession);
      }

      return newSession;
    },
    [circles, members, currentUser, sessions, useCloudPersistence, persistState, broadcastUpdate]
  );

  const lockSession = useCallback(
    (sessionId: string) => {
      const target = sessions.find((s) => s.id === sessionId);
      if (!target) return;
      const circle = circles.find((c) => c.id === target.circle_id);
      if (!circle) return;

      const check = canManageSession(
        { id: currentUser.id, isDemo: isDemoMode },
        { id: circle.id, adminId: circle.admin_id, inviteCode: circle.invite_code }
      );
      if (!check.allowed && !isCircleAdmin(circle.id)) {
        alert(check.reason || 'Only the circle admin can lock the cart.');
        return;
      }

      const nextSession = { ...target, status: 'locked' as const, updated_at: new Date().toISOString() };
      const updated = sessions.map((s) => (s.id === sessionId ? nextSession : s));
      setSessions(updated);
      persistState(currentUser, circles, members, updated);
      broadcastUpdate({ sessions: updated });
      if (useCloudPersistence) upsertCloudSession(nextSession);
    },
    [sessions, circles, currentUser, isDemoMode, isCircleAdmin, members, persistState, broadcastUpdate, useCloudPersistence]
  );

  const reopenSession = useCallback(
    (sessionId: string) => {
      const target = sessions.find((s) => s.id === sessionId);
      if (!target) return;
      const circle = circles.find((c) => c.id === target.circle_id);
      if (!circle) return;

      const check = canManageSession(
        { id: currentUser.id, isDemo: isDemoMode },
        { id: circle.id, adminId: circle.admin_id, inviteCode: circle.invite_code }
      );
      if (!check.allowed && !isCircleAdmin(circle.id)) {
        alert(check.reason || 'Only the circle admin can reopen the cart.');
        return;
      }

      const nextSession = { ...target, status: 'open' as const, updated_at: new Date().toISOString() };
      const updated = sessions.map((s) => (s.id === sessionId ? nextSession : s));
      setSessions(updated);
      persistState(currentUser, circles, members, updated);
      broadcastUpdate({ sessions: updated });
      if (useCloudPersistence) upsertCloudSession(nextSession);
    },
    [sessions, circles, currentUser, isDemoMode, isCircleAdmin, members, persistState, broadcastUpdate, useCloudPersistence]
  );

  const toggleMemberReady = useCallback(
    (sessionId: string, userId = currentUser.id) => {
      if (userId !== currentUser.id) return;
      setSessions((prev) => {
        let changed: OrderingSession | null = null;
        const updated = prev.map((s) => {
          if (s.id !== sessionId) return s;
          const currentReady = s.ready_member_ids || [];
          const isReady = currentReady.includes(userId);
          const nextReady = isReady
            ? currentReady.filter((id) => id !== userId)
            : [...currentReady, userId];
          changed = { ...s, ready_member_ids: nextReady, updated_at: new Date().toISOString() };
          return changed;
        });
        persistState(currentUser, circles, members, updated);
        broadcastUpdate({ sessions: updated });
        if (useCloudPersistence && changed) upsertCloudSession(changed);
        return updated;
      });
    },
    [currentUser, circles, members, persistState, broadcastUpdate, useCloudPersistence]
  );

  const updatePickupNote = useCallback(
    (sessionId: string, pickupNote: string) => {
      const target = sessions.find((s) => s.id === sessionId);
      if (!target || !isCircleAdmin(target.circle_id)) return;

      setSessions((prev) => {
        let changed: OrderingSession | null = null;
        const updated = prev.map((s) => {
          if (s.id !== sessionId) return s;
          changed = { ...s, pickup_note: pickupNote, updated_at: new Date().toISOString() };
          return changed;
        });
        persistState(currentUser, circles, members, updated);
        broadcastUpdate({ sessions: updated });
        if (useCloudPersistence && changed) upsertCloudSession(changed);
        return updated;
      });
    },
    [sessions, isCircleAdmin, currentUser, circles, members, persistState, broadcastUpdate, useCloudPersistence]
  );

  const startReorderSession = useCallback(
    (orderId: string) => {
      const order = demoOrders.find((o) => o.id === orderId || o.order_code === orderId);
      if (!order) throw new Error('Order not found');

      const rest = DEMO_RESTAURANTS.find((r) => r.id === order.restaurant_id);
      const restaurantName = rest ? rest.name : order.restaurant_name;
      const restaurantImage = rest ? rest.image : '';

      const newSession: OrderingSession = {
        id: useCloudPersistence ? createCloudId('sess') : `sess-${Date.now()}`,
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
        participations: {},
        created_at: new Date().toISOString(),
      };

      const updatedSessions = sessions
        .map((s) => (s.circle_id === order.circle_id && s.status === 'open' ? { ...s, status: 'cancelled' as const } : s))
        .concat(newSession);

      setSessions(updatedSessions);
      persistState(currentUser, circles, members, updatedSessions);
      broadcastUpdate({ sessions: updatedSessions });
      if (useCloudPersistence) upsertCloudSession(newSession);

      const previousItems: CartItem[] = [];
      order.member_breakdowns.forEach((mb) => {
        (mb.items || []).forEach((item) => {
          previousItems.push({
            ...item,
            id: useCloudPersistence ? createCloudId('ci') : `reorder-${item.item_id}-${mb.user_id}-${Date.now()}`,
            session_id: newSession.id,
          });
        });
      });

      return { session: newSession, previousItems };
    },
    [demoOrders, useCloudPersistence, currentUser, sessions, circles, members, persistState, broadcastUpdate]
  );

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
      const user =
        (userId === currentUser.id ? currentUser : undefined) ||
        cloudProfiles.get(userId) ||
        personas.find((p) => p.id === userId) ||
        currentUser;
      const budgetPaise = (user.preferred_budget || circle?.preferred_budget || 200) * 100;
      const spentPaise = getMemberCartTotalPaise(sessionId, userId);
      return Math.max(0, budgetPaise - spentPaise);
    },
    [circles, currentUser, cloudProfiles, personas, getMemberCartTotalPaise]
  );

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
      const effectiveUserId = targetUserId || currentUser.id;
      const isMember = members.some((m) => m.circle_id === circleId && m.user_id === effectiveUserId);
      const isActorAdmin = isCircleAdmin(circleId);

      // Non-admins can only add dishes for themselves
      if (effectiveUserId !== currentUser.id && !isActorAdmin) {
        alert('Members can only add dishes to their own cart portion.');
        return;
      }

      if (session) {
        const authCheck = canModifyCartItem(
          { id: effectiveUserId, isDemo: isDemoMode },
          { id: 'new', sessionId, circleId, userId: effectiveUserId },
          { id: session.id, circleId: session.circle_id, status: session.status, cutoffTime: session.cutoff_time },
          isMember || isActorAdmin
        );
        if (!authCheck.allowed) {
          alert(authCheck.reason || 'Cannot add item to this session.');
          return;
        }
      }

      const targetProfile =
        (effectiveUserId === currentUser.id ? currentUser : undefined) ||
        cloudProfiles.get(effectiveUserId) ||
        personas.find((p) => p.id === effectiveUserId) ||
        currentUser;

      let itemToSync: CartItem | null = null;
      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (ci) =>
            ci.session_id === sessionId &&
            ci.user_id === effectiveUserId &&
            ci.item_id === item.id &&
            (ci.customization || '') === (customization || '')
        );

        let updated: CartItem[];
        if (existingIndex > -1) {
          itemToSync = {
            ...prev[existingIndex],
            quantity: prev[existingIndex].quantity + 1,
            updated_at: new Date().toISOString(),
          };
          updated = prev.map((ci, idx) => (idx === existingIndex ? itemToSync! : ci));
        } else {
          itemToSync = {
            id: useCloudPersistence
              ? createCloudId('cart')
              : `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
          updated = [...prev, itemToSync];
        }

        persistState(currentUser, circles, members, sessions, updated, demoOrders, mealWindows);
        broadcastUpdate({ cartItems: updated });
        return updated;
      });

      if (useCloudPersistence && itemToSync) {
        upsertCloudCartItem(itemToSync);
      }
    },
    [
      sessions,
      currentUser,
      members,
      isCircleAdmin,
      isDemoMode,
      cloudProfiles,
      personas,
      useCloudPersistence,
      circles,
      demoOrders,
      mealWindows,
      persistState,
      broadcastUpdate,
    ]
  );

  const updateCartQuantity = useCallback(
    (cartItemId: string, delta: number) => {
      setCartItems((prev) => {
        const item = prev.find((ci) => ci.id === cartItemId);
        if (!item) return prev;

        const session = sessions.find((s) => s.id === item.session_id);
        const isMember = members.some((m) => m.circle_id === item.circle_id && m.user_id === currentUser.id);
        const isAdmin = isCircleAdmin(item.circle_id);

        if (session) {
          if (item.user_id !== currentUser.id && !isAdmin) {
            alert('You can only edit your own dishes in the shared cart.');
            return prev;
          }
          const authCheck = canModifyCartItem(
            { id: item.user_id, isDemo: isDemoMode },
            { id: item.id, sessionId: item.session_id, circleId: item.circle_id, userId: item.user_id },
            { id: session.id, circleId: session.circle_id, status: session.status, cutoffTime: session.cutoff_time },
            isMember || isAdmin
          );
          if (!authCheck.allowed) {
            alert(authCheck.reason || 'Cannot modify cart.');
            return prev;
          }
        }

        let updated: CartItem[];
        if (item.quantity + delta <= 0) {
          updated = prev.filter((ci) => ci.id !== cartItemId);
          if (useCloudPersistence) deleteCloudCartItem(cartItemId);
        } else {
          const modified = { ...item, quantity: item.quantity + delta, updated_at: new Date().toISOString() };
          updated = prev.map((ci) => (ci.id === cartItemId ? modified : ci));
          if (useCloudPersistence) upsertCloudCartItem(modified);
        }

        persistState(currentUser, circles, members, sessions, updated, demoOrders, mealWindows);
        broadcastUpdate({ cartItems: updated });
        return updated;
      });
    },
    [
      sessions,
      members,
      currentUser,
      isCircleAdmin,
      isDemoMode,
      useCloudPersistence,
      circles,
      demoOrders,
      mealWindows,
      persistState,
      broadcastUpdate,
    ]
  );

  const removeFromCart = useCallback(
    (cartItemId: string) => {
      setCartItems((prev) => {
        const item = prev.find((ci) => ci.id === cartItemId);
        if (!item) return prev;

        const session = sessions.find((s) => s.id === item.session_id);
        const isMember = members.some((m) => m.circle_id === item.circle_id && m.user_id === currentUser.id);
        const isAdmin = isCircleAdmin(item.circle_id);

        if (session) {
          if (item.user_id !== currentUser.id && !isAdmin) {
            alert('You can only remove your own dishes from the shared cart.');
            return prev;
          }
          const authCheck = canModifyCartItem(
            { id: item.user_id, isDemo: isDemoMode },
            { id: item.id, sessionId: item.session_id, circleId: item.circle_id, userId: item.user_id },
            { id: session.id, circleId: session.circle_id, status: session.status, cutoffTime: session.cutoff_time },
            isMember || isAdmin
          );
          if (!authCheck.allowed) {
            alert(authCheck.reason || 'Cannot remove item from cart.');
            return prev;
          }
        }

        const updated = prev.filter((ci) => ci.id !== cartItemId);
        if (useCloudPersistence) deleteCloudCartItem(cartItemId);
        persistState(currentUser, circles, members, sessions, updated, demoOrders, mealWindows);
        broadcastUpdate({ cartItems: updated });
        return updated;
      });
    },
    [
      sessions,
      members,
      currentUser,
      isCircleAdmin,
      isDemoMode,
      useCloudPersistence,
      circles,
      demoOrders,
      mealWindows,
      persistState,
      broadcastUpdate,
    ]
  );

  const finalizeSession = useCallback(
    (sessionId: string, deliveryLocation: string, instructions?: string): DemoOrder => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) throw new Error('Session not found');

      const circle = circles.find((c) => c.id === session.circle_id);
      if (!circle || !isCircleAdmin(circle.id)) {
        throw new Error('Only the circle admin can finalize the group order.');
      }

      const items = cartItems.filter((i) => i.session_id === sessionId);
      if (items.length === 0) {
        throw new Error('Cannot finalize an empty cart');
      }

      const subtotalPaise = items.reduce(
        (sum, item) => sum + item.item_price_paise * item.quantity,
        0
      );
      const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

      const deliveryFeePaise = subtotalPaise > 40000 ? 0 : 3000;
      const platformFeePaise = 500;
      const discountPaise = subtotalPaise > 50000 ? 5000 : 0;
      const totalPaise = subtotalPaise + deliveryFeePaise + platformFeePaise - discountPaise;

      const breakdowns = calculateMemberSplit(
        items,
        deliveryFeePaise,
        platformFeePaise,
        discountPaise
      );

      const orderCode = `SW-CAMPUS-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder: DemoOrder = {
        id: useCloudPersistence ? createCloudId('order') : `order-${Date.now()}`,
        order_code: orderCode,
        circle_id: session.circle_id,
        circle_name: circle.name,
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

      const finalizedSession = {
        ...session,
        status: 'finalized' as const,
        updated_at: new Date().toISOString(),
      };
      const updatedSessions = sessions.map((s) => (s.id === sessionId ? finalizedSession : s));
      const updatedOrders = [newOrder, ...demoOrders];

      const sessionCreatedTime = new Date(session.created_at).getTime();
      const decisionTimeSeconds = Math.max(5, Math.round((Date.now() - sessionCreatedTime) / 1000));
      const uniqueParticipants = Array.from(new Set(items.map((i) => i.user_id)));

      analyticsService.trackEvent(
        'order_finalized',
        session.circle_id,
        sessionId,
        currentUser.id,
        {
          orderCode,
          participantCount: uniqueParticipants.length,
          decisionTimeSeconds,
          estimatedMenuSubtotalPaise: subtotalPaise,
          totalPaise,
          totalItemsCount,
          restaurantId: session.restaurant_id,
          restaurantName: session.restaurant_name,
        },
        'live_campus_pilot'
      );

      setSessions(updatedSessions);
      setDemoOrders(updatedOrders);
      persistState(currentUser, circles, members, updatedSessions, cartItems, updatedOrders);
      broadcastUpdate({ sessions: updatedSessions, demoOrders: updatedOrders });

      if (useCloudPersistence) {
        upsertCloudSession(finalizedSession);
        insertCloudDemoOrder(newOrder);
      }

      return newOrder;
    },
    [
      sessions,
      circles,
      isCircleAdmin,
      cartItems,
      useCloudPersistence,
      currentUser,
      demoOrders,
      members,
      persistState,
      broadcastUpdate,
    ]
  );

  const getOrder = useCallback(
    (orderId: string) => {
      return demoOrders.find((o) => o.id === orderId || o.order_code === orderId);
    },
    [demoOrders]
  );

  const getOrdersForUser = useCallback(() => {
    if (!isAuthenticated) return [];
    const userCircleIds = new Set(
      members.filter((m) => m.user_id === currentUser.id).map((m) => m.circle_id)
    );
    return demoOrders.filter(
      (o) =>
        userCircleIds.has(o.circle_id) ||
        o.placed_by_id === currentUser.id ||
        o.member_breakdowns.some((m) => m.user_id === currentUser.id)
    );
  }, [isAuthenticated, demoOrders, members, currentUser]);

  const restaurants = DEMO_RESTAURANTS;
  const getRestaurant = useCallback((id: string) => {
    return DEMO_RESTAURANTS.find((r) => r.id === id);
  }, []);

  const getMealWindows = useCallback(
    (circleId: string) => {
      return mealWindows.filter((w) => w.circle_id === circleId && w.active);
    },
    [mealWindows]
  );

  const scheduleMealWindow = useCallback(
    (data: {
      circleId: string;
      mealType: MealType;
      title: string;
      targetTime: string;
      cutoffMinutesBefore: number;
      recurrence: RecurrencePattern;
      restaurantId: string;
      pickupPoint: string;
      startSessionImmediately?: boolean;
    }) => {
      if (!isCircleAdmin(data.circleId)) {
        throw new Error('Only the circle admin can schedule meal windows.');
      }

      const rest = DEMO_RESTAURANTS.find((r) => r.id === data.restaurantId);
      const newWindow: RecurringMealWindow = {
        id: useCloudPersistence ? createCloudId('mw') : `mw-${Date.now()}`,
        circle_id: data.circleId,
        meal_type: data.mealType,
        title: data.title,
        target_time: data.targetTime,
        cutoff_minutes_before: data.cutoffMinutesBefore,
        recurrence: data.recurrence,
        preferred_restaurant_id: data.restaurantId,
        preferred_restaurant_name: rest ? rest.name : 'Campus Partner',
        pickup_point: data.pickupPoint,
        active: true,
        created_at: new Date().toISOString(),
      };

      const updatedWindows = [...mealWindows, newWindow];
      setMealWindows(updatedWindows);

      let createdSession: OrderingSession | undefined;
      if (data.startSessionImmediately) {
        const cutoffTime = new Date(Date.now() + data.cutoffMinutesBefore * 60000).toISOString();
        const newSession: OrderingSession = {
          id: useCloudPersistence ? createCloudId('sess') : `sess-${Date.now()}`,
          circle_id: data.circleId,
          created_by: currentUser.id,
          restaurant_id: data.restaurantId,
          restaurant_name: rest ? rest.name : 'Campus Partner',
          restaurant_image: rest ? rest.image : '',
          status: 'open',
          cutoff_time: cutoffTime,
          delivery_location: data.pickupPoint,
          pickup_note: data.pickupPoint,
          meal_type: data.mealType,
          session_name: data.title,
          recurrence: data.recurrence,
          ready_member_ids: [currentUser.id],
          participations: {
            [currentUser.id]: {
              user_id: currentUser.id,
              status: 'joining',
              updated_at: new Date().toISOString(),
            },
          },
          created_at: new Date().toISOString(),
        };

        const updatedSessions = sessions
          .map((s) =>
            s.circle_id === data.circleId && s.status === 'open'
              ? { ...s, status: 'cancelled' as const }
              : s
          )
          .concat(newSession);

        setSessions(updatedSessions);
        persistState(
          currentUser,
          circles,
          members,
          updatedSessions,
          cartItems,
          demoOrders,
          updatedWindows
        );
        broadcastUpdate({ sessions: updatedSessions, mealWindows: updatedWindows });
        createdSession = newSession;
        if (useCloudPersistence) upsertCloudSession(newSession);
      } else {
        persistState(
          currentUser,
          circles,
          members,
          sessions,
          cartItems,
          demoOrders,
          updatedWindows
        );
        broadcastUpdate({ mealWindows: updatedWindows });
      }

      if (useCloudPersistence) {
        insertCloudMealWindow(newWindow, currentUser.id);
      }

      analyticsService.trackEvent(
        'meal_session_scheduled',
        data.circleId,
        createdSession?.id,
        currentUser.id,
        {
          mealType: data.mealType,
          recurrence: data.recurrence,
          pickupPoint: data.pickupPoint,
        }
      );

      return { window: newWindow, session: createdSession };
    },
    [
      isCircleAdmin,
      useCloudPersistence,
      currentUser,
      mealWindows,
      sessions,
      circles,
      members,
      cartItems,
      demoOrders,
      persistState,
      broadcastUpdate,
    ]
  );

  const updateParticipation = useCallback(
    (
      sessionId: string,
      userId: string,
      status: ParticipationStatus,
      tempBudgetPaise?: number
    ) => {
      if (userId !== currentUser.id) return;
      setSessions((prev) => {
        let changed: OrderingSession | null = null;
        const updated = prev.map((s) => {
          if (s.id !== sessionId) return s;
          const currentParts = s.participations || {};
          const updatedParts = {
            ...currentParts,
            [userId]: {
              user_id: userId,
              status,
              temporary_budget_paise: tempBudgetPaise,
              updated_at: new Date().toISOString(),
            },
          };
          changed = {
            ...s,
            participations: updatedParts,
            updated_at: new Date().toISOString(),
          };
          return changed;
        });
        persistState(currentUser, circles, members, updated, cartItems, demoOrders, mealWindows);
        broadcastUpdate({ sessions: updated });
        if (useCloudPersistence && changed) upsertCloudSession(changed);
        return updated;
      });

      analyticsService.trackEvent(
        status === 'joining' ? 'member_joined_meal' : 'member_skipped_meal',
        sessions.find((s) => s.id === sessionId)?.circle_id || '',
        sessionId,
        userId,
        { status, tempBudgetPaise }
      );
    },
    [
      sessions,
      currentUser,
      circles,
      members,
      cartItems,
      demoOrders,
      mealWindows,
      persistState,
      broadcastUpdate,
      useCloudPersistence,
    ]
  );

  const getActiveVoteSession = useCallback(
    (circleId: string): CircleVoteSession | undefined => {
      return voteSessions.find((s) => s.circle_id === circleId && s.status === 'active');
    },
    [voteSessions]
  );

  const startCircleVote = useCallback(
    (
      circleId: string,
      candidateRestaurantIds: string[],
      cutoffMinutes = 15,
      title = 'Meal Decision Room'
    ): CircleVoteSession => {
      const circle = circles.find((c) => c.id === circleId);
      if (!circle) throw new Error('Circle not found');
      if (!isCircleAdmin(circleId)) {
        throw new Error('Only the circle admin can launch a Decision Room poll.');
      }

      const candidateRestObjs = candidateRestaurantIds
        .map((rid) => DEMO_RESTAURANTS.find((r) => r.id === rid))
        .filter(Boolean) as Restaurant[];

      if (candidateRestObjs.length === 0) {
        throw new Error('At least one valid restaurant candidate is required.');
      }

      const circleMemberList = getCircleMembers(circleId).map((m) => m.profile);

      const candidateInputs: CandidateRestaurantInput[] = candidateRestObjs.map((rest) => ({
        restaurant: rest,
        source: 'campus_catalog',
      }));

      let newVoteSession = createVoteSession(
        circle,
        currentUser.id,
        candidateInputs,
        circleMemberList,
        cutoffMinutes,
        title
      );

      if (useCloudPersistence) {
        const cloudSessionId = createCloudId('vote');
        newVoteSession = {
          ...newVoteSession,
          id: cloudSessionId,
          meal_session_id: getSession(circleId)?.id,
          options: newVoteSession.options.map((opt) => ({
            ...opt,
            id: createCloudId('opt'),
          })),
        };
      }

      const updatedSessions = [
        newVoteSession,
        ...voteSessions.filter((s) => s.id !== newVoteSession.id),
      ];

      setVoteSessions(updatedSessions);
      persistState(
        currentUser,
        circles,
        members,
        sessions,
        cartItems,
        demoOrders,
        mealWindows,
        updatedSessions,
        activeRescueIssue
      );
      broadcastUpdate({ voteSessions: updatedSessions });

      if (useCloudPersistence) {
        upsertCloudVoteSession(newVoteSession, true);
      }

      analyticsService.trackEvent(
        'circlevote_started',
        circleId,
        newVoteSession.id,
        currentUser.id,
        {
          optionsCount: newVoteSession.options.length,
          candidates: candidateRestaurantIds,
          cutoffMinutes,
        }
      );

      return newVoteSession;
    },
    [
      circles,
      isCircleAdmin,
      getCircleMembers,
      currentUser,
      useCloudPersistence,
      getSession,
      voteSessions,
      members,
      sessions,
      cartItems,
      demoOrders,
      mealWindows,
      activeRescueIssue,
      persistState,
      broadcastUpdate,
    ]
  );

  const castCircleVote = useCallback(
    (sessionId: string, optionId: string) => {
      const session = voteSessions.find((s) => s.id === sessionId);
      if (!session) throw new Error('Vote session not found');

      const updated = castVote(
        session,
        { id: currentUser.id, name: currentUser.full_name, avatar: currentUser.avatar_url },
        optionId
      );

      const updatedSessions = voteSessions.map((s) => (s.id === sessionId ? updated : s));
      setVoteSessions(updatedSessions);
      persistState(
        currentUser,
        circles,
        members,
        sessions,
        cartItems,
        demoOrders,
        mealWindows,
        updatedSessions,
        activeRescueIssue
      );
      broadcastUpdate({ voteSessions: updatedSessions });

      if (useCloudPersistence && updated.votes[currentUser.id]) {
        upsertCloudVote(updated.votes[currentUser.id]);
      }

      analyticsService.trackEvent(
        'circlevote_cast',
        session.circle_id,
        sessionId,
        currentUser.id,
        {
          optionId,
          totalVotesCast: Object.keys(updated.votes).length,
        }
      );
    },
    [
      voteSessions,
      currentUser,
      circles,
      members,
      sessions,
      cartItems,
      demoOrders,
      mealWindows,
      activeRescueIssue,
      persistState,
      broadcastUpdate,
      useCloudPersistence,
    ]
  );

  const finalizeCircleVote = useCallback(
    (sessionId: string): CircleVoteSession => {
      const session = voteSessions.find((s) => s.id === sessionId);
      if (!session) throw new Error('Vote session not found');

      const circle = circles.find((c) => c.id === session.circle_id);
      if (!circle) throw new Error('Circle not found');

      const finalized = completeVoteSession(session, currentUser.id, circle.admin_id);

      const updatedSessions = voteSessions.map((s) => (s.id === sessionId ? finalized : s));
      setVoteSessions(updatedSessions);
      persistState(
        currentUser,
        circles,
        members,
        sessions,
        cartItems,
        demoOrders,
        mealWindows,
        updatedSessions,
        activeRescueIssue
      );
      broadcastUpdate({ voteSessions: updatedSessions });

      if (useCloudPersistence) {
        upsertCloudVoteSession(finalized, false);
      }

      analyticsService.trackEvent(
        'circlevote_completed',
        session.circle_id,
        sessionId,
        currentUser.id,
        {
          winningOptionId: finalized.winning_option_id,
          winningRestaurantId: finalized.winning_restaurant_id,
          winnerReason: finalized.winner_reason,
        }
      );

      return finalized;
    },
    [
      voteSessions,
      circles,
      currentUser,
      members,
      sessions,
      cartItems,
      demoOrders,
      mealWindows,
      activeRescueIssue,
      persistState,
      broadcastUpdate,
      useCloudPersistence,
    ]
  );

  const applyVoteWinnerToSession = useCallback(
    (sessionId: string, voteSessionId: string): OrderingSession => {
      const voteSession = voteSessions.find((s) => s.id === voteSessionId);
      if (!voteSession || !voteSession.winning_restaurant_id) {
        throw new Error('Vote session does not have a finalized winner.');
      }

      const rest = DEMO_RESTAURANTS.find((r) => r.id === voteSession.winning_restaurant_id);
      if (!rest) throw new Error('Winning restaurant not found in catalog.');

      let targetSession = sessions.find((s) => s.id === sessionId);
      let updatedSessions = sessions;

      if (targetSession) {
        targetSession = {
          ...targetSession,
          restaurant_id: rest.id,
          restaurant_name: rest.name,
          restaurant_image: rest.image,
          updated_at: new Date().toISOString(),
        };
        updatedSessions = sessions.map((s) => (s.id === sessionId ? targetSession! : s));
      } else {
        const newSession: OrderingSession = {
          id: useCloudPersistence ? createCloudId('sess') : `sess-${Date.now()}`,
          circle_id: voteSession.circle_id,
          created_by: currentUser.id,
          restaurant_id: rest.id,
          restaurant_name: rest.name,
          restaurant_image: rest.image,
          status: 'open',
          cutoff_time: new Date(Date.now() + 30 * 60000).toISOString(),
          delivery_location: 'Hostel Gate 2 (Drop Point)',
          created_at: new Date().toISOString(),
        };
        targetSession = newSession;
        updatedSessions = [newSession, ...sessions];
      }

      setSessions(updatedSessions);
      persistState(
        currentUser,
        circles,
        members,
        updatedSessions,
        cartItems,
        demoOrders,
        mealWindows,
        voteSessions,
        activeRescueIssue
      );
      broadcastUpdate({ sessions: updatedSessions });

      if (useCloudPersistence) {
        upsertCloudSession(targetSession);
      }

      analyticsService.trackEvent(
        'circlevote_restaurant_selected',
        voteSession.circle_id,
        targetSession.id,
        currentUser.id,
        {
          restaurantId: rest.id,
          restaurantName: rest.name,
        }
      );

      return targetSession;
    },
    [
      voteSessions,
      sessions,
      useCloudPersistence,
      currentUser,
      circles,
      members,
      cartItems,
      demoOrders,
      mealWindows,
      activeRescueIssue,
      persistState,
      broadcastUpdate,
    ]
  );

  const triggerOrderRescue = useCallback(
    (
      scenario: OrderRescueScenario,
      originalDish: { id: string; name: string; price_paise: number },
      customReason?: string,
      isDemo = false,
      options?: {
        circleId?: string;
        affectedUser?: StudentProfile;
        restaurantId?: string;
      }
    ): OrderRescueIssue => {
      const targetCircleId = options?.circleId || circles[0]?.id || 'circle-cse-lunch-squad';
      const activeSession =
        sessions.find((s) => s.circle_id === targetCircleId && s.status === 'open') ||
        sessions.find((s) => s.status === 'open');

      const targetRestId = options?.restaurantId || activeSession?.restaurant_id;
      const rest = targetRestId
        ? DEMO_RESTAURANTS.find((r) => r.id === targetRestId) || DEMO_RESTAURANTS[0]
        : DEMO_RESTAURANTS[0];

      const affectedUser = options?.affectedUser || currentUser;

      let issue = detectOrderIssue(
        scenario,
        activeSession?.id || 'sess-rescue-demo',
        targetCircleId,
        affectedUser,
        originalDish,
        rest,
        cartItems,
        customReason,
        isDemo
      );

      if (useCloudPersistence && activeSession && isUuid(activeSession.id)) {
        issue = { ...issue, id: createCloudId('rescue') };
      }

      setActiveRescueIssue(issue);
      persistState(
        currentUser,
        circles,
        members,
        sessions,
        cartItems,
        demoOrders,
        mealWindows,
        voteSessions,
        issue
      );
      broadcastUpdate({ activeRescueIssue: issue });

      if (useCloudPersistence && !isDemo) {
        upsertCloudRescueIssue(issue, 'detected');
      }

      analyticsService.trackEvent(
        'order_rescue_triggered',
        issue.circle_id,
        issue.session_id,
        affectedUser.id,
        {
          scenario,
          originalDishId: originalDish.id,
          alternativesCount: issue.suggested_alternatives.length,
          isDemo,
        }
      );

      return issue;
    },
    [
      circles,
      sessions,
      currentUser,
      cartItems,
      useCloudPersistence,
      members,
      demoOrders,
      mealWindows,
      voteSessions,
      persistState,
      broadcastUpdate,
    ]
  );

  const acceptRescueReplacement = useCallback(
    (issue: OrderRescueIssue, alternative: OrderRescueAlternative) => {
      const isActorAdmin = isCircleAdmin(issue.circle_id);
      if (currentUser.id !== issue.user_id && !isActorAdmin) {
        alert('Only the affected student or circle admin can approve this replacement.');
        return;
      }

      const session = sessions.find((s) => s.id === issue.session_id);
      if (session && session.status !== 'open') {
        alert('Cannot modify cart: Ordering session is locked or finalized.');
        return;
      }
      if (session && session.cutoff_time && new Date(session.cutoff_time).getTime() < Date.now()) {
        alert('Cannot modify cart: Session order cutoff deadline has expired.');
        return;
      }

      let syncedItem: CartItem | null = null;
      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (ci) =>
            ci.session_id === issue.session_id &&
            ci.user_id === issue.user_id &&
            ci.item_id === issue.original_dish_id
        );

        let updated: CartItem[];
        if (existingIndex !== -1) {
          syncedItem = {
            ...prev[existingIndex],
            item_id: alternative.dish_id,
            item_name: alternative.dish_name,
            item_price_paise: alternative.price_paise,
            item_is_veg: alternative.is_veg,
            updated_at: new Date().toISOString(),
          };
          updated = prev.map((ci, idx) => (idx === existingIndex ? syncedItem! : ci));
        } else {
          syncedItem = {
            id: useCloudPersistence
              ? createCloudId('ci')
              : `ci-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            session_id: issue.session_id,
            circle_id: issue.circle_id,
            user_id: issue.user_id,
            user_name: issue.user_name,
            user_avatar: issue.user_avatar,
            item_id: alternative.dish_id,
            item_name: alternative.dish_name,
            item_price_paise: alternative.price_paise,
            item_is_veg: alternative.is_veg,
            quantity: 1,
            created_at: new Date().toISOString(),
          };
          updated = [...prev, syncedItem];
        }

        persistState(
          currentUser,
          circles,
          members,
          sessions,
          updated,
          demoOrders,
          mealWindows,
          voteSessions,
          null
        );
        broadcastUpdate({ cartItems: updated, activeRescueIssue: null });
        return updated;
      });

      if (useCloudPersistence && syncedItem) {
        upsertCloudCartItem(syncedItem);
        upsertCloudRescueIssue(issue, 'resolved', alternative.dish_id);
      }

      setActiveRescueIssue(null);

      analyticsService.trackEvent(
        'order_rescue_accepted',
        issue.circle_id,
        issue.session_id,
        currentUser.id,
        {
          scenario: issue.scenario,
          originalDishId: issue.original_dish_id,
          replacementDishId: alternative.dish_id,
          priceDiffPaise: alternative.price_diff_paise,
        }
      );
    },
    [
      isCircleAdmin,
      currentUser,
      sessions,
      useCloudPersistence,
      circles,
      members,
      demoOrders,
      mealWindows,
      voteSessions,
      persistState,
      broadcastUpdate,
    ]
  );

  const dismissRescueIssue = useCallback(
    (issueId: string) => {
      const issue = activeRescueIssue;
      setActiveRescueIssue(null);
      persistState(
        currentUser,
        circles,
        members,
        sessions,
        cartItems,
        demoOrders,
        mealWindows,
        voteSessions,
        null
      );
      broadcastUpdate({ activeRescueIssue: null });

      if (useCloudPersistence && issue) {
        upsertCloudRescueIssue(issue, 'dismissed');
      }

      if (issue) {
        analyticsService.trackEvent(
          'order_rescue_declined',
          issue.circle_id,
          issue.session_id,
          currentUser.id,
          {
            issueId,
            scenario: issue.scenario,
          }
        );
      }
    },
    [
      activeRescueIssue,
      currentUser,
      circles,
      members,
      sessions,
      cartItems,
      demoOrders,
      mealWindows,
      voteSessions,
      persistState,
      broadcastUpdate,
      useCloudPersistence,
    ]
  );

  const getJudgeDemoScenarios = useCallback(
    (circleId: string): Record<string, OrderRescueIssue> => {
      const activeSession =
        sessions.find((s) => s.circle_id === circleId && s.status === 'open') || sessions[0];
      const rest =
        DEMO_RESTAURANTS.find((r) => r.id === activeSession?.restaurant_id) || DEMO_RESTAURANTS[0];
      const circleMemberList = getCircleMembers(circleId).map((m) => m.profile);
      const effectiveMembers = circleMemberList.length > 0 ? circleMemberList : DEMO_PERSONAS;

      return getJudgeDemoRescueScenarios(
        activeSession?.id || 'sess-cse-active',
        circleId,
        rest,
        effectiveMembers,
        cartItems
      );
    },
    [sessions, getCircleMembers, cartItems]
  );

  // Checkpoint 1: Campus Pickup Pass - Mark meal as collected
  const markMealCollected = useCallback(
    (orderId: string, itemId: string) => {
      setDemoOrders((prev) => {
        const updated = prev.map((order) => {
          if (order.id !== orderId) return order;
          const updatedBreakdowns = order.member_breakdowns.map((mb) => ({
            ...mb,
            items: mb.items.map((item) => {
              if (item.id === itemId) {
                return { ...item, is_collected: !(item as CartItem).is_collected };
              }
              return item;
            }),
          }));
          return { ...order, member_breakdowns: updatedBreakdowns };
        });
        return updated;
      });

      analyticsService.trackEvent(
        'meal_marked_collected',
        '',
        orderId,
        currentUser.id,
        { itemId },
        'live_campus_pilot'
      );
    },
    [currentUser]
  );

  // Checkpoint 1: CirclePay Settlement Tracker - Update settlement status
  const updateSettlementStatus = useCallback(
    (orderId: string, userId: string, newStatus: 'pending' | 'sent' | 'confirmed') => {
      setDemoOrders((prev) => {
        const updated = prev.map((order) => {
          if (order.id !== orderId) return order;
          const updatedBreakdowns = order.member_breakdowns.map((mb) => {
            if (mb.user_id === userId) {
              return { ...mb, settlement_status: newStatus };
            }
            return mb;
          });
          return { ...order, member_breakdowns: updatedBreakdowns };
        });
        return updated;
      });

      analyticsService.trackEvent(
        newStatus === 'sent' ? 'settlement_marked_sent' : newStatus === 'confirmed' ? 'settlement_confirmed' : 'settlement_undone',
        '',
        orderId,
        currentUser.id,
        { targetUserId: userId, newStatus },
        'live_campus_pilot'
      );
    },
    [currentUser]
  );

  // Reset demo data
  const resetDemoData = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
      localStorage.removeItem(STORAGE_KEYS.CIRCLES);
      localStorage.removeItem(STORAGE_KEYS.MEMBERS);
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.CART);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.removeItem(STORAGE_KEYS.MEAL_WINDOWS);
      localStorage.removeItem(STORAGE_KEYS.VOTE_SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.RESCUE_ISSUE);
    }
    setIsDemoMode(false);
    setCurrentUser(GUEST_USER);
    setCircles([]);
    setMembers([]);
    setSessions([]);
    setCartItems([]);
    setDemoOrders([]);
    setMealWindows([]);
    setVoteSessions([]);
    setActiveRescueIssue(null);

    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }

    broadcastUpdate({
      circles: [],
      members: [],
      sessions: [],
      cartItems: [],
      demoOrders: [],
      mealWindows: [],
      voteSessions: [],
      activeRescueIssue: null,
    });
  }, [broadcastUpdate]);

  const importDemoData = useCallback(() => {
    if (!DEMO_PRESETS_ENABLED) return;
    // Isolate demo sandbox completely from any real Supabase authenticated session
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }

    setIsDemoMode(true);
    setCurrentUser(DEMO_PERSONAS[0]);
    setPersonas(DEMO_PERSONAS);
    setCircles(INITIAL_CIRCLES);
    setMembers(INITIAL_CIRCLE_MEMBERS);
    setSessions(INITIAL_SESSIONS);
    setCartItems(INITIAL_CART_ITEMS);
    setDemoOrders(INITIAL_DEMO_ORDERS);
    setMealWindows(INITIAL_MEAL_WINDOWS);
    setVoteSessions(INITIAL_VOTE_SESSIONS);
    setActiveRescueIssue(null);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'true');
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_PERSONAS[0]));
        localStorage.setItem(STORAGE_KEYS.PERSONAS, JSON.stringify(DEMO_PERSONAS));
        localStorage.setItem(STORAGE_KEYS.CIRCLES, JSON.stringify(INITIAL_CIRCLES));
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_CIRCLE_MEMBERS));
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(INITIAL_CART_ITEMS));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_DEMO_ORDERS));
        localStorage.setItem(STORAGE_KEYS.MEAL_WINDOWS, JSON.stringify(INITIAL_MEAL_WINDOWS));
        localStorage.setItem(STORAGE_KEYS.VOTE_SESSIONS, JSON.stringify(INITIAL_VOTE_SESSIONS));
        localStorage.removeItem(STORAGE_KEYS.RESCUE_ISSUE);
      } catch {}
    }

    broadcastUpdate({
      circles: INITIAL_CIRCLES,
      members: INITIAL_CIRCLE_MEMBERS,
      sessions: INITIAL_SESSIONS,
      cartItems: INITIAL_CART_ITEMS,
      demoOrders: INITIAL_DEMO_ORDERS,
      mealWindows: INITIAL_MEAL_WINDOWS,
      voteSessions: INITIAL_VOTE_SESSIONS,
      activeRescueIssue: null,
    });
  }, [broadcastUpdate]);

  const hasDemoData = isDemoMode && circles.length > 0;

  const value = useMemo(
    () => ({
      currentUser,
      personas,
      switchPersona,
      signInWithSupabaseUser,
      updateProfile,
      circles,
      createCircle,
      getCircle,
      getCircleByInviteCode,
      resolveInviteCode,
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
      supabaseSchemaStatus,
      isDemoMode,
      resetDemoData,
      importDemoData,
      hasDemoData,
      isLoaded: mounted,
      toggleMemberReady,
      updatePickupNote,
      startReorderSession,
      getMemberCartTotalPaise,
      getMemberRemainingBudgetPaise,
      mealWindows,
      getMealWindows,
      scheduleMealWindow,
      updateParticipation,
      voteSessions,
      getActiveVoteSession,
      startCircleVote,
      castCircleVote,
      finalizeCircleVote,
      applyVoteWinnerToSession,
      activeRescueIssue,
      triggerOrderRescue,
      acceptRescueReplacement,
      dismissRescueIssue,
      getJudgeDemoScenarios,
      // Checkpoint 1: Pickup & Settlement
      markMealCollected,
      updateSettlementStatus,
      theme,
      toggleTheme,
      addProfile,
      isAuthenticated,
      logout,
    }),
    [
      currentUser,
      isAuthenticated,
      isDemoMode,
      supabaseSchemaStatus,
      logout,
      personas,
      switchPersona,
      signInWithSupabaseUser,
      updateProfile,
      circles,
      createCircle,
      getCircle,
      getCircleByInviteCode,
      resolveInviteCode,
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
      importDemoData,
      hasDemoData,
      mounted,
      toggleMemberReady,
      updatePickupNote,
      startReorderSession,
      getMemberCartTotalPaise,
      getMemberRemainingBudgetPaise,
      mealWindows,
      getMealWindows,
      scheduleMealWindow,
      updateParticipation,
      voteSessions,
      getActiveVoteSession,
      startCircleVote,
      castCircleVote,
      finalizeCircleVote,
      applyVoteWinnerToSession,
      activeRescueIssue,
      triggerOrderRescue,
      acceptRescueReplacement,
      dismissRescueIssue,
      getJudgeDemoScenarios,
      markMealCollected,
      updateSettlementStatus,
      theme,
      toggleTheme,
      addProfile,
    ]
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0b0f19] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#FC8019] to-[#E86F0A] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[#FC8019]/20 animate-pulse">
          🍱
        </div>
        <p className="mt-4 text-xs font-black tracking-wider text-[#171717] dark:text-white uppercase">
          Swiggy Campus Circles
        </p>
        <p className="text-[11px] text-[#737373] dark:text-slate-400 mt-1 font-medium">
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
