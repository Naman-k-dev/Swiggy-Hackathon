# Swiggy Campus Circles — Security Validation Report

> **Scope:** Authentication, Authorization, Row Level Security (RLS), Credential Storage, and API Guardrails.

---

## 1. Authentication & Session Security
- **Mechanism:** Supabase Auth with PKCE and JWT session management.
- **Validation:** Unauthenticated requests to protected routes (`/circles/*`, `/dashboard`, `/orders/*`) are automatically redirected to `/auth`.
- **Demo Mode:** Clearly separated from authenticated cloud sessions, ensuring mock data never pollutes production Supabase records.

---

## 2. Row Level Security (RLS)
- All Supabase tables (`circles`, `circle_members`, `ordering_sessions`, `cart_items`, `pickup_passes`, `settlement_records`) have RLS strictly enabled.
- **Policies Enforced:**
  - Members can only read data for circles they belong to.
  - Cart items are strictly owned by their respective creators (`user_id`).
  - Only circle admins (`admin_id`) can finalize ordering sessions or manage memberships.
  - Pickup passes and settlement records restrict updates to authorized organizers and users.

---

## 3. Secret Management & Credential Safety
- **Server-Side Secrets:** `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are strictly server-side and never exposed to the client bundle (`NEXT_PUBLIC_` prefix omitted).
- **Environment Exclusions:** `.env.local` and credential files are explicitly excluded via `.gitignore`.
- **Git History:** Scanned for exposed keys; clean repository state.

---

## 4. Input Validation & Authorization Guardrails
- **Cart Protection:** Server/store logic rejects cart modifications after the session cutoff deadline.
- **Voting Integrity:** Enforces 1 vote per member per active session with duplicate prevention.
- **Financial Safety:** No real payment processing, no UPI PIN collection, and integer-paise calculations prevent floating-point rounding errors.
