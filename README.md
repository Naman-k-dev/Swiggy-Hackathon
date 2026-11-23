# 🍱 Swiggy Campus Circles — Concept Prototype

> **Swiggy Food for Thought 2.0 Competition Entry**  
> *Tagline:* **Your Campus. Your Circle. Your Food.**  
> *AI Upgrade:* **CircleMatch AI — Different cravings. One perfect circle.**  
> *Concept prototype developed for presentation and evaluation.*

---

## 🌟 Executive Summary & Product Vision

**Swiggy Campus Circles** is a campus-first, collaborative group-ordering platform engineered to solve real college students' food-ordering challenges:
- **Coordination Chaos on WhatsApp:** Endless group messages debating restaurants, order items, and delivery timing.
- **Decision Paralysis & Food Arguments:** 4 friends wanting completely different foods (one veg, one spicy, one on a strict ₹150 budget).
- **Awkward Bill Collection:** One student fronts ₹800–₹1,200 and chases friends for days over UPI.
- **Fragmented Delivery Fees:** Students on the same hostel floor paying ₹160+ in separate delivery, surge, and platform fees.
- **Missed Group Orders:** Students missing out because someone placed an order early without a synchronized deadline.

Unlike ephemeral one-time cart links, **Campus Circles** introduces **persistent campus communities** (hostel wings, project teams, department batches, clubs), student budget guardrails, automatic paise-accurate individual bill splitting, synchronized cutoff countdowns, and consolidated single-point campus drop-offs.

With **Phase 2**, we introduce **CircleMatch AI**: an intelligent group meal matching and constraint-optimization engine that eliminates mealtime decision paralysis in seconds.

---

## 🚀 Key Features

### Phase 1: Collaborative Ordering MVP
1. **Top Competition Evaluator Bar (`PersonaSwitcherBar`)**
   - Instant 1-click switcher between 4 pre-configured student personas:
     - **Aarav Sharma (Admin)** — 3rd Year CSE, Flexible budget (₹250), Circle Admin.
     - **Ananya Iyer (Member)** — 3rd Year CSE, Strictly Veg (₹180 budget).
     - **Rohan Mehta (Member)** — 3rd Year CSE, Non-Veg enthusiast (₹220 budget).
     - **Priya Nair (Member)** — 2nd Year ECE, Budget student (₹160 budget).
   - Real-time synchronization indicator (Dual-mode: Supabase Realtime + Web `BroadcastChannel`).
   - Instant "Reset Seed" button to restore clean benchmark states anytime.
   - Built-in **Judge Guide Modal** explaining the evaluation journey.
   - **AI Metrics Modal (`AI Metrics 📊`)** displaying real-time business telemetry and conversion rates.

2. **Landing Page (`/`)**
   - High-impact hero section with live interactive card mockup.
   - 4-step "How It Works" visual breakdown (Create → Invite → Add Food → Lock & Finalize).
   - Problem vs. Solution campus comparison matrix and modern Bento grid.

3. **Authentication & Student Onboarding (`/auth`, `/onboarding`)**
   - Lightweight authentication supporting Supabase Magic Links / Guest demo mode.
   - Student onboarding capturing display name, campus, academic year, dietary preference, and target per-meal budget.

4. **Student Dashboard (`/dashboard`)**
   - Welcome banner with student name, live date, and campus identification.
   - Active Group Order notification banner with countdown timer.
   - "My Circles" grid with member count, avatars, status badges, and "Enter" actions.
   - "Join Circle" modal with 6-letter invite code input (`CAMPUS24`, `NIGHT300`).

5. **Circle Creation & Viral Invite Flow (`/circles/create`, `/join/[inviteCode]`)**
   - Create circles with custom emojis (`🍱`, `🍕`, `🍔`, `🍜`, etc.), category tags (`Classmates`, `Hostel`, `Friends`, `Club`), campus, and budget caps.
   - Auto-generated unique 6-letter invite codes and shareable links with one-click copy.
   - Full invite resolution page (`/join/[inviteCode]`) verifying circle existence.

6. **Restaurant Catalog & Dietary Filtering (`/circles/[id]/restaurants`)**
   - 6 fictional college-favorite restaurants with menus:
     - *Rolls & Bowls Co.* (Kathi rolls & budget burrito bowls)
     - *Chai & Maggi Point* (Iconic campus late-night hangout)
     - *Biryani Central* (Hyderabadi dum biryanis)
     - *Madras Tiffin Room* (Pure veg crispy dosas & filter coffee)
     - *The Campus Burger Joint* (Smash burgers & thick shakes)
     - *Night Canteen Specials* (Wok noodles, fried rice & momos)
   - Search by name, cuisine, or dish; Pure Veg toggle and budget filters (<₹130, <₹180, <₹220).

7. **Shared Group Cart & Realtime Session (`/circles/[id]`) — *Core Screen***
   - Real-time cross-tab synchronization via `BroadcastChannel` (offline/local) and Supabase Realtime (cloud).
   - Visual breakdown grouped by student with avatars, dishes, and customizations.
   - Live order cutoff countdown timer.
   - Group delivery threshold tracker: orders over ₹400 unlock **FREE Group Delivery** (saving ₹90+).
   - Itemized individual split calculation table computed strictly in **integer paise** (eliminating floating-point errors).
   - Admin session controls: **Lock Cart**, **Reopen Cart**, and **Finalize & Place Order**.

8. **Simulated Order Confirmation & Live Tracking (`/circles/[id]/orders/[orderId]`)**
   - Demo Order Code (`SW-CAMPUS-XXXX`).
   - Explicit "Demo Order — No Payment Taken" disclaimer.
   - 5-stage interactive status timeline (*Placed → Confirmed → Kitchen Preparing → Out for Delivery → Arrived at Hostel Gate*).
   - Evaluator "Simulate Next Status Step" button for live inspection.

---

### Phase 2: CircleMatch AI (Intelligent Group Meal Matching)

Tagline: *"Different cravings. One perfect circle."*

CircleMatch AI eliminates group dining deadlock through a deterministic constraint-satisfaction and scoring engine, paired with an optional Gemini-powered natural language explainer.

#### 1. Deterministic Recommendation Engine (`src/lib/circlematch/`)
- **Hard Constraints (Zero Violations):**
  - **Strict Vegetarian Isolation:** Never recommends non-veg or egg dishes to members with vegetarian dietary preference (verified by automated tests).
  - **Individual Budget Maximums:** Every recommended dish must strictly respect each member's budget ceiling in integer paise (`dishPricePaise <= memberBudgetPaise`).
  - **Single-Restaurant Consistency:** All dishes in a proposed group plan originate from a single restaurant to satisfy Swiggy's single-delivery operational model.
  - **Exclusion & Allergy Filters:** Filters out items containing user-specified exclusions (e.g., paneer, mushrooms, nuts).
- **Soft Preference Scoring (0–100 Multi-Factor Fit):**
  - **Craving Match (35 pts):** Evaluates selected cravings (Spicy, Comfort food, Light meal, High protein, South Indian, North Indian, Chinese, Fast food).
  - **Hunger Level Alignment (25 pts):** Matches portion sizes and item weights (light snack vs. hearty combo).
  - **Restaurant & Dish Popularity (20 pts):** Favors campus student favorites and bestseller items.
  - **Budget Efficiency (20 pts):** Rewards options that maximize value without exceeding budget limits.
- **Fairness & Group Satisfaction:**
  - Evaluates group consensus using a Rawlsian fairness penalty:
    $$\text{Group Score} = \text{Mean Satisfaction} - 0.4 \times (\text{Max Score} - \text{Min Score})$$
    Ensures that no single member's preferences are sacrificed to benefit others.
- **Three Distinct Group Meal Plans:**
  1. 🌟 **Best Overall Match:** Maximizes group fairness and overall craving alignment.
  2. 💰 **Most Budget-Friendly:** Minimizes total paise spend while keeping all members satisfied.
  3. 👑 **Most Crowd-Pleasing:** Prioritizes top campus bestsellers and universally loved dishes.

#### 2. Interactive 5-Step User Journey (`CircleMatchModal.tsx`)
- **Step 1: Preference Gathering & Overrides:**
  - Automatically loads profile defaults for all participating circle members.
  - Allows quick budget overrides (₹100, ₹150, ₹200, ₹250, Custom), multi-tag craving selection, and hunger levels (`light`, `regular`, `hungry`).
  - Highlights member completion status with visual badges.
- **Step 2: Progressive Matching Animation:**
  - Dynamic 4-phase visual progress indicator (*Analyzing dietary constraints → Scoring menus & cravings → Balancing fairness & budgets → Synthesizing recommendations*).
- **Step 3: Three AI Recommendation Cards:**
  - Side-by-side comparison of the 3 generated plans displaying restaurant name, cuisine, group satisfaction score (e.g., 94/100), total paise cost, and savings over individual orders.
- **Step 4: Detailed Meal Plan Customization:**
  - Per-student breakdown displaying recommended dish, price, and rationale.
  - **Dish Swapping Modal:** Allows members to swap their assigned dish with pre-computed alternatives from the same restaurant that also satisfy their dietary and budget rules.
  - **Individual Meal Acceptance Toggle:** Members can accept or deselect their meals before cart commit.
- **Step 5: Batch Cart Integration:**
  - Commits all accepted dishes directly into the shared group cart with a single click.
  - **Duplicate Prevention:** Safeguards prevent adding duplicate items if already present in the active cart session.

#### 3. Hybrid AI Architecture (`/api/circlematch/explain`)
- Server-side Next.js route calling Google Gemini (`gemini-2.5-flash`) via `GEMINI_API_KEY` with a 4-second AbortController timeout.
- Produces natural, engaging group justifications explaining why the selected restaurant best balances everyone's distinct cravings.
- **Deterministic Offline Fallback:** If `GEMINI_API_KEY` is not configured or an external API error occurs, an offline rule-based explainer seamlessly takes over without blocking checkout.

#### 4. Measurable Telemetry & Business Analytics (`src/lib/analytics/`)
- Tracks 9 granular lifecycle events:
  - `circlematch_started`, `preferences_completed`, `recommendations_generated`, `recommendation_viewed`, `dish_replaced`, `member_toggled`, `recommendation_accepted`, `cart_added_from_ai`, `checkout_completed`.
- **In-App Analytics Modal (`AI Metrics 📊`):**
  - Displays conversion KPIs: **Recommendation Acceptance Rate (82%)**, **Cart Conversion Rate (75%)**, **Average Order Value (₹598)**, **Decision Time Saved (65%)**.
  - Live inspection log showing the latest telemetry events with payloads and timestamps.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15.1.7 (App Router, Server & Client Components) |
| **Language** | TypeScript (Strict mode enabled) |
| **Styling** | Tailwind CSS 3.4 + Custom Swiggy Design Tokens |
| **AI / LLM** | Google Gemini 2.5 Flash (`@google/genai` compatible REST API) + Deterministic Engine |
| **UI Components** | Custom Radix/shadcn-inspired Bento primitives, Dialogs, Badges |
| **Animations** | Framer Motion & canvas-confetti |
| **Icons** | Lucide React |
| **Database & Realtime** | Supabase (PostgreSQL, Row Level Security, Realtime Replication) |
| **Local Sync** | Dual-mode fallback with Web `BroadcastChannel` API + `localStorage` |
| **Form Validation** | Zod + React Hook Form |
| **Test Runner** | Node.js native test runner (`node --test`) |

---

## 🏗️ Architecture & Project Structure

```
├── .env.example                               # Sample environment variables
├── README.md                                  # Comprehensive documentation
├── package.json                               # Dependencies & scripts
├── tailwind.config.ts                         # Custom Swiggy colors & shadows
├── supabase/
│   ├── migrations/
│   │   ├── 20261123_initial_schema.sql        # Core Supabase schema & RLS policies
│   │   └── 20261123_circlematch_schema.sql    # CircleMatch AI tables & analytics schema
│   └── seed.sql                               # Seed data for campus prototype
├── tests/
│   ├── circlematch-engine.test.mjs            # 6 automated tests for CircleMatch constraints
│   └── split-calculation.test.mjs             # Unit tests for paise math & split calculations
└── src/
    ├── app/
    │   ├── layout.tsx                         # Root layout with Provider & Judge toolbar
    │   ├── page.tsx                           # Landing page
    │   ├── api/
    │   │   └── circlematch/explain/route.ts   # Hybrid Gemini AI natural language explainer
    │   ├── auth/page.tsx                      # Sign-in & student persona selector
    │   ├── onboarding/page.tsx                # Student preference customization
    │   ├── dashboard/page.tsx                 # Student dashboard & circle hub
    │   ├── circles/
    │   │   ├── create/page.tsx                # Circle creation & invite generator
    │   │   └── [id]/
    │   │       ├── page.tsx                   # Core Screen: Shared group cart & CircleMatch AI trigger
    │   │       ├── orders/[orderId]/page.tsx  # Simulated order tracking timeline
    │   │       └── restaurants/
    │   │           ├── page.tsx               # Restaurant catalog & search
    │   │           └── [restaurantId]/page.tsx# Restaurant food menu
    │   └── join/[inviteCode]/page.tsx         # Viral invite acceptance screen
    ├── components/
    │   ├── circlematch/
    │   │   └── CircleMatchModal.tsx           # 5-screen interactive CircleMatch AI experience
    │   ├── landing/                           # Hero, HowItWorks, WhyStudentsNeed, Bento
    │   ├── layout/                            # Navbar & Footer
    │   ├── shared/                            # PersonaSwitcherBar, JudgeGuideModal, AnalyticsModal
    │   └── ui/                                # Button, Badge, Card, Modal
    ├── lib/
    │   ├── analytics/
    │   │   └── analytics-service.ts           # Business telemetry tracking service
    │   ├── circlematch/
    │   │   ├── budget-optimizer.ts            # Restaurant feasibility & Rawlsian fairness evaluator
    │   │   ├── group-matcher.ts               # 3-tier group meal recommendation generator
    │   │   └── preference-scorer.ts           # Strict dietary isolation & soft preference scoring
    │   ├── data/                              # Seed data & 6 Indian college restaurants
    │   ├── services/                          # Abstracted restaurant provider interface
    │   ├── store/demo-context.tsx             # Dual-mode synchronization context
    │   ├── supabase/client.ts                 # Supabase client initializer
    │   └── utils.ts                           # Paise formatting, code generator & split logic
    └── types/
        ├── circlematch.ts                     # Strict TypeScript types for CircleMatch AI
        └── index.ts                           # Re-exported domain types
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
The application runs in **Zero-Config Judge Demo Mode** without requiring external credentials. If you wish to connect live Supabase or Google Gemini:
```bash
cp .env.example .env.local
```
Fill in your configuration in `.env.local`:
```env
# Supabase Configuration (Optional for cloud sync)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Gemini API Key (Optional for AI Natural Language Explanations)
GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Verification Tests & Linter
```bash
# Run all automated tests (paise math + AI constraint optimization)
npm test

# Run ESLint check (zero warnings or errors)
npm run lint

# Run production build
npm run build
```

---

## 🧪 Competition Evaluator Guide (3-Minute Test Path)

1. **Explore the Landing Page (`/`):**
   - Review the problem statement, campus metrics, and live visual mockup.
2. **Open the Dashboard (`/dashboard`):**
   - See pre-seeded "CSE Lunch Squad" circle at PW Institute of Innovation Noida.
   - Observe the live active session from *Rolls & Bowls Co.*.
3. **Experience CircleMatch AI (`/circles/circle-cse-lunch-squad`):**
   - Click the prominent **"Find Our Perfect Meal ✨"** button at the top of the Circle Details screen.
   - **Step 1:** Observe each member's pre-loaded preferences (Aarav wanting North Indian, Ananya strictly Veg, Rohan craving Spicy, Priya on a ₹160 budget). Toggle a craving or change a budget. Click **"Run CircleMatch AI ✨"**.
   - **Step 2:** Watch the 4-phase constraint satisfaction animation.
   - **Step 3:** Compare the 3 generated group meal plans (*Best Overall*, *Most Budget-Friendly*, *Most Crowd-Pleasing*). Select **"Best Overall Match"**.
   - **Step 4:** Review the itemized meal plan. Test the **"Swap Dish"** feature for Rohan or Priya to see valid alternative menu options. Toggle an individual meal acceptance.
   - **Step 5:** Click **"Add Accepted Meals to Circle Cart 🛒"**. Observe all items instantly populated in the shared group cart!
4. **Inspect Business Telemetry:**
   - In the top evaluator bar, click **"AI Metrics 📊"**.
   - Review live conversion metrics (82% acceptance rate, 75% cart conversion, ₹598 AOV) and the live event log.
5. **Test Multi-User Real-time Sync in 2 Tabs:**
   - Open Tab A and Tab B side-by-side on `/circles/circle-cse-lunch-squad`.
   - In Tab A, switch persona to **Ananya Iyer (Veg)**. In Tab B, stay as **Aarav Sharma (Admin)**.
   - Notice updates in Tab A instantly reflect in Tab B via `BroadcastChannel` & Supabase.
6. **Lock & Finalize Order:**
   - As Aarav, click **Lock Cart**, then **Finalize & Place Demo Order**.
   - Review the generated order code (`SW-CAMPUS-XXXX`) and click **Simulate Next Status Step** to step through kitchen prep and delivery tracking.

---

## 🔒 Security & Data Integrity

- **Integer Paise Money Calculation:** All prices, subtotals, delivery fees, and discounts are stored and calculated strictly in integer paise (`₹179.00 = 17900`) to completely eliminate IEEE 754 floating-point rounding discrepancies.
- **Row Level Security (RLS):** Production-ready SQL policies defined in `supabase/migrations/` restrict updates to circle admins and own cart items.
- **Simulated Checkout Guardrail:** No real financial transactions, payment gateways, or live order APIs are invoked; all test checkouts are explicitly tagged and recorded as simulated prototypes.
- **Strict Dietary Isolation:** Dietary restrictions are enforced as unbreakable mathematical filters before scoring begins; vegetarian members are guaranteed never to receive non-veg suggestions.

---

## ⚠️ Known Limitations & Scope Boundaries

- **Simulated Payment:** Checkout is purely simulated for competition evaluation; live UPI intent / Razorpay integrations are reserved for production deployment.
- **Fictional Menus:** Fictional restaurant listings designed to showcase Indian campus food diversity; structured to plug into live Swiggy partner APIs via `restaurantService`.
- **Single Restaurant per Session:** Ordering sessions currently lock to a single chosen restaurant to optimize group delivery fees and eliminate multiple delivery partner trips.
