-- ═══════════════════════════════════════════════════════════════════════
--  Expenses — running costs (rent, transport, restocking, data, etc.) so the
--  dashboard/AI can show real NET profit = gross profit − expenses.
--  Scoped exactly like the other tables: business_id → businesses.user_id.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  amount       numeric(14,2) not null default 0 check (amount >= 0),
  category     text,
  description  text,
  expense_date date not null default current_date,
  created_at   timestamptz not null default now()
);

create index if not exists expenses_business_date_idx
  on public.expenses (business_id, expense_date desc);

-- RLS: a user can only touch expenses of a business they own.
alter table public.expenses enable row level security;

drop policy if exists expenses_all on public.expenses;
create policy expenses_all on public.expenses
  for all
  using (business_id in (select id from public.businesses where user_id = auth.uid()))
  with check (business_id in (select id from public.businesses where user_id = auth.uid()));
