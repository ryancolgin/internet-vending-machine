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

-- Product suggestions from the public test. Insert-only for anonymous testers.
create table if not exists public.product_suggestions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  name text,
  url text,
  note text,
  submitter_type text not null default 'tester',
  constraint product_suggestions_name_or_url check (
    (name is not null and btrim(name) <> '')
    or (url is not null and btrim(url) <> '')
  ),
  constraint product_suggestions_submitter_type check (
    submitter_type in ('owner', 'tester')
  )
);

alter table public.product_suggestions enable row level security;

drop policy if exists "anon_insert_suggestions" on public.product_suggestions;
create policy "anon_insert_suggestions"
  on public.product_suggestions
  for insert
  to anon
  with check (true);

grant insert on public.product_suggestions to anon;
grant insert on public.product_suggestions to authenticated;

-- Idempotent update for projects that already created product_suggestions
-- with a required url and no name column.
alter table public.product_suggestions
  alter column url drop not null;

alter table public.product_suggestions
  add column if not exists name text;

alter table public.product_suggestions
  drop constraint if exists product_suggestions_name_or_url;

alter table public.product_suggestions
  add constraint product_suggestions_name_or_url check (
    (name is not null and btrim(name) <> '')
    or (url is not null and btrim(url) <> '')
  );

alter table public.product_suggestions
  add column if not exists submitter_type text not null default 'tester';

alter table public.product_suggestions
  drop constraint if exists product_suggestions_submitter_type;

alter table public.product_suggestions
  add constraint product_suggestions_submitter_type check (
    submitter_type in ('owner', 'tester')
  );

alter table public.product_suggestions
  drop constraint if exists product_suggestions_intent;

alter table public.product_suggestions
  drop column if exists intent;

notify pgrst, 'reload schema';
