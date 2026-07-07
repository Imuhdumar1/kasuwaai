-- ═══════════════════════════════════════════════════════════════════════
--  RLS verification & re-assertion — idempotent, safe to run anytime.
--
--  Scoping model: a data row belongs to a business (business_id), and a
--  business belongs to an auth user (businesses.user_id = auth.uid()). So a
--  signed-in user can only ever touch rows for the business they own.
--  (sale_items is scoped through its parent sale.)
--
--  This migration re-enables RLS on every table, re-asserts the policies, and
--  RAISES a CRITICAL error if any table still has RLS disabled.
-- ═══════════════════════════════════════════════════════════════════════

-- 1) Ensure RLS is ENABLED on every table.
alter table public.businesses enable row level security;
alter table public.customers  enable row level security;
alter table public.products   enable row level security;
alter table public.sales      enable row level security;
alter table public.sale_items enable row level security;
alter table public.payments   enable row level security;

-- 2) Re-assert owner-scoped policies (drop + recreate = idempotent).

drop policy if exists businesses_select on public.businesses;
create policy businesses_select on public.businesses for select using (user_id = auth.uid());
drop policy if exists businesses_insert on public.businesses;
create policy businesses_insert on public.businesses for insert with check (user_id = auth.uid());
drop policy if exists businesses_update on public.businesses;
create policy businesses_update on public.businesses for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists businesses_delete on public.businesses;
create policy businesses_delete on public.businesses for delete using (user_id = auth.uid());

-- child tables that carry business_id
do $$
declare t text;
begin
  foreach t in array array['customers','products','sales','payments'] loop
    execute format('drop policy if exists %I_all on public.%I;', t, t);
    execute format($f$
      create policy %1$I_all on public.%1$I
        for all
        using (business_id in (select id from public.businesses where user_id = auth.uid()))
        with check (business_id in (select id from public.businesses where user_id = auth.uid()));
    $f$, t);
  end loop;
end $$;

-- sale_items: scoped through its parent sale
drop policy if exists sale_items_all on public.sale_items;
create policy sale_items_all on public.sale_items
  for all
  using (sale_id in (
    select s.id from public.sales s join public.businesses b on b.id = s.business_id
    where b.user_id = auth.uid()))
  with check (sale_id in (
    select s.id from public.sales s join public.businesses b on b.id = s.business_id
    where b.user_id = auth.uid()));

-- 3) CRITICAL check — fail loudly if any table still has RLS disabled.
do $$
declare r record;
begin
  for r in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('businesses','customers','products','sales','sale_items','payments')
      and c.relrowsecurity = false
  loop
    raise exception 'CRITICAL: Row-Level Security is DISABLED on public.%', r.relname;
  end loop;
end $$;

-- Read-only audit query (run manually in the SQL editor to confirm):
--   select relname, relrowsecurity as rls_enabled
--   from pg_class
--   where relname in ('businesses','customers','products','sales','sale_items','payments')
--   order by relname;
