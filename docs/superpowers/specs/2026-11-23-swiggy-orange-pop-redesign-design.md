# Swiggy Orange Pop Redesign - Design Spec

**Intent & Why:** 
The previous dark charcoal aesthetic and dark floating top bar felt disconnected and heavy for a food delivery platform. Swiggy's brand identity is vibrant, appetizing, warm, and energetic. This redesign adopts the **Vibrant Playful Swiggy Orange Pop** aesthetic: warm cream/off-white backgrounds (`#FAF8F5`), rich Swiggy orange (`#FC8019`) punchy accents, warm amber/peach gradient glows, and tactile warm glass panels.

## Goals
- Remove all heavy dark charcoal/black floating elements and replace them with warm, integrated, appetizing UI components.
- Redesign `PersonaSwitcherBar` into a warm cream/amber pill bar (`bg-white/90 border-orange-200 text-charcoal-900`) that harmonizes perfectly with the top navigation and navbar.
- Ensure all pages (`/`, `/dashboard`, components) feature warm terracotta/orange ambient glows, clean pill badges, and high-contrast readable typography.
- Maintain 100% test passing and zero build errors.

## Non-Goals
- Changing core business logic, Supabase real-time store, or group cart splitting math.
- Introducing heavy dark mode themes.

## Architecture & Styling Approach
- **Color Palette:** Swiggy Orange (`#FC8019`), Warm Cream (`#FAF8F5`), Amber (`#F59E0B`), Charcoal (`#323337`).
- **Surface Styling:** `bg-white/90` or `bg-[#FAF8F5]` with thin warm orange/amber borders (`border-orange-200/80`) and soft warm shadows (`shadow-glass`).
- **Components to Update:**
  1. `src/components/shared/PersonaSwitcherBar.tsx` (Switch from dark `#0B0F17` to warm cream/amber glass pill bar)
  2. `src/components/layout/Navbar.tsx` (Harmonized top offset and warm accents)
  3. `src/components/landing/HeroSection.tsx` & `FeatureBento.tsx` (Warm amber/peach glows, clean orange pill badges)
  4. `src/app/dashboard/page.tsx` (Warm cream/white glass cards, orange metric borders)
