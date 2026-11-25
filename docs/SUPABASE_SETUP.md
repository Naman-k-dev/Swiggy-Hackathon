# Swiggy Campus Circles — Supabase Setup & Configuration Guide

> **Scope:** Database schema, migrations, Row Level Security (RLS), and Realtime configuration for Swiggy Campus Circles.

---

## 1. Overview

Swiggy Campus Circles uses Supabase PostgreSQL for relational data storage, authentication, Row Level Security (RLS), and Realtime synchronization across college student devices.

---

## 2. Required Migrations

Execute the following SQL migration files in your Supabase SQL Editor in chronological order:

1. `supabase/migrations/20261123_initial_schema.sql` — Core tables (Circles, Members, Sessions, Cart, Orders).
2. `supabase/migrations/20261123_circlematch_schema.sql` — CircleMatch recommendations, voting sessions, and rescue scenarios.
3. `supabase/migrations/20261123_security_hardening.sql` — RLS policies and authorization hardening.
4. `supabase/migrations/20261125_competition_readiness_sync.sql` — Cloud sync, telemetry separation, and audit logging.
5. `supabase/migrations/20261125_checkpoint1_schema.sql` — Campus Pickup Passes (`pickup_passes`, `pickup_confirmations`) and CirclePay settlement records (`settlement_records`, `settlement_events`).

---

## 3. Environment Variables

Configure the following environment variables in your `.env.local` file and Vercel project settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-google-gemini-api-key
```

> **Security Warning:** `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` must remain strictly server-side and never be prefixed with `NEXT_PUBLIC_`.

---

## 4. Row Level Security (RLS) Summary

- **Circles:** Viewable by members; creatable by authenticated students; manageable by circle admins (`admin_id`).
- **Shared Carts & Items:** Modifiable only by item owners prior to ordering session cutoff.
- **Pickup Passes:** Viewable by circle members and organizers; only organizers can mark meals as collected.
- **Settlement Records:** Viewable by circle members and the respective user; users can mark their own share as sent; only organizers can confirm receipt.
