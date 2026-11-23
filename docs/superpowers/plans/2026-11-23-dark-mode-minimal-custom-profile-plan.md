# Dark Mode, Minimalist UI Redesign & Real-Time Custom Profile Creation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full Dark Mode / Light Mode toggle, clean minimal UI redesign to reduce visual clutter, and an interactive real-time custom profile creation modal in the Swiggy Campus Hackathon app.

**Architecture:** We will extend `demo-context.tsx` to include theme state (`'light' | 'dark'`) persisted to `localStorage` and a `addPersona` method. We will update Tailwind configuration (`tailwind.config.ts`) and `globals.css` to support `class` dark mode, streamline component paddings/shadows for a minimal aesthetic, and add a Custom Profile modal triggered from `PersonaSwitcherBar.tsx`.

**Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide React.

**Spec:** `docs/superpowers/specs/2026-11-23-dark-mode-minimal-custom-profile-design.md`

## Global Constraints
- Must maintain all existing functionality (circles, ordering sessions, restaurant discovery, split calculation, AI metrics, judge guide).
- Zero TypeScript compilation errors and zero Next.js hydration mismatches.
- Persistent state via `localStorage` for both theme and custom profiles.

## Review Focus
1. **Hydration safety:** Theme and custom profiles initialized correctly across SSR and client render.
2. **Dark mode contrast:** Text readability and contrast on all cards, modals, and navigation bars in dark mode.
3. **Real-time profile propagation:** Newly created custom profiles immediately update `currentUser` and sync across open tabs via BroadcastChannel.
4. **Visual minimalism:** Removal of excessive gradient overlays and cramped borders while retaining Swiggy brand identity.

---

### Task 1: Theme State & CSS Setup for Dark/Light Mode

**Files:**
- Modify: `src/lib/store/demo-context.tsx`
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`

**Interfaces:**
- Consumes: Existing AppContext
- Produces: `theme: 'light' | 'dark'`, `toggleTheme: () => void` in `useApp()`

- [x] **Step 1: Update `tailwind.config.ts` to enable class-based dark mode (`darkMode: 'class'`)**
- [x] **Step 2: Update `globals.css` with dark mode background and surface variables/utilities**
- [x] **Step 3: Add `theme` state, `toggleTheme` function, and `localStorage` sync in `demo-context.tsx`**
- [x] **Step 4: Verify build compiles without errors**

### Task 2: Minimalist UI Refinement & Dark Mode Classes across Layout and Components

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/components/shared/PersonaSwitcherBar.tsx`
- Modify: `src/components/landing/HeroSection.tsx`
- Modify: `src/components/landing/FeatureBento.tsx`

**Interfaces:**
- Consumes: `theme`, `toggleTheme` from `useApp()`
- Produces: Theme toggle button in Navbar / PersonaSwitcherBar, minimal clean styling, dark mode classes on main wrappers.

- [x] **Step 1: Add Theme Toggle (Sun/Moon icon button) to `PersonaSwitcherBar.tsx` or `Navbar.tsx`**
- [x] **Step 2: Apply `dark:` classes and clean minimal whitespace padding to Navbar and HeroSection**
- [x] **Step 3: Apply `dark:` classes to FeatureBento, HowItWorks, and Footer**

### Task 3: Real-Time Custom Profile Creation Modal & State Integration

**Files:**
- Modify: `src/types/index.ts` (if needed for profile creation payload)
- Modify: `src/lib/store/demo-context.tsx` (add `addProfile` method)
- Create: `src/components/shared/AddProfileModal.tsx`
- Modify: `src/components/shared/PersonaSwitcherBar.tsx` (add `+ Profile` trigger button)

**Interfaces:**
- Consumes: `personas`, `currentUser`, `switchPersona`
- Produces: `addProfile(profileData: { full_name: string; college: string; avatar_url: string; dietary_preference: string; budget: number })` in `useApp()`

- [x] **Step 1: Add `addProfile` method to `demo-context.tsx` supporting custom profile creation and persistence**
- [x] **Step 2: Create `AddProfileModal.tsx` for capturing name, college, avatar/emoji, dietary preference, and budget**
- [x] **Step 3: Integrate "Add Profile" button into `PersonaSwitcherBar.tsx`**
- [x] **Step 4: Verify real-time profile switching and custom profile application across sessions**
