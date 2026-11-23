# Design Document: Dark Mode, Minimalist UI Redesign & Real-Time Custom Profile Creation

## Intent & Why
The Swiggy Campus Hackathon prototype needs to be elevated for judges and users:
1. **Dark Mode & Light Mode Toggle:** Provide a seamless theme toggle supporting both dark and light modes with persistent preference.
2. **Minimalist UI Redesign:** Reduce visual clutter (excessive gradients, overlapping badges, cramped layouts) in favor of a clean, breathable, modern aesthetic.
3. **Real-Time Custom Profile Creation:** Allow users to create their own custom student profile on the fly (name, college, avatar/emoji, dietary preference, budget) and apply it instantly in real-time across the app.

## Goals, Non-Goals, Anti-Goals
- **Goals:**
  - Full dark mode support across all pages, components, modals, and navigation bars using Tailwind CSS dark classes (`dark:...`).
  - Clean, minimal typography and spacing to eliminate clutter.
  - Interactive "Add Profile" modal integrated directly into the persona switcher bar with instant real-time state update.
  - Zero hydration mismatches in Next.js.
- **Non-Goals:**
  - Changing backend architecture or database schemas beyond local state/context and localStorage persistence.
- **Anti-Goals:**
  - Overly complex multi-step forms for profile creation (keep it to a single streamlined modal).

## Approaches Considered
1. **Approach A (Selected):** Tailwind class-based theme provider (`dark` class on root HTML/body), CSS variables for colors, minimalist whitespace cleanup across components, and a modal-based custom profile creator in `demo-context.tsx`.
2. **Approach B:** CSS-in-JS styling without Tailwind dark mode utilities (rejected due to existing Tailwind setup).

## Detailed Design
1. **Theme Management (`ThemeProvider` / `globals.css` / Navbar Toggle):**
   - Add a theme state (`'light' | 'dark'`) stored in `localStorage` (`scc_theme_v1`).
   - Add a Sun/Moon toggle button in the top Navbar / Persona Switcher Bar.
   - Apply `dark` class to `document.documentElement`.
   - Update Tailwind configuration and component classes to support `dark:bg-slate-900`, `dark:text-slate-100`, `dark:border-slate-800`, etc.
2. **Minimalist UI Cleanup:**
   - Reduce padding density slightly, simplify heavy drop shadows, remove redundant badge pills, ensure clean cards with subtle borders (`border-gray-200 dark:border-slate-800`).
3. **Real-Time Custom Profile Creation:**
   - Add an `addPersona` function to `AppProvider` in `demo-context.tsx`.
   - Add a `+ New Profile` button in `PersonaSwitcherBar.tsx`.
   - Modal dialog captures: Full Name, College/Hostel, Avatar URL / Emoji, Dietary Preference (Veg/Non-Veg), Budget.
   - Instantly appends to `personas` list and sets as `currentUser`.
