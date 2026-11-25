# Checkpoint 1 Implementation Plan: Campus Pickup Pass & CirclePay Tracker

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Campus Pickup Pass for organized meal collection and CirclePay Tracker for contribution settlement tracking.

**Architecture:** 
- **Pickup Pass:** Integrated into the order tracking page. Uses unique session identifiers and participant-specific QR codes.
- **CirclePay Tracker:** A contribution tracking system (non-financial) within the shared cart or order details page to mark shares as settled.

**Tech Stack:** React (Next.js App Router), Tailwind CSS, Lucide React, Supabase (PostgreSQL), QRCode.react library for QR codes.

**Spec:** [pasted_content id="e190"]

## Global Constraints
- Primary orange: #FC8019, Background: #FAFAF8, Text: #171717.
- Use integer paise for all monetary calculations.
- No real payments or banking credentials.
- Mobile-first responsive design.

## Review Focus
- QR codes should use opaque, time-limited identifiers (simulated in demo).
- Only the organizer can mark meals as collected.
- Each member can only mark their own contribution as "Sent" in CirclePay.
- Organizer confirms "Received" in CirclePay.

---

### Task 1: Database Schema for Pickup & Settlement

**Files:**
- Create: `supabase/migrations/20261125_checkpoint1_schema.sql`

**Interfaces:**
- Produces: `pickup_passes`, `pickup_confirmations`, `settlement_records` tables.

- [ ] **Step 1: Write SQL migration for new tables with RLS**
- [ ] **Step 2: Commit**

### Task 2: Types for Pickup & Settlement

**Files:**
- Create: `src/types/checkpoint1.ts`

**Interfaces:**
- Produces: `PickupPass`, `SettlementRecord` interfaces.

- [ ] **Step 1: Define TypeScript interfaces based on the schema**
- [ ] **Step 2: Commit**

### Task 3: Campus Pickup Pass UI Component

**Files:**
- Create: `src/components/orders/PickupPassCard.tsx`
- Modify: `src/app/circles/[id]/orders/[orderId]/page.tsx`

**Interfaces:**
- Consumes: `DemoOrder`, `currentUser`.
- Produces: `PickupPassCard` component displaying QR and checklist.

- [ ] **Step 1: Create `PickupPassCard` with QR code generation (using `qrcode.react`)**
- [ ] **Step 2: Integrate into Order Tracking page**
- [ ] **Step 3: Test collection checklist functionality**
- [ ] **Step 4: Commit**

### Task 4: CirclePay Tracker Drawer/Component

**Files:**
- Create: `src/components/orders/CirclePayTracker.tsx`
- Modify: `src/app/circles/[id]/orders/[orderId]/page.tsx`

**Interfaces:**
- Consumes: `MemberBreakdown`, `currentUser`.
- Produces: `CirclePayTracker` component for settlement tracking.

- [ ] **Step 1: Create `CirclePayTracker` with "Mark as Sent" and "Confirm Received" logic**
- [ ] **Step 2: Implement progress indicator and outstanding totals**
- [ ] **Step 3: Integrate into Order Tracking page**
- [ ] **Step 4: Commit**

### Task 5: Integration & Verification

**Files:**
- Modify: `src/lib/store/demo-context.tsx`
- Create: `tests/checkpoint1-features.test.mjs`

- [ ] **Step 1: Add store methods for marking pickup and settlement**
- [ ] **Step 2: Write verification tests for Task 3 and 4**
- [ ] **Step 3: Run all tests**
- [ ] **Step 4: Commit**
