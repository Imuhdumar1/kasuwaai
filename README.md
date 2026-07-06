# KasuwaAI — Business, Sales & Debt Tracking

**KasuwaAI** is an AI-styled business-management, sales-recording, and debt-tracking web app for
traders, shop owners, market sellers, and small businesses. It replaces the notebook-and-memory way
of doing books with a simple digital system for customers, products, sales, payments, and debts —
with support for **English and Hausa** and record-a-sale-by-voice.

🌐 **Live:** https://kasuwaai.vercel.app

---

## Features

- **Secure accounts** — email/password auth with a per-business profile. Every new account starts at
  ₦0 with no fake data.
- **Live dashboard** — today/week/month sales, revenue, outstanding debt, payments, best products,
  top customers, a business-health score, and a **"Needs attention"** list of overdue/due-today debts.
- **Customers** — full CRUD, per-customer history, debt summary, one-tap call / WhatsApp.
- **Products** — CRUD with cost/price, stock, units, and profit margins.
- **Sales** — structured entry with live totals (subtotal, discount, tax, total, balance, profit) or
  **voice entry** (browser speech-to-text + a Hausa/English rule-based parser, no API keys).
- **Debts & reminders** — auto-tracked from unpaid sales, grouped into overdue / due-today / upcoming,
  with ready-to-send **payment reminders** (friendly/firm tones) via **WhatsApp, SMS, or copy**.
- **Payments** — record against any debt with overpayment blocked (enforced by a DB trigger).
- **AI assistant** — answers questions about the business ("who owes me money?", "what's my profit
  margin?") from real data, in English or Hausa.
- **Reports** — sales, revenue, profit, debt, payment, product, customer, and a business summary —
  exportable as **CSV, PDF, and Word**.
- **Bilingual + dark mode** — English/Hausa toggle, light/dark themes, responsive on mobile.

## Tech stack

- [Next.js 14](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com) + custom themed components
- [Supabase](https://supabase.com) — Postgres, Auth, Row-Level Security
- [Recharts](https://recharts.org) for charts, deployed on [Vercel](https://vercel.com)

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Supabase project and run the schema in `supabase/migrations/0001_init.sql`
   (Supabase → SQL Editor).
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase URL + anon key.
4. Run the dev server:
   ```bash
   npm run dev
   ```

## Deployment

Deployed on Vercel. Set the three `NEXT_PUBLIC_*` environment variables in the Vercel project, and
point your Supabase **Auth → URL Configuration** (Site URL + Redirect URLs) at the deployed domain.

---

_A school project — built to help small businesses in Northern Nigeria keep clean records and recover
forgotten debts._
