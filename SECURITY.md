# KasuwaAI — Security & Scalability

This documents what is enforced **in code** vs. what **you must configure** in
Supabase / Vercel before onboarding many businesses.

---

## ✅ Enforced in the app (code)

| Area | What's done |
|---|---|
| **Data isolation (per-UID)** | Postgres **Row-Level Security** on every table scopes rows to `businesses.user_id = auth.uid()`. A user can only ever read/write their own business's data. |
| **Money integrity** | DB triggers keep `amount_paid`/`outstanding_balance`/`status` derived from payments and **block overpayment**; `CHECK` constraints prevent negative balances. |
| **One account per email** | Enforced by Supabase Auth (unique email) + a friendly "already registered" message on signup. |
| **One account per phone** | Unique index `businesses_phone_unique` + a pre-signup `phone_available()` check with a clear message. |
| **Required signup** | Every signup field is required (native validation popup + guard); a duplicate email/phone shows a message instead of failing silently. |
| **Input hardening** | Queries are parameterized (no SQL injection); React escapes all output (no XSS). Server actions additionally **trim, strip control characters, and cap length** (`src/lib/sanitize.ts`), and forms set `maxLength`. |
| **Custom error screens** | `not-found.tsx` (404), `error.tsx` (route errors, logs to Vercel), `global-error.tsx` (root failures). |
| **Indexed hot queries** | Indexes on `business_id`, dates, `customer_id`, open-debt partial indexes (`0001` + `0002` migrations). |
| **CI / automated checks** | `.github/workflows/ci.yml` runs **typecheck + lint + build** on every push/PR. |
| **Dependency updates** | `.github/dependabot.yml` opens weekly PRs for npm + GitHub-Actions updates. |
| **Maintenance mode** | `src/lib/maintenance.ts` — gate the app during rollouts. |

> **Run `supabase/migrations/0002_hardening.sql`** in the Supabase SQL editor to
> apply the new indexes, the unique-phone constraint, and the availability
> functions. (If the unique-phone step fails, you have existing duplicate phone
> numbers — clean those first.)

---

## ⚙️ You must configure (Supabase / Vercel dashboards — I can't set these from code)

### Supabase → Authentication → Emails / Rate limits
- **Verification & reset email expiry** — set **Email OTP Expiration** shorter
  (e.g. **1800s / 30 min**). *Note:* Supabase uses **one** OTP expiry for
  confirmation, recovery and magic links, so you can't set 15 min for signup and
  30 min for reset separately on the standard plan — pick one value (30 min is a
  reasonable balance) unless you customise email templates + token handling.
- **Auth rate limits** — Supabase already rate-limits signups, logins, OTP and
  email sends per hour. Review/raise them under **Auth → Rate Limits** for your
  expected traffic.

### Supabase → Database
- **Backups** — enable **daily automated backups** (Database → Backups). On free
  tier take periodic manual `pg_dump` backups; on Pro, Point-in-Time-Recovery.
- **Encryption at rest** — on by default (Supabase encrypts storage); data in
  transit is TLS. No action needed beyond keeping it on the managed platform.

### Vercel
- **Rollbacks (blue-green)** — every deploy is immutable; to roll back, open
  **Deployments → the previous good build → Promote to Production** (instant).
- **App-level rate limiting** (per IP) — needs an external store; add
  **Vercel KV / Upstash Redis** + a limiter in `middleware.ts` if you see abuse.
- **Restrict API origin** — the Supabase anon key is public *by design*; your
  real protection is RLS (above). If you add custom API routes, check the
  `Origin`/`Referer` there.
- **Logs & alerts** — Vercel (runtime logs) + Supabase (logs) are built in. For
  alerting, add **Sentry** (`@sentry/nextjs`) — a ~15-min setup — to capture and
  notify on errors.

---

## 🔭 Roadmap (larger features, not in this pass)

- **Role-based access control (multi-user businesses)** — the current model is
  one owner per business (fully isolated). True RBAC (invite staff, roles like
  owner/cashier, per-role permissions) is a dedicated feature: add a
  `business_members(business_id, user_id, role)` table and rewrite RLS to check
  membership + role. Plan this before you offer multi-staff shops.
- **Field-level encryption** — current data (names, phones, sales) is low
  sensitivity and covered by at-rest encryption; add column encryption (pgsodium)
  only if you later store truly sensitive fields.

---

## Quick pre-launch checklist
- [ ] Run `0002_hardening.sql` in Supabase
- [ ] Set Email OTP expiry (Auth → Emails)
- [ ] Enable database backups
- [ ] Confirm RLS is **on** for all tables (it is via migrations — verify in Table editor)
- [ ] Set env vars in Vercel; keep the `service_role` key **off** the client
- [ ] (Optional) Add Sentry + Upstash rate limiting before heavy traffic
