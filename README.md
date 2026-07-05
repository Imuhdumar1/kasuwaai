# KasuwaAI

AI-styled **business, sales & debt-tracking** app for traders, shop owners, market
sellers and SMEs. Replace the notebook: record customers, products, sales and
payments; track who owes you money; record sales by **voice in English or Hausa**;
and ask an **AI assistant** about your business — all from real data.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind** on the front end and
**Supabase** (Postgres + Auth + Row-Level Security) on the back end. Deploys to **Vercel**.

> This is a school project, built intentionally for small scale. The AI features
> (voice extraction + assistant) run on a **deterministic, rule-based engine with no
> API keys or cost** — they parse Hausa/English text and answer strictly from your
> real database records.

---

## 1. Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) project
- A [Vercel](https://vercel.com) account (for deployment)

## 2. Set up the database

1. In your Supabase project open **SQL Editor** → **New query**.
2. Paste the entire contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and **Run**.
   This creates all tables, Row-Level Security policies, the money-integrity
   triggers, and the trigger that auto-creates a business profile on sign-up.

## 3. Configure authentication

Go to **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3300` (local) — change to your Vercel URL in production.
- **Redirect URLs:** add `http://localhost:3300/**` (and your Vercel URL once deployed).

**If you keep email confirmation ON** (Authentication → Providers → Email), edit the
**Confirm signup** email template (Authentication → Emails → Templates) so the link is:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup">Confirm your mail</a>
```

This is required because the app uses secure server-side cookie auth. *(To skip email
confirmation entirely for demos, just turn "Confirm email" off.)*

## 4. Environment variables

Copy `.env.local.example` to `.env.local` and fill in your keys
(Project Settings → API):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3300
```

## 5. Run locally

```bash
npm install
npm run dev -- --port 3300
```

Open <http://localhost:3300>, create an account, and you'll land on an all-zero
dashboard. Add a customer → add a product → record a sale → settle a payment and
watch the dashboard, debts and reports update live.

## 6. Deploy to Vercel

1. Push this project to a Git repository.
2. In Vercel, **Import** the repo. If the repo root is the parent folder, set the
   **Root Directory** to `kasuwaai`.
3. Add the three environment variables from step 4 (set `NEXT_PUBLIC_SITE_URL` to your
   Vercel URL, e.g. `https://your-app.vercel.app`).
4. Back in Supabase, add your Vercel URL to **Site URL** and **Redirect URLs**.
5. Deploy. Vercel auto-detects Next.js — no extra config needed.

---

## What's inside

| Area | Notes |
|------|-------|
| **Auth** | Email/password, sign-up with full business profile, password reset |
| **Dashboard** | Live KPIs, sales-trend chart, health-score, top customers/products, recommendations |
| **Customers / Products** | Full CRUD, search, filter, archive, per-customer history |
| **Sales** | Line items, live totals, discount/tax, part-payment, due dates |
| **Debts & Payments** | Auto-derived debts, overdue tracking, settlement with overpayment blocked (app **and** DB trigger) |
| **Voice sale** | Record → editable transcript → rule-based Hausa/English extraction → review & save (never auto-saves) |
| **AI assistant** | Answers "who owes me money?", "what sold today?", etc. from real data, English + Hausa |
| **Reports** | Sales/debt/payment/product/customer reports with date ranges, CSV export + print |
| **Settings** | Profile, currency, language (EN/HA), dark mode, notifications, data export, delete data |

### Data integrity
A "debt" is simply a sale with an outstanding balance. Payments are the single source
of truth: Postgres triggers recompute each sale's paid amount, balance and status, and
**reject any payment larger than the balance**. New accounts start at exactly zero — no
demo/placeholder data.

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run lint     # eslint
```
