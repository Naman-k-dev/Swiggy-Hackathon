import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  StudentProfile,
  Circle,
  CircleMember,
  OrderingSession,
  CartItem,
  DemoOrder,
  RecurringMealWindow,
  CircleVoteSession,
  CircleVoteOption,
  CircleVote,
  OrderRescueIssue,
} from '@/types';

export type SupabaseSchemaStatus = 'checking' | 'ready' | 'migrations_missing' | 'disabled';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value?: string | null): boolean {
  return Boolean(value && UUID_REGEX.test(value));
}

export function isSchemaMissingError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();
  return (
    code === 'PGRST205' ||
    code === 'PGRST202' ||
    code === '42P01' ||
    msg.includes('could not find the table') ||
    msg.includes('does not exist')
  );
}

export function createCloudId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function checkCloudSchemaReadiness(): Promise<SupabaseSchemaStatus> {
  if (!isSupabaseConfigured || !supabase) return 'disabled';
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error && isSchemaMissingError(error)) {
      return 'migrations_missing';
    }
    return 'ready';
  } catch {
    return 'migrations_missing';
  }
}

export async function upsertCloudProfile(profile: StudentProfile): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !isUuid(profile.id)) return;
  try {
    await supabase.from('profiles').upsert({
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      avatar_url: profile.avatar_url || null,
      college: profile.college,
      academic_year: profile.academic_year || 'Student',
      dietary_pref: profile.dietary_pref || 'BOTH',
      preferred_budget: profile.preferred_budget || 250,
      is_demo_account: false,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // non-fatal fallback
  }
}

export async function fetchUserCloudState(userId: string): Promise<{
  schemaStatus: SupabaseSchemaStatus;
  profiles: Map<string, StudentProfile>;
  circles: Circle[];
  members: CircleMember[];
  sessions: OrderingSession[];
  cartItems: CartItem[];
  orders: DemoOrder[];
  mealWindows: RecurringMealWindow[];
  voteSessions: CircleVoteSession[];
  activeRescueIssue: OrderRescueIssue | null;
} | null> {
  if (!isSupabaseConfigured || !supabase || !isUuid(userId)) return null;

  const profilesMap = new Map<string, StudentProfile>();

  const { data: circlesData, error: circlesErr } = await supabase
    .from('circles')
    .select('*')
    .order('created_at', { ascending: false });

  if (circlesErr) {
    if (isSchemaMissingError(circlesErr)) {
      return {
        schemaStatus: 'migrations_missing',
        profiles: profilesMap,
        circles: [],
        members: [],
        sessions: [],
        cartItems: [],
        orders: [],
        mealWindows: [],
        voteSessions: [],
        activeRescueIssue: null,
      };
    }
    return null;
  }

  const circles: Circle[] = (circlesData || []) as Circle[];
  const circleIds = circles.map((c) => c.id);

  if (circleIds.length === 0) {
    return {
      schemaStatus: 'ready',
      profiles: profilesMap,
      circles: [],
      members: [],
      sessions: [],
      cartItems: [],
      orders: [],
      mealWindows: [],
      voteSessions: [],
      activeRescueIssue: null,
    };
  }

  const [
    membersRes,
    sessionsRes,
    cartRes,
    ordersRes,
    windowsRes,
    voteSessionsRes,
    rescueRes,
  ] = await Promise.all([
    supabase.from('circle_members').select('*').in('circle_id', circleIds),
    supabase.from('ordering_sessions').select('*').in('circle_id', circleIds).order('created_at', { ascending: false }),
    supabase.from('cart_items').select('*').in('circle_id', circleIds),
    supabase.from('demo_orders').select('*').in('circle_id', circleIds).order('created_at', { ascending: false }),
    supabase.from('recurring_meal_windows').select('*').in('circle_id', circleIds),
    supabase.from('circle_vote_sessions').select('*').in('circle_id', circleIds).order('created_at', { ascending: false }),
    supabase.from('order_rescue_events').select('*').in('circle_id', circleIds).eq('status', 'detected').order('created_at', { ascending: false }).limit(1),
  ]);

  const members: CircleMember[] = (membersRes.data || []) as CircleMember[];
  const memberIds = Array.from(new Set(members.map((m) => m.user_id)));

  if (memberIds.length > 0) {
    const { data: profilesData } = await supabase.from('profiles').select('*').in('id', memberIds);
    (profilesData || []).forEach((p) => {
      profilesMap.set(p.id, p as StudentProfile);
    });
  }

  const sessions: OrderingSession[] = (sessionsRes.data || []) as OrderingSession[];
  const cartItems: CartItem[] = (cartRes.data || []) as CartItem[];
  const orders: DemoOrder[] = (ordersRes.data || []) as DemoOrder[];
  const mealWindows: RecurringMealWindow[] = (!windowsRes.error && windowsRes.data ? windowsRes.data : []) as RecurringMealWindow[];

  const rawVoteSessions = (!voteSessionsRes.error && voteSessionsRes.data ? voteSessionsRes.data : []) as Array<Record<string, unknown>>;
  let voteSessions: CircleVoteSession[] = [];

  if (rawVoteSessions.length > 0) {
    const voteSessionIds = rawVoteSessions.map((v) => String(v.id));
    const [optsRes, votesRes] = await Promise.all([
      supabase.from('circle_vote_options').select('*').in('session_id', voteSessionIds),
      supabase.from('circle_votes').select('*').in('session_id', voteSessionIds),
    ]);

    const allOpts = (optsRes.data || []) as Array<CircleVoteOption & { session_id: string }>;
    const allVotes = (votesRes.data || []) as CircleVote[];

    voteSessions = rawVoteSessions.map((vs) => {
      const sid = String(vs.id);
      const sessionVotes = allVotes.filter((v) => v.session_id === sid);
      const votesMap: Record<string, CircleVote> = {};
      sessionVotes.forEach((v) => {
        votesMap[v.user_id] = v;
      });
      const options: CircleVoteOption[] = allOpts
        .filter((o) => o.session_id === sid)
        .map((o) => ({
          ...o,
          voter_user_ids: sessionVotes.filter((v) => v.option_id === o.id).map((v) => v.user_id),
        }));

      return {
        ...(vs as unknown as CircleVoteSession),
        options,
        votes: votesMap,
      };
    });
  }

  let activeRescueIssue: OrderRescueIssue | null = null;
  if (!rescueRes.error && rescueRes.data && rescueRes.data.length > 0) {
    const raw = rescueRes.data[0] as Record<string, unknown>;
    activeRescueIssue = {
      id: String(raw.id),
      session_id: String(raw.session_id),
      circle_id: String(raw.circle_id),
      user_id: String(raw.user_id),
      user_name: String(raw.user_name),
      scenario: raw.scenario as OrderRescueIssue['scenario'],
      original_dish_id: String(raw.original_dish_id),
      original_dish_name: String(raw.original_dish_name),
      original_price_paise: Number(raw.original_price_paise),
      reason: String(raw.reason),
      suggested_alternatives: (raw.suggested_alternatives || []) as OrderRescueIssue['suggested_alternatives'],
      created_at: String(raw.created_at),
      is_demo: false,
    };
  }

  return {
    schemaStatus: 'ready',
    profiles: profilesMap,
    circles,
    members,
    sessions,
    cartItems,
    orders,
    mealWindows,
    voteSessions,
    activeRescueIssue,
  };
}

export async function lookupCloudCircleByInvite(inviteCode: string): Promise<Circle | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.rpc('lookup_circle_by_invite_code', {
      p_invite_code: inviteCode.trim().toUpperCase(),
    });
    if (error || !Array.isArray(data) || data.length === 0) return null;
    return data[0] as Circle;
  } catch {
    return null;
  }
}

export async function createCloudCircle(circle: Circle, adminMember: CircleMember): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !isUuid(circle.id) || !isUuid(circle.admin_id)) return false;
  try {
    const { error: cErr } = await supabase.from('circles').insert({
      id: circle.id,
      name: circle.name,
      type: circle.type,
      college: circle.college,
      description: circle.description,
      emoji: circle.emoji,
      banner_gradient: circle.banner_gradient,
      invite_code: circle.invite_code,
      preferred_budget: circle.preferred_budget,
      admin_id: circle.admin_id,
      created_at: circle.created_at,
    });
    if (cErr) return false;

    const { error: mErr } = await supabase.from('circle_members').insert({
      id: adminMember.id,
      circle_id: circle.id,
      user_id: adminMember.user_id,
      role: 'admin',
      joined_at: adminMember.joined_at,
    });
    return !mErr;
  } catch {
    return false;
  }
}

export async function joinCloudCircleByInvite(circleId: string, inviteCode: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase || !isUuid(circleId)) {
    return { ok: false, error: 'Cloud circle unavailable' };
  }
  try {
    const { error } = await supabase.rpc('join_circle_with_invite_code', {
      p_circle_id: circleId,
      p_invite_code: inviteCode,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Join failed' };
  }
}

export async function upsertCloudSession(session: OrderingSession): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !isUuid(session.id) || !isUuid(session.circle_id)) return;
  try {
    await supabase.from('ordering_sessions').upsert({
      id: session.id,
      circle_id: session.circle_id,
      created_by: session.created_by,
      restaurant_id: session.restaurant_id,
      restaurant_name: session.restaurant_name,
      restaurant_image: session.restaurant_image || null,
      status: session.status,
      cutoff_time: session.cutoff_time || null,
      delivery_location: session.delivery_location,
      pickup_note: session.pickup_note || null,
      ready_member_ids: (session.ready_member_ids || []).filter((id) => isUuid(id)),
      meal_type: session.meal_type || null,
      session_name: session.session_name || null,
      recurrence: session.recurrence || null,
      participations: session.participations || {},
      created_at: session.created_at,
      updated_at: session.updated_at || new Date().toISOString(),
    });
  } catch {
    // non-fatal fallback
  }
}

export async function upsertCloudCartItem(item: CartItem): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !isUuid(item.id) || !isUuid(item.session_id)) return;
  try {
    await supabase.from('cart_items').upsert({
      id: item.id,
      session_id: item.session_id,
      circle_id: item.circle_id,
      user_id: item.user_id,
      user_name: item.user_name,
      user_avatar: item.user_avatar || null,
      item_id: item.item_id,
      item_name: item.item_name,
      item_price_paise: item.item_price_paise,
      item_is_veg: item.item_is_veg,
      quantity: item.quantity,
      customization: item.customization || null,
      created_at: item.created_at,
      updated_at: item.updated_at || new Date().toISOString(),
    });
  } catch {
    // non-fatal fallback
  }
}

export async function deleteCloudCartItem(itemId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !isUuid(itemId)) return;
  try {
    await supabase.from('cart_items').delete().eq('id', itemId);
  } catch {
    // non-fatal fallback
  }
}

export async function insertCloudDemoOrder(order: DemoOrder): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !isUuid(order.id) || !isUuid(order.circle_id)) return;
  try {
    const { error } = await supabase.from('demo_orders').insert({
      id: order.id,
      order_code: order.order_code,
      circle_id: order.circle_id,
      circle_name: order.circle_name,
      session_id: isUuid(order.session_id) ? order.session_id : null,
      placed_by_id: order.placed_by_id,
      placed_by_name: order.placed_by_name,
      restaurant_name: order.restaurant_name,
      restaurant_id: order.restaurant_id,
      subtotal_paise: order.subtotal_paise,
      delivery_fee_paise: order.delivery_fee_paise,
      platform_fee_paise: order.platform_fee_paise,
      discount_paise: order.discount_paise,
      total_paise: order.total_paise,
      total_items_count: order.total_items_count,
      status: order.status,
      delivery_location: order.delivery_location,
      delivery_instructions: order.delivery_instructions || null,
      member_breakdowns: order.member_breakdowns,
      created_at: order.created_at,
    });
    if (error) return;

    const itemRows = order.member_breakdowns.flatMap((mb) =>
      (mb.items || []).map((ci) => ({
        order_id: order.id,
        user_id: mb.user_id,
        user_name: mb.user_name,
        item_name: ci.item_name,
        item_price_paise: ci.item_price_paise,
        quantity: ci.quantity,
        total_paise: ci.item_price_paise * ci.quantity,
        is_veg: ci.item_is_veg,
      }))
    );
    if (itemRows.length > 0) {
      await supabase.from('demo_order_items').insert(itemRows);
    }
  } catch {
    // non-fatal fallback
  }
}

export async function insertCloudMealWindow(windowItem: RecurringMealWindow, createdBy: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !isUuid(windowItem.id) || !isUuid(createdBy)) return;
  try {
    await supabase.from('recurring_meal_windows').insert({
      id: windowItem.id,
      circle_id: windowItem.circle_id,
      meal_type: windowItem.meal_type,
      title: windowItem.title,
      target_time: windowItem.target_time,
      cutoff_minutes_before: windowItem.cutoff_minutes_before,
      recurrence: windowItem.recurrence,
      preferred_restaurant_id: windowItem.preferred_restaurant_id || null,
      preferred_restaurant_name: windowItem.preferred_restaurant_name || null,
      pickup_point: windowItem.pickup_point,
      active: windowItem.active,
      created_by: createdBy,
      created_at: windowItem.created_at,
    });
  } catch {
    // non-fatal fallback
  }
}

export async function upsertCloudVoteSession(voteSession: CircleVoteSession, insertOptions = false): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !isUuid(voteSession.id) || !isUuid(voteSession.circle_id)) return;
  try {
    await supabase.from('circle_vote_sessions').upsert({
      id: voteSession.id,
      circle_id: voteSession.circle_id,
      meal_session_id: isUuid(voteSession.meal_session_id) ? voteSession.meal_session_id : null,
      created_by: voteSession.created_by,
      title: voteSession.title,
      status: voteSession.status,
      cutoff_time: voteSession.cutoff_time,
      winning_option_id: isUuid(voteSession.winning_option_id) ? voteSession.winning_option_id : null,
      winning_restaurant_id: voteSession.winning_restaurant_id || null,
      winning_restaurant_name: voteSession.winning_restaurant_name || null,
      winner_reason: voteSession.winner_reason || null,
      ai_summary: voteSession.ai_summary || null,
      created_at: voteSession.created_at,
      updated_at: voteSession.updated_at,
    });

    if (insertOptions && voteSession.options.length > 0) {
      await supabase.from('circle_vote_options').upsert(
        voteSession.options.map((opt) => ({
          id: opt.id,
          session_id: voteSession.id,
          restaurant_id: opt.restaurant_id,
          restaurant_name: opt.restaurant_name,
          restaurant_image: opt.restaurant_image || null,
          cuisine: opt.cuisine,
          price_range_text: opt.price_range_text,
          group_compatibility_score: opt.group_compatibility_score,
          estimated_group_subtotal_paise: opt.estimated_group_subtotal_paise,
          dietary_summary: opt.dietary_summary,
          budget_summary: opt.budget_summary,
          source: opt.source,
          vote_count: opt.vote_count,
        }))
      );
    }
  } catch {
    // non-fatal fallback
  }
}

export async function upsertCloudVote(vote: CircleVote): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !isUuid(vote.session_id) || !isUuid(vote.option_id) || !isUuid(vote.user_id)) return;
  try {
    await supabase.from('circle_votes').upsert(
      {
        session_id: vote.session_id,
        option_id: vote.option_id,
        user_id: vote.user_id,
        user_name: vote.user_name,
        user_avatar: vote.user_avatar || null,
        voted_at: vote.voted_at,
      },
      { onConflict: 'session_id,user_id' }
    );
  } catch {
    // non-fatal fallback
  }
}

export async function upsertCloudRescueIssue(
  issue: OrderRescueIssue,
  status: 'detected' | 'resolved' | 'dismissed',
  selectedReplacementId?: string
): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !isUuid(issue.id) || !isUuid(issue.session_id)) return;
  try {
    await supabase.from('order_rescue_events').upsert({
      id: issue.id,
      session_id: issue.session_id,
      circle_id: issue.circle_id,
      user_id: issue.user_id,
      user_name: issue.user_name,
      scenario: issue.scenario,
      original_dish_id: issue.original_dish_id,
      original_dish_name: issue.original_dish_name,
      original_price_paise: issue.original_price_paise,
      reason: issue.reason,
      status,
      suggested_alternatives: issue.suggested_alternatives,
      selected_replacement_id: selectedReplacementId || null,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      created_at: issue.created_at,
    });
  } catch {
    // non-fatal fallback
  }
}
