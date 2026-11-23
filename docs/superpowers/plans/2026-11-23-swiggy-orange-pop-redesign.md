# Swiggy Orange Pop Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the UI from the dark charcoal floating style into a vibrant, appetizing Swiggy Orange Pop aesthetic with warm cream backgrounds (`#FAF8F5`), warm glass pill bars, and clean orange/amber accents.

**Architecture:** Replace dark charcoal backgrounds (`#0B0F17`) and floating dark bars with warm cream/white glass panels (`bg-white/90` or `bg-[#FAF8F5]`), warm amber/orange borders, and friendly pill-shaped navigation.

**Tech Stack:** Next.js 15, Tailwind CSS, TypeScript, Lucide React, Framer Motion.

**Spec:** `docs/superpowers/specs/2026-11-23-swiggy-orange-pop-redesign-design.md`

## Global Constraints
- Zero build errors, zero TypeScript errors.
- Preserve 100% of existing functionality, real-time sync, and unit tests.
- Warm cream/white background theme with vibrant Swiggy orange accents.

## Review Focus
1. PersonaSwitcherBar visibility and contrast against light backgrounds.
2. Navbar sticky alignment matching the top warm pill bar.
3. Hero and feature section warm gradient glowing orbs.
4. Dashboard card glassmorphism readability.

---

### Task 1: Redesign PersonaSwitcherBar to Warm Cream/Orange Aesthetic

**Files:**
- Modify: `src/components/shared/PersonaSwitcherBar.tsx`
- Modify: `src/components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: `useApp()` store hook.
- Produces: Warm cream/amber glass pill top bar (`bg-white/90 backdrop-blur-xl border border-orange-200/80 shadow-glass text-charcoal-900`).

- [ ] **Step 1: Update PersonaSwitcherBar.tsx styling to warm orange/cream aesthetic**

Replace dark `#0B0F17` wrapper with warm glass styling:
```tsx
<div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 pointer-events-none">
  <div className="pointer-events-auto bg-white/90 backdrop-blur-2xl border border-orange-200/90 text-charcoal-900 rounded-full shadow-[0_16px_40px_rgba(252,128,25,0.12)] px-4 py-2 flex flex-wrap items-center justify-between gap-3 ring-1 ring-orange-500/10">
```
And adjust inner text colors (`text-white` to `text-charcoal-900`, `bg-white/5` to `bg-charcoal-50`, etc.).

- [ ] **Step 2: Update Navbar.tsx top offset and styling to match**

Verify Navbar top offset and light background styling.

- [ ] **Step 3: Run build and tests to verify compilation**

Run: `npm run build`
Expected: PASS with zero errors.

- [ ] **Step 4: Commit changes**

```bash
git add src/components/shared/PersonaSwitcherBar.tsx src/components/layout/Navbar.tsx
git commit -m "refactor: redesign PersonaSwitcherBar to warm Swiggy orange cream aesthetic"
```

---

### Task 2: Redesign Hero, Bento Features, and Dashboard with Warm Orange Pop

**Files:**
- Modify: `src/components/landing/HeroSection.tsx`
- Modify: `src/components/landing/FeatureBento.tsx`
- Modify: `src/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: Shared UI components and store.
- Produces: Warm cream/white landing and dashboard pages with vibrant Swiggy orange/amber gradient glows.

- [ ] **Step 1: Update HeroSection.tsx background glows and mockup card**

Ensure background glows use `orange-300/20` and `amber-200/20`, and mockup card uses warm glass styling.

- [ ] **Step 2: Update FeatureBento.tsx bento cards**

Ensure feature bento cards use warm glass cards with amber/orange gradient accents.

- [ ] **Step 3: Update Dashboard page card styles**

Ensure dashboard circles and order history cards use warm glass cards (`glass-card`).

- [ ] **Step 4: Run production build and test suite**

Run: `npm run build && npm test`
Expected: PASS with all tests green and zero build errors.

- [ ] **Step 5: Commit changes**

```bash
git add src/components/landing/HeroSection.tsx src/components/landing/FeatureBento.tsx src/app/dashboard/page.tsx
git commit -m "refactor: apply Swiggy orange pop warm glass design across landing and dashboard"
```
