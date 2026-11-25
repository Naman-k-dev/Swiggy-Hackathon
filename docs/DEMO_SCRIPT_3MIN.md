# Swiggy Campus Circles — 3-Minute Competition Demo Walkthrough

**Campus:** PW Institute of Innovation Noida  
**Target Time:** 3 minutes (180 seconds)  
**Safety Mode:** Sandbox / Simulated Checkout (no live food orders or real payments initiated)

---

## 0:00 – 0:25 | Hook & Problem Framing (Landing `/`)
- Open `/` in Desktop view and toggle **Dark / Light Mode** in the top Navbar.
- Point out the core campus problem on **Why Students Need Campus Circles**: four hostel/classroom friends ordering individually pay repeated `₹30–₹40` delivery fees and waste time coordinating over fragmented WhatsApp threads.
- Show the **Simulated Group Cart Preview** in the Hero card: pooling individual orders into one campus drop point waives the `₹30` delivery fee above `₹400`.
- Click **Launch Sandbox Demo** in the bottom preview banner (or open `/auth` -> **Launch Judge Sandbox**).

## 0:25 – 1:05 | Group Hub & Decision Room — CircleVote (`/circles/[id]`)
- Land directly inside **CSE Lunch Squad** (`CAMPUS24`) with 4 pre-seeded student profiles (including Strictly Veg constraints).
- Show **Order Readiness**, **Cutoff Timer**, **Campus Gate Pickup Point**, and **Smart 3-Tier Budget Guardrails**.
- Open **CircleVote** (`Decision Room`):
  - Show how students compare top finalists (`Rolls & Bowls Co.`, `Madras Tiffin Room`, `Biryani Central`) with per-restaurant compatibility percentages and veg safety summaries.
  - Cast/switch a vote (enforced at 1 vote per student) or test **Finalize & Select Winner** to show deterministic tie-breaking plus a live **Gemini (`gemini-3.5-flash-lite`)** natural-language explanation of the winning restaurant.

## 1:05 – 1:45 | CircleMatch AI (`/circles/[id]` -> Find Our Perfect Meal)
- Click **Find Our Perfect Meal** to open **CircleMatch AI**.
- **Step 1 (Preferences):** Point out individual member dietary badges (`VEG` vs `NON_VEG` vs `BOTH`) and per-student budgets (`₹160–₹250`). Note the toggle between the Campus Catalog and Swiggy MCP tool pipeline.
- **Step 2 -> Step 3 (Results):** Click **Generate Perfect Group Plans**. Highlight the strict separation of responsibilities:
  - **Deterministic optimizer** computes exact integer-paise math, hard vegetarian isolation, and personal budget bounds.
  - **Server-side Gemini API** (`POST /api/circlematch/explain`) progressively adds a grounded human explanation badge (`gemini-3.5-flash-lite`).
- Optionally accept/customize a dish into the shared circle cart.

## 1:45 – 2:25 | Order Rescue AI Guardrail (`/circles/[id]/restaurants/[restaurantId]`)
- Open the restaurant menu (`Rolls & Bowls Co.`) or click **Order Rescue** inside the Circle page.
- Trigger a live conflict (e.g., vegetarian constraint mismatch or personal budget overrun on a dish) to open **Order Rescue AI**:
  - Show how deterministic filters propose same-restaurant compliant replacements with exact integer-paise price differences.
  - Point out the live **Gemini (`order_rescue`)** note reassuring the affected student before applying the one-click swap into the group cart.

## 2:25 – 3:00 | Equitable Split, MCP Transparency, & Simulated Order Tracking
- Return to the shared cart on `/circles/[id]` to show **Reorder Past Order** (`Reorder` modal) and **Sync to Swiggy** (`SwiggyCartSyncModal`):
  - Explicitly note that without Swiggy Partner OAuth credentials (`SWIGGY_CLIENT_ID` / `SWIGGY_CLIENT_SECRET`), Swiggy MCP runs cleanly in **Competition Sandbox / Demo mode** with explicit organizer confirmation required before mapping to Swiggy Cart JSON schemas.
- Click **Lock Cart -> Place Simulated Order**.
- Land on `/circles/[id]/orders/[orderId]`:
  - Show the **Demo Order — No Payment Taken** badge, the interactive 5-step delivery timeline (**Simulate Next Status Step**), and the exact per-student integer-paise breakdown with `₹0` group delivery fee when subtotal `>= ₹400`.
