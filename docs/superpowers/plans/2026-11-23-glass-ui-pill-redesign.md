# Glass UI & Pill Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Swiggy Campus Circles UI into a stunning, modern glassmorphism interface featuring frosted glass blurs, interactive pill badges, refined glowing borders, and sleek micro-interactions while maintaining 100% build stability and test passes.

**Architecture:** Enhance Tailwind CSS configuration and global styles with glassmorphism utility classes (`backdrop-blur-xl`, translucent RGBA backgrounds, thin gradient borders) and upgrade core layout, navigation, persona switcher, and dashboard cards to use the new glass pill aesthetic.

**Tech Stack:** Next.js 15, Tailwind CSS 4/3, Framer Motion, TypeScript.

**Spec:** User request for modern glass UI, blurs, and pill components ("modern means a glass ui blurs pills damn it looks sexy implement it").

## Global Constraints

- Zero Next.js build errors or TypeScript strict failures.
- Preserve all existing functionality (real-time sync, paise-accurate math, persona switching, checkout simulation).
- Maintain WCAG contrast and readability over frosted glass backgrounds.

## Review Focus

1. **Readability on Glass:** Ensuring text over frosted glass is high contrast and legible in both light and dark contexts.
2. **Backdrop Blur Performance:** Ensuring `backdrop-blur-md` / `backdrop-blur-xl` renders smoothly without layout jank.
3. **Pill Interaction States:** Hover and active scale states on filter and navigation pills.
4. **Build Stability:** Clean Next.js compilation with zero warnings or hydration mismatches.

---

### Task 1: Enhance Tailwind Configuration and Global CSS for Glassmorphism

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`

**Interfaces:**
- Consumes: Tailwind CSS base setup.
- Produces: Utility classes `.glass-panel`, `.glass-pill`, `.glass-card`, `.glow-orange`.

- [ ] **Step 1: Add glass utility classes to `src/app/globals.css`**

Add CSS variables and utility classes for glass panels, blurs, and pill badges.

- [ ] **Step 2: Update `tailwind.config.ts` with custom glass shadows and blur helpers**

- [ ] **Step 3: Run build check to verify CSS validity**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit changes**

```bash
git add src/app/globals.css tailwind.config.ts
git commit -m "feat(ui): add glassmorphism and pill design tokens"
```

---

### Task 2: Redesign PersonaSwitcherBar with Glass Pill Aesthetics

**Files:**
- Modify: `src/components/shared/PersonaSwitcherBar.tsx`

**Interfaces:**
- Consumes: Glass utility classes from Task 1.
- Produces: Glass-morphic floating top bar with animated pills.

- [ ] **Step 1: Update PersonaSwitcherBar to use frosted glass styling, backdrop blur, and pill buttons**

- [ ] **Step 2: Test build and UI rendering**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit changes**

```bash
git add src/components/shared/PersonaSwitcherBar.tsx
git commit -m "feat(ui): upgrade PersonaSwitcherBar to glass pill aesthetic"
```

---

### Task 3: Upgrade Landing and Dashboard Cards to Glassmorphic Cards

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/circles/[id]/page.tsx`

**Interfaces:**
- Consumes: Glass classes and pill components.
- Produces: Polished dashboard and landing views with immersive glass cards and pill tags.

- [ ] **Step 1: Refactor Landing page hero and bento grid to use `.glass-card` and pill tags**

- [ ] **Step 2: Refactor Dashboard active circle and metric cards with glass panels**

- [ ] **Step 3: Refactor Circle cart and session view with glass panels and pill badges**

- [ ] **Step 4: Run full test suite and production build**

Run: `npm test && npm run build && npm run lint`
Expected: All tests pass, build succeeds, zero lint errors.

- [ ] **Step 5: Commit changes**

```bash
git add src/app/page.tsx src/app/dashboard/page.tsx src/app/circles/
git commit -m "feat(ui): apply glassmorphism and pill aesthetic across landing, dashboard, and circles"
```
