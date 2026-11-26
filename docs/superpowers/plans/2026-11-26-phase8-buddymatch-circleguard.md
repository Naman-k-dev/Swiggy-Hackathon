# Phase 8: Campus BuddyMatch + CircleGuard Security Hardening Implementation Plan

**Goal:** Implement Campus BuddyMatch group-discovery system and CircleGuard backend security hardening, database migrations, RLS policies, negative security tests, and verification reporting on the `main` branch.

**Architecture:** 
- **Database & RLS:** New tables (`buddy_match_preferences`, `circle_discovery_settings`, `circle_join_requests`, `user_blocks`, `abuse_reports`, `security_audit_events`) with strict Row Level Security (RLS) and secure SECURITY DEFINER functions for atomic join requests, approval workflows, and audit logging.
- **Campus BuddyMatch Engine:** Deterministic compatibility scoring engine based on campus overlap, meal windows, budget ranges, cuisine interests, and circle capacity, with opt-in controls and admin join request approval.
- **CircleGuard Security System:** Server-side authorization guards, audit event logging, security activity history, and privacy controls.
- **Frontend & Navigation:** Premium mobile-first BuddyMatch UI, privacy settings, and security activity dashboard integrated into existing Swiggy Campus Circles navigation.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Supabase PostgreSQL, RLS, Node.js Test Runner.

**Spec:** Pasted prompt for Phase 8 (Campus BuddyMatch + CircleGuard Security Hardening).

## Global Constraints
- Work ONLY on the existing `main` branch.
- No new feature branches. No force-pushing.
- Preserve all existing features working (66 passing tests must remain passing).
- Zero vulnerabilities in `npm audit`, zero TypeScript compilation errors (`tsc --noEmit`), zero lint errors.

## Review Focus
1. **RLS & Authorization:** Ensure non-members cannot read private circles or approve join requests, users cannot approve their own requests, and capacity limits cannot be bypassed.
2. **Privacy & Opt-In:** Ensure BuddyMatch discovery requires explicit opt-in, private circles never appear in discovery, and sensitive dietary or budget data is not publicly exposed.
3. **Audit Integrity:** Ensure security audit events and join requests are append-only and controlled by secure server actions or database triggers.

---

### Task 1: Audit Documentation & Database Migration

**Files:**
- Create: `docs/PHASE8_AUDIT.md`
- Create: `supabase/migrations/20261126_phase8_buddymatch_circleguard.sql`

- [ ] **Step 1: Write `docs/PHASE8_AUDIT.md` detailing architecture, security posture, migrations, RLS policies, and verification status.**
- [ ] **Step 2: Write `supabase/migrations/20261126_phase8_buddymatch_circleguard.sql` with tables, indexes, RLS policies, and SECURITY DEFINER functions.**
- [ ] **Step 3: Run schema validation test.**

---

### Task 2: BuddyMatch Engine & CircleGuard Security Logic

**Files:**
- Create: `src/lib/buddymatch/buddymatch-engine.ts`
- Create: `src/lib/security/circleguard.ts`
- Test: `tests/phase8-buddymatch-circleguard.test.mjs`

- [ ] **Step 1: Implement compatibility calculation, scoring, and explanation generator in `src/lib/buddymatch/buddymatch-engine.ts`.**
- [ ] **Step 2: Implement CircleGuard audit logging and permission verification helpers in `src/lib/security/circleguard.ts`.**
- [ ] **Step 3: Write failing unit tests in `tests/phase8-buddymatch-circleguard.test.mjs`.**

---

### Task 3: API Routes & Server Actions

**Files:**
- Create: `src/app/api/buddymatch/preferences/route.ts`
- Create: `src/app/api/buddymatch/recommendations/route.ts`
- Create: `src/app/api/buddymatch/requests/route.ts`
- Create: `src/app/api/security/audit/route.ts`

- [ ] **Step 1: Implement preferences management and discovery opt-in/opt-out API routes.**
- [ ] **Step 2: Implement recommendation and join-request submission/approval API routes with strict server-side authorization.**
- [ ] **Step 3: Implement security audit event logging API route.**

---

### Task 4: Frontend Components for BuddyMatch & CircleGuard

**Files:**
- Create: `src/components/buddymatch/BuddyMatchModal.tsx`
- Create: `src/components/security/CircleGuardActivityModal.tsx`
- Create: `src/components/security/PrivacySettingsModal.tsx`

- [ ] **Step 1: Build `BuddyMatchModal.tsx` with Find My Food Squad UI, preference filters, compatible circle cards, compatibility explanations, and join request actions.**
- [ ] **Step 2: Build `CircleGuardActivityModal.tsx` to display account security events and group-management audit history.**
- [ ] **Step 3: Build `PrivacySettingsModal.tsx` for discovery toggles and privacy controls.**

---

### Task 5: Navigation & Dashboard Integration

**Files:**
- Modify: `src/components/layout/Navbar.tsx:40-90`
- Modify: `src/app/dashboard/page.tsx:30-100`

- [ ] **Step 1: Add BuddyMatch and Security Center navigation links to `Navbar.tsx`.**
- [ ] **Step 2: Add BuddyMatch Discovery & CircleGuard security widgets to `dashboard/page.tsx`.**

---

### Task 6: Comprehensive Negative Security Tests & Execution

**Files:**
- Modify: `tests/phase8-buddymatch-circleguard.test.mjs`

- [ ] **Step 1: Add negative security tests covering RLS isolation, unauthorized approval attempts, duplicate request prevention, capacity limits, and opt-out enforcement.**
- [ ] **Step 2: Run full test suite (`npm test`) and ensure all 60+ tests pass.**

---

### Task 7: Final Verification, Implementation Report, and Commit

**Files:**
- Create: `docs/PHASE8_IMPLEMENTATION_REPORT.md`

- [ ] **Step 1: Run verification commands (`npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm audit`).**
- [ ] **Step 2: Write `docs/PHASE8_IMPLEMENTATION_REPORT.md`.**
- [ ] **Step 3: Commit and push directly to `origin/main` with required attribution.**
