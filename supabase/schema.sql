-- Internet Vending Machine V0 — anonymous tester events
-- Run this in the Supabase SQL editor.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_name text not null,
  timestamp timestamptz not null default now(),
  product_id text,
  slot_code text,
  restock_id text
);

create index if not exists analytics_events_session_idx
  on public.analytics_events (session_id);

create index if not exists analytics_events_product_idx
  on public.analytics_events (product_id);

create index if not exists analytics_events_name_idx
  on public.analytics_events (event_name);

create index if not exists analytics_events_timestamp_idx
  on public.analytics_events (timestamp);

alter table public.analytics_events enable row level security;

drop policy if exists "anon_insert_events" on public.analytics_events;
create policy "anon_insert_events"
  on public.analytics_events
  for insert
  to anon
  with check (true);

-- Needed for the private /test-results page during this prototype.
-- Before a fully public launch, consider insert-only + disable the route.
drop policy if exists "anon_select_events" on public.analytics_events;
create policy "anon_select_events"
  on public.analytics_events
  for select
  to anon
  using (true);

grant insert, select on public.analytics_events to anon;
grant insert, select on public.analytics_events to authenticated;
