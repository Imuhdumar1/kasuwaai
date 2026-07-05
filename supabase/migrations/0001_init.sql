-- ═══════════════════════════════════════════════════════════════════════
--  KasuwaAI — initial schema
--  Run this in the Supabase SQL editor (or `supabase db push`).
--  Every table is scoped to the owning business via Row-Level Security.
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── businesses (one per auth user) ────────────────────────────────────
create table if not exists public.businesses (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null unique references auth.users(id) on delete cascade,
  business_name         text not null,
  owner_name            text,
  phone                 text,
  email                 text,
  business_category     text,
  market_location       text,
  state                 text,
  lga                   text,
  language              text not null default 'en',
  currency              text not null default 'NGN',
  notification_settings jsonb not null default '{}'::jsonb,
  logo_url              text,
  theme                 text not null default 'light',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ─── customers ─────────────────────────────────────────────────────────
create table if not exists public.customers (
  id                 uuid primary key default gen_random_uuid(),
  business_id        uuid not null references public.businesses(id) on delete cascade,
  full_name          text not null,
  nickname           text,
  phone              text,
  whatsapp           text,
  email              text,
  gender             text,
  address            text,
  market             text,
  business_type      text,
  preferred_language text,
  credit_limit       numeric(14,2) not null default 0,
  notes              text,
  photo_url          text,
  status             text not null default 'active',   -- active | archived
  created_at         timestamptz not null default now()
);
create index if not exists customers_business_idx on public.customers(business_id);

-- ─── products ──────────────────────────────────────────────────────────
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses(id) on delete cascade,
  name           text not null,
  category       text,
  sku            text,
  barcode        text,
  cost_price     numeric(14,2) not null default 0,
  selling_price  numeric(14,2) not null default 0,
  stock_quantity numeric(14,2) not null default 0,
  unit           text not null default 'unit',
  description    text,
  image_url      text,
  status         text not null default 'active',        -- active | archived
  created_at     timestamptz not null default now()
);
create index if not exists products_business_idx on public.products(business_id);

-- ─── sales (transactions) ──────────────────────────────────────────────
create table if not exists public.sales (
  id                  uuid primary key default gen_random_uuid(),
  business_id         uuid not null references public.businesses(id) on delete cascade,
  customer_id         uuid references public.customers(id) on delete set null,
  sale_date           timestamptz not null default now(),
  subtotal            numeric(14,2) not null default 0,
  discount            numeric(14,2) not null default 0,
  tax                 numeric(14,2) not null default 0,
  total_amount        numeric(14,2) not null default 0,
  amount_paid         numeric(14,2) not null default 0,
  outstanding_balance numeric(14,2) not null default 0,
  profit              numeric(14,2) not null default 0,
  payment_method      text,
  due_date            date,
  notes               text,
  status              text not null default 'unpaid',    -- paid | partially_paid | unpaid
  source              text not null default 'manual',    -- manual | voice
  created_at          timestamptz not null default now(),
  constraint sales_amount_paid_nonneg   check (amount_paid >= 0),
  constraint sales_outstanding_nonneg   check (outstanding_balance >= 0)
);
create index if not exists sales_business_idx on public.sales(business_id);
create index if not exists sales_customer_idx on public.sales(customer_id);
create index if not exists sales_date_idx     on public.sales(sale_date);

-- ─── sale line items ───────────────────────────────────────────────────
create table if not exists public.sale_items (
  id           uuid primary key default gen_random_uuid(),
  sale_id      uuid not null references public.sales(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity     numeric(14,2) not null default 1,
  unit_price   numeric(14,2) not null default 0,
  cost_price   numeric(14,2) not null default 0,
  line_total   numeric(14,2) not null default 0
);
create index if not exists sale_items_sale_idx    on public.sale_items(sale_id);
create index if not exists sale_items_product_idx on public.sale_items(product_id);

-- ─── payments ──────────────────────────────────────────────────────────
create table if not exists public.payments (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references public.businesses(id) on delete cascade,
  sale_id          uuid not null references public.sales(id) on delete cascade,
  customer_id      uuid references public.customers(id) on delete set null,
  amount           numeric(14,2) not null,
  method           text,
  reference_number text,
  payment_date     timestamptz not null default now(),
  notes            text,
  created_at       timestamptz not null default now(),
  constraint payments_amount_positive check (amount > 0)
);
create index if not exists payments_business_idx on public.payments(business_id);
create index if not exists payments_sale_idx     on public.payments(sale_id);
create index if not exists payments_customer_idx on public.payments(customer_id);

-- ═══════════════════════════════════════════════════════════════════════
--  Money integrity: keep a sale's paid / outstanding / status derived
--  from the sum of its payments. Single source of truth = payments table.
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.recompute_sale(p_sale uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_total numeric(14,2);
  v_paid  numeric(14,2);
begin
  select total_amount into v_total from public.sales where id = p_sale;
  if v_total is null then return; end if;

  select coalesce(sum(amount), 0) into v_paid from public.payments where sale_id = p_sale;

  update public.sales set
    amount_paid         = v_paid,
    outstanding_balance = greatest(v_total - v_paid, 0),
    status = case
      when v_paid <= 0            then 'unpaid'
      when v_paid >= v_total      then 'paid'
      else 'partially_paid'
    end
  where id = p_sale;
end;
$$;

-- Prevent a payment that would exceed the sale's total (no overpayment).
create or replace function public.enforce_payment_within_balance()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_total numeric(14,2);
  v_paid  numeric(14,2);
begin
  select total_amount into v_total from public.sales where id = new.sale_id;
  if v_total is null then
    raise exception 'Sale % does not exist', new.sale_id;
  end if;
  select coalesce(sum(amount), 0) into v_paid
    from public.payments where sale_id = new.sale_id and id <> new.id;
  if v_paid + new.amount > v_total + 0.005 then
    raise exception 'Payment of % exceeds outstanding balance of %',
      new.amount, (v_total - v_paid);
  end if;
  return new;
end;
$$;

create or replace function public.payments_after_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    perform public.recompute_sale(old.sale_id);
    return old;
  else
    perform public.recompute_sale(new.sale_id);
    return new;
  end if;
end;
$$;

drop trigger if exists trg_payment_within_balance on public.payments;
create trigger trg_payment_within_balance
  before insert or update on public.payments
  for each row execute function public.enforce_payment_within_balance();

drop trigger if exists trg_payments_after_change on public.payments;
create trigger trg_payments_after_change
  after insert or update or delete on public.payments
  for each row execute function public.payments_after_change();

-- ═══════════════════════════════════════════════════════════════════════
--  Auto-create a business row when a new auth user signs up, using the
--  metadata passed to supabase.auth.signUp({ options: { data } }).
-- ═══════════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.businesses (
    user_id, business_name, owner_name, phone, email,
    business_category, market_location, state, lga, language, currency
  ) values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'business_name', ''), 'My Business'),
    new.raw_user_meta_data->>'owner_name',
    new.raw_user_meta_data->>'phone',
    new.email,
    new.raw_user_meta_data->>'business_category',
    new.raw_user_meta_data->>'market_location',
    new.raw_user_meta_data->>'state',
    new.raw_user_meta_data->>'lga',
    coalesce(nullif(new.raw_user_meta_data->>'language', ''), 'en'),
    coalesce(nullif(new.raw_user_meta_data->>'currency', ''), 'NGN')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════
--  Row-Level Security — every row is visible only to its owning business.
-- ═══════════════════════════════════════════════════════════════════════
alter table public.businesses enable row level security;
alter table public.customers  enable row level security;
alter table public.products   enable row level security;
alter table public.sales      enable row level security;
alter table public.sale_items enable row level security;
alter table public.payments   enable row level security;

-- Helper predicate reused below: the set of business ids owned by the caller.
-- (Inlined as subqueries for clarity / no extra function needed.)

-- businesses
drop policy if exists businesses_select on public.businesses;
create policy businesses_select on public.businesses
  for select using (user_id = auth.uid());
drop policy if exists businesses_insert on public.businesses;
create policy businesses_insert on public.businesses
  for insert with check (user_id = auth.uid());
drop policy if exists businesses_update on public.businesses;
create policy businesses_update on public.businesses
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists businesses_delete on public.businesses;
create policy businesses_delete on public.businesses
  for delete using (user_id = auth.uid());

-- Generic owner check for child tables that carry business_id.
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

-- sale_items has no business_id — scope through its parent sale.
drop policy if exists sale_items_all on public.sale_items;
create policy sale_items_all on public.sale_items
  for all
  using (sale_id in (
    select s.id from public.sales s
    join public.businesses b on b.id = s.business_id
    where b.user_id = auth.uid()))
  with check (sale_id in (
    select s.id from public.sales s
    join public.businesses b on b.id = s.business_id
    where b.user_id = auth.uid()));
