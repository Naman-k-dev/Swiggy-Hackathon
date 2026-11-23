# 🍱 Swiggy Campus Circles — Concept Prototype

> **Swiggy Food for Thought 2.0 Competition Entry**  
> *Tagline:* **Your Campus. Your Circle. Your Food.**  
> *Concept prototype developed for presentation and evaluation.*

---

## 🌟 Executive Summary & Product Vision

**Swiggy Campus Circles** is a campus-first, collaborative group-ordering platform engineered to solve real college students' food-ordering challenges:
- **Coordination Chaos on WhatsApp:** Endless group messages debating restaurants, order items, and delivery timing.
- **Awkward Bill Collection:** One student fronts ₹800–₹1,200 and chases friends for days over UPI.
- **Fragmented Delivery Fees:** 4 students on the same hostel floor paying ₹160+ in separate delivery, surge, and platform fees.
- **Missed Group Orders:** Students missing out because someone placed an order early without a synchronized deadline.

Unlike ephemeral one-time cart links, **Campus Circles** introduces **persistent campus communities** (hostel wings, project teams, department batches, clubs), student budget guardrails, automatic paise-accurate individual bill splitting, synchronized cutoff countdowns, and consolidated single-point campus drop-offs.

---

## 🚀 Key Features Built in Phase 1 MVP

1. **Top Competition Evaluator Bar (`PersonaSwitcherBar`)**
   - Instant 1-click switcher between 4 pre-configured student personas:
     - **Aarav Sharma (Admin)** — 3rd Year CSE, Flexible budget (₹250), Circle Admin.
     - **Ananya Iyer (Member)** — 3rd Year CSE, Strictly Veg (₹180 budget).
     - **Rohan Mehta (Member)** — 3rd Year CSE, Non-Veg enthusiast (₹220 budget).
     - **Priya Nair (Member)** — 2nd Year ECE, Budget student (₹160 budget).
   - Real-time synchronization indicator (Supabase Realtime / Cross-Tab BroadcastChannel sync).
   - Instant "Reset Seed" button to restore clean benchmark states anytime.
   - Built-in **Judge Guide Modal** explaining the 2-minute testing journey.

2. **Landing Page (`/`)**
   - High-impact hero section with live interactive card mockup.
   - 4-step "How It Works" visual breakdown (Create → Invite → Add Food → Lock & Finalize).
   - Problem vs. Solution campus comparison matrix.
   - Modern Bento-grid feature showcase.
   - Interactive demo preview section with direct action triggers.

3. **Authentication & Student Onboarding (`/auth`, `/onboarding`)**
   - Lightweight authentication supporting Supabase Email Magic Links / Guest demo mode.
   - Student onboarding capturing display name, campus campus, academic year, dietary preference (`VEG` / `NON_VEG` / `BOTH`), and target per-meal budget.

4. **Student Dashboard (`/dashboard`)**
   - Welcome banner with student name, live date, and campus identification.
   - Metrics cards: Active Circles, Delivery Fees Saved (₹320+), Target Meal Budget.
   - Active Group Order notification banner with countdown timer.
   - "My Circles" grid with member count, avatars, status badges, and "Enter" actions.
   - "Join Circle" modal with 6-letter invite code input (`CAMPUS24`, `NIGHT300`).
   - Recent order history with links to live tracking timelines.

5. **Circle Creation & Viral Invite Flow (`/circles/create`, `/join/[inviteCode]`)**
   - Create circles with custom emojis (`🍱`, `🍕`, `🍔`, `🍜`, etc.), category tags (`Classmates`, `Hostel`, `Friends`, `Club`), campus, and budget caps.
   - Auto-generated unique 6-letter invite codes and shareable links with one-click copy.
   - Confetti celebration upon creation.
   - Full invite resolution page (`/join/[inviteCode]`) verifying circle existence, preventing duplicate memberships, and displaying current member counts.

6. **Restaurant Catalog & Dietary Filtering (`/circles/[id]/restaurants`)**
   - 6 fictional college-favorite restaurants with menus:
     - *Rolls & Bowls Co.* (Kathi rolls & budget burrito bowls)
     - *Chai & Maggi Point* (Iconic campus late-night hangout)
     - *Biryani Central* (Hyderabadi dum biryanis)
     - *Madras Tiffin Room* (Pure veg crispy dosas & filter coffee)
     - *The Campus Burger Joint* (Smash burgers & thick shakes)
     - *Night Canteen Specials* (Wok noodles, fried rice & momos)
   - Search by name, cuisine, or dish.
   - Pure Veg toggle and budget filters (<₹130, <₹180, <₹220).
   - Admin action to launch an ordering session directly with selected restaurant.

7. **Restaurant Food Menu (`/circles/[id]/restaurants/[restaurantId]`)**
   - High-resolution dish photos, prices, dietary tags (Veg/Non-Veg icon, Bestseller, Student Pick).
   - Quantity controls with animated toast notifications on addition.
   - Sticky floating cart bar displaying personal items count and subtotal.

8. **Shared Group Cart & Realtime Session (`/circles/[id]`) — *Core Screen***
   - Real-time cross-tab synchronization via `BroadcastChannel` (offline/local) and Supabase Realtime (cloud).
   - Visual breakdown grouped by student with avatars, dishes, and customizations.
   - Live order cutoff countdown timer.
   - Group delivery threshold tracker: orders over ₹400 unlock **FREE Group Delivery** (saving ₹90+).
   - Itemized individual split calculation table computed strictly in **integer paise** (eliminating floating-point errors).
   - Admin session controls: **Lock Cart**, **Reopen Cart**, and **Finalize & Place Order**.

9. **Simulated Order Confirmation & Live Tracking (`/circles/[id]/orders/[orderId]`)**
   - Demo Order Code (`SW-CAMPUS-XXXX`).
   - Explicit "Demo Order — No Payment Taken" disclaimer.
   - 5-stage interactive status timeline (*Placed → Confirmed → Kitchen Preparing → Out for Delivery → Arrived at Hostel Gate*).
   - Evaluator "Simulate Next Status Step" button for live inspection.
   - Campus drop point details and delivery instructions.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15.1.7 (App Router, Server & Client Components) |
| **Language** | TypeScript (Strict mode enabled) |
| **Styling** | Tailwind CSS 3.4 + Custom Swiggy Design Tokens |
| **UI Components** | Custom Radix/shadcn-inspired Bento primitives, Dialogs, Badges |
| **Animations** | Framer Motion & canvas-confetti |
| **Icons** | Lucide React |
| **Database & Realtime** | Supabase (PostgreSQL, Row Level Security, Realtime Replication) |
| **Local Sync** | Dual-mode fallback with Web `BroadcastChannel` API + `localStorage` |
| **Form Validation** | Zod + React Hook Form |

---

## 🏗️ Architecture & Project Structure

```
├── .env.example                               # Sample environment variables
├── README.md                                  # Comprehensive documentation
├── package.json                               # Dependencies & scripts
├── tailwind.config.ts                         # Custom Swiggy colors & shadows
├── supabase/
│   ├── migrations/
│   │   └── 20261123_initial_schema.sql        # Full Supabase schema with RLS policies
│   └── seed.sql                               # Seed data for campus prototype
├── tests/
│   └── split-calculation.test.mjs             # Unit tests for paise math & split calculations
└── src/
    ├── app/
    │   ├── layout.tsx                         # Root layout with Provider & Judge toolbar
    │   ├── page.tsx                           # Landing page
    │   ├── auth/page.tsx                      # Sign-in & student persona selector
    │   ├── onboarding/page.tsx                # Student preference customization
    │   ├── dashboard/page.tsx                 # Student dashboard & circle hub
    │   ├── circles/
    │   │   ├── create/page.tsx                # Circle creation & invite generator
    │   │   └── [id]/
    │   │       ├── page.tsx                   # Core Screen: Shared group cart & session
    │   │       ├── orders/[orderId]/page.tsx  # Simulated order tracking timeline
    │   │       └── restaurants/
    │   │           ├── page.tsx               # Restaurant catalog & search
    │   │           └── [restaurantId]/page.tsx# Restaurant food menu
    │   └── join/[inviteCode]/page.tsx         # Viral invite acceptance screen
    ├── components/
    │   ├── landing/                           # Hero, HowItWorks, WhyStudentsNeed, Bento
    │   ├── layout/                            # Navbar & Footer
    │   ├── shared/                            # PersonaSwitcherBar & JudgeGuideModal
    │   └── ui/                                # Button, Badge, Card, Modal
    ├── lib/
    │   ├── data/                              # Seed data & 6 Indian college restaurants
    │   ├── services/                          # Abstracted restaurant provider interface
    │   ├── store/demo-context.tsx             # Dual-mode synchronization context
    │   ├── supabase/client.ts                 # Supabase client initializer
    │   └── utils.ts                           # Paise formatting, code generator & split logic
    └── types/                                 # Strict TypeScript definitions
```

---

## ⚡ Getting Started (Local Setup)

### 1. Prerequisites
- Node.js 18+ (tested on Node v20 and v24)
- npm 9+

### 2. Installation
```bash
npm install
```

### 3. Environment Variables (Optional)
The application is pre-configured to run in **Zero-Config Judge Demo Mode** without requiring external credentials. If you wish to connect a live Supabase instance:
```bash
cp .env.example .env.local
```
Fill in your Supabase Project URL and Anon Key in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Verification Tests & Linter
```bash
# Run unit tests
npm test

# Run ESLint check
npm run lint

# Run production build
npm run build
```

---

## 🧪 Competition Evaluator Guide (2-Minute Test Path)

1. **Explore the Landing Page (`/`):**
   - Review the problem statement, campus metrics, and live visual mockup.
2. **Open the Dashboard (`/dashboard`):**
   - See pre-seeded "CSE Lunch Squad" circle at BITS Pilani.
   - Observe the live active session from *Rolls & Bowls Co.*.
3. **Test Multi-User Real-time Sync in 2 Tabs:**
   - Open Tab A and Tab B side-by-side on `/circles/circle-cse-lunch-squad`.
   - In Tab A, switch persona to **Ananya Iyer (Veg)**.
   - In Tab B, stay as **Aarav Sharma (Admin)**.
   - In Tab A, add an item from the menu. Watch Tab B update in real time!
4. **Inspect the Shared Group Cart:**
   - Observe the integer paise split table, delivery savings threshold, and member-wise breakdown.
5. **Lock & Finalize Order:**
   - As Aarav, click **Lock Cart**, then **Finalize & Place Demo Order**.
   - Review the generated order code (`SW-CAMPUS-XXXX`), order summary, and click **Simulate Next Status Step** to step through kitchen prep and delivery tracking.
6. **Test Invite Flow:**
   - Navigate to `/join/CAMPUS24` to test how classmates join via WhatsApp links.

---

## 🔒 Security & Data Integrity

- **Integer Paise Money Calculation:** All prices, subtotals, delivery fees, and discounts are stored and calculated strictly in integer paise (`₹179.00 = 17900`) to completely eliminate IEEE 754 floating-point rounding discrepancies.
- **Row Level Security (RLS):** Production-ready SQL policies defined in `supabase/migrations/20261123_initial_schema.sql` restrict updates to circle admins and own cart items.
- **Simulated Checkout Guardrail:** No real financial transactions, payment gateways, or live order APIs are invoked; all test checkouts are explicitly tagged and recorded as simulated prototypes.

---

## ⚠️ Known Limitations (Phase 1 MVP)

- **Simulated Payment:** Checkout is purely simulated for competition evaluation; live UPI intent / Razorpay integrations are reserved for Phase 2.
- **Fictional Menus:** Fictional restaurant listings designed to showcase Indian campus food diversity; ready to connect to real Swiggy partner APIs via `restaurantService`.
- **Single Restaurant per Session:** Ordering sessions currently lock to a single chosen restaurant to optimize group delivery fees and eliminate multiple delivery partner trips.

---

## 🔮 Phase 2 Roadmap & Scaling Strategy

1. **Campus Micro-Hub Consolidation:** Dynamic batching across adjacent hostel blocks (e.g. Block A & Block B ordering from the same restaurant hub within 15 minutes get paired with a single delivery partner).
2. **Automated Split UPI Requests:** UPI AutoPay or WhatsApp UPI request integration allowing members to approve their itemized share directly on their phones.
3. **Campus Mess Timetable Sync:** Scheduled recurring circles that automatically trigger at 12:30 PM (post-lab) or 11:30 PM (exam week late-night study canteens).
4. **Swiggy One Student Perks:** Deep integration with Swiggy One membership pooled across circle members.
