-- IVM analytics client identity + engaged-session classification.
-- Apply in the Supabase SQL editor AFTER reviewing.
-- Do not run from CI. This file does not delete events or rename existing views.
--
-- Deploy order:
-- 1. Run this SQL in production.
-- 2. Then deploy the frontend that POSTs analytics_events.client_id.
--
-- Does not replace analytics_sessions_readable or analytics_session_summary
-- because their exact live definitions were not provided.

alter table public.analytics_events
  add column if not exists client_id text;

create index if not exists analytics_events_client_idx
  on public.analytics_events (client_id);

create table if not exists public.analytics_clients (
  client_id text primary key,
  label text not null,
  actor_type text not null,
  notes text,
  created_at timestamptz not null default now(),
  constraint analytics_clients_actor_type_check
    check (actor_type in ('owner', 'known-tester'))
);

revoke all on public.analytics_clients from anon, authenticated, public;

-- Existing leading columns stay in the same order and types.
-- client_id is appended. Identity: session map, then client map, then cutoff.
create or replace view public.analytics_events_readable as
select
    e.id,
    e.session_id,
    coalesce(s.label, c.label, 'Tester / Unknown'::text) as device,
    case
        when s.actor_type = 'owner'::text then 'OWNER'::text
        when s.actor_type = 'known-tester'::text then 'KNOWN TESTER'::text
        when c.actor_type = 'owner'::text then 'OWNER'::text
        when c.actor_type = 'known-tester'::text then 'KNOWN TESTER'::text
        when e."timestamp" >= '2026-08-18 05:10:00+00'::timestamp with time zone then 'PUBLIC TEST'::text
        else 'PRELAUNCH'::text
    end as traffic,
    e.event_name,
    to_char(
      (e."timestamp" at time zone 'America/Chicago'::text),
      'Mon DD · HH12:MI:SS AM'::text
    ) as time_local,
    (e."timestamp" at time zone 'America/Chicago'::text) as local_time,
    e.product_id,
    e.slot_code,
    e.restock_id,
    e."timestamp" as utc_time,
    e.client_id
from public.analytics_events e
left join public.analytics_sessions s
  on e.session_id = s.session_id
left join public.analytics_clients c
  on c.client_id = e.client_id;

-- New session-level readable view. Does not replace analytics_sessions_readable.
create or replace view public.analytics_sessions_overview as
with ev as (
  select
    e.session_id,
    (array_agg(e.client_id order by e.timestamp) filter (where e.client_id is not null))[1] as client_id,
    min(e.timestamp) as first_seen,
    max(e.timestamp) as last_seen,
    count(*)::bigint as total_events,
    count(*) filter (where e.event_name = 'slot_selected')::bigint as selections,
    count(*) filter (where e.event_name = 'product_vended')::bigint as vends,
    count(*) filter (where e.event_name = 'restock_triggered')::bigint as restocks,
    count(*) filter (where e.event_name = 'restock_signup_opened')::bigint as signup_opens,
    count(*) filter (where e.event_name = 'restock_signup_submitted')::bigint as signup_submits,
    count(*) filter (where e.event_name = 'restock_signup_succeeded')::bigint as signup_successes,
    count(*) filter (where e.event_name in (
      'slot_selected',
      'product_vended',
      'keep_stocked',
      'keep_stocked_removed',
      'already_own',
      'already_own_removed',
      'share_item',
      'share_haul',
      'restock_triggered',
      'help_opened',
      'suggest_opened',
      'stock_product_opened',
      'follow_restocks_opened',
      'restock_signup_opened',
      'restock_signup_submitted',
      'restock_signup_succeeded',
      'restock_signup_failed',
      'haul_opened',
      'haul_card_viewed',
      'product_link_opened',
      'haul_product_link_opened',
      'product_gallery_navigated'
    ))::bigint as engaged_event_count
  from public.analytics_events e
  group by e.session_id
)
select
  ev.session_id,
  ev.client_id,
  r.device,
  r.traffic,
  ev.first_seen,
  ev.last_seen,
  ev.total_events,
  ev.selections,
  ev.vends,
  ev.restocks,
  ev.signup_opens,
  ev.signup_submits,
  ev.signup_successes,
  (ev.engaged_event_count > 0) as engaged,
  ev.engaged_event_count
from ev
left join lateral (
  select er.device, er.traffic
  from public.analytics_events_readable er
  where er.session_id = ev.session_id
  order by er.utc_time desc
  limit 1
) r on true;

-- New traffic summary. Does not replace analytics_session_summary.
-- OWNER is excluded from public/tester metrics.
create or replace view public.analytics_traffic_summary as
select
  o.traffic,
  count(*)::bigint as sessions,
  count(*) filter (where o.engaged)::bigint as engaged_sessions,
  coalesce(sum(o.total_events), 0)::bigint as event_count
from public.analytics_sessions_overview o
where o.traffic <> 'OWNER'
group by o.traffic;

notify pgrst, 'reload schema';

-- After the frontend is live on a browser you want mapped, run in DevTools:
--   __ivmClientId()
-- Then insert that exact client_id here. Do not invent historical client_ids.
--
-- insert into public.analytics_clients (client_id, label, actor_type, notes)
-- values ('cli_…', 'Ryan Mac', 'owner', 'Ryan local Mac');
--
-- Existing session mapping remains in force:
-- ses_60e4cb7e-c491-4297-8e5c-b53005a01aaf / Ryan Mac / owner
