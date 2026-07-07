-- ═══════════════════════════════════════════════════════════════════════
--  Activity log — an append-only audit trail of who changed what, when.
--  Powers the History page and the per-record edit history on sales/payments.
--  Business-scoped like every other table. Insert + select only (no update or
--  delete by users) so the trail can't be tampered with.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.activity_log (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  actor        text,                       -- owner name/email at time of action
  action       text not null,              -- create | update | delete | settle | restore
  entity_type  text not null,              -- customer | product | sale | payment | expense
  entity_id    uuid,
  summary      text not null,              -- human-readable description
  created_at   timestamptz not null default now()
);

create index if not exists activity_log_business_idx on public.activity_log (business_id, created_at desc);
create index if not exists activity_log_entity_idx  on public.activity_log (business_id, entity_type, entity_id);

alter table public.activity_log enable row level security;

-- Read your own business's log.
drop policy if exists activity_log_select on public.activity_log;
create policy activity_log_select on public.activity_log
  for select
  using (business_id in (select id from public.businesses where user_id = auth.uid()));

-- Append to your own business's log. No update/delete policy = immutable trail.
drop policy if exists activity_log_insert on public.activity_log;
create policy activity_log_insert on public.activity_log
  for insert
  with check (business_id in (select id from public.businesses where user_id = auth.uid()));
