-- ═══════════════════════════════════════════════════════════════════════
--  KasuwaAI — hardening & scale
--  Run this in the Supabase SQL editor after 0001_init.sql.
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Indexes for the hot query paths (dashboard, debts, reports) ────────
create index if not exists sales_business_date_idx on public.sales (business_id, sale_date desc);
create index if not exists sales_open_idx          on public.sales (business_id) where outstanding_balance > 0;
create index if not exists sales_due_idx           on public.sales (business_id, due_date) where outstanding_balance > 0;
create index if not exists payments_business_date_idx on public.payments (business_id, payment_date desc);
create index if not exists customers_business_name_idx on public.customers (business_id, full_name);

-- ─── One business per phone number (email uniqueness is enforced by auth) ─
-- NOTE: if this fails, you have existing duplicate phones — clean them first.
create unique index if not exists businesses_phone_unique
  on public.businesses (phone) where phone is not null and phone <> '';

-- ─── Signup availability checks ─────────────────────────────────────────
--  SECURITY DEFINER so the signup page (anon) can call them. They only ever
--  return a boolean — no personal data is exposed.
create or replace function public.email_available(p_email text)
returns boolean language sql security definer set search_path = public, auth as $$
  select not exists (select 1 from auth.users where lower(email) = lower(trim(p_email)));
$$;

create or replace function public.phone_available(p_phone text)
returns boolean language sql security definer set search_path = public as $$
  select not exists (select 1 from public.businesses where phone = trim(p_phone));
$$;

grant execute on function public.email_available(text) to anon, authenticated;
grant execute on function public.phone_available(text) to anon, authenticated;
