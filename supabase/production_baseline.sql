-- Exact production analytics objects captured 2026-08-23.
-- Source of truth for live-only table/view SQL that was not previously in git.
-- Do not apply blindly to a database that already has these objects.

create table if not exists public.analytics_sessions (
  session_id text primary key,
  label text,
  actor_type text not null default 'tester',
  notes text,
  created_at timestamptz not null default now()
);

-- Confirmed owner session already present in production:
-- session_id  ses_60e4cb7e-c491-4297-8e5c-b53005a01aaf
-- label       Ryan Mac
-- actor_type  owner
-- notes       Confirmed Ryan local QA session

create or replace view public.analytics_events_readable as
select
    e.id,
    e.session_id,
    coalesce(s.label, 'Tester / Unknown'::text) as device,
    case
        when s.actor_type = 'owner'::text then 'OWNER'::text
        when s.actor_type = 'known-tester'::text then 'KNOWN TESTER'::text
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
    e."timestamp" as utc_time
from public.analytics_events e
left join public.analytics_sessions s
  on e.session_id = s.session_id;

-- analytics_sessions_readable and analytics_session_summary exist in
-- production but their exact CREATE VIEW text was not provided. They are
-- intentionally not reproduced here.
