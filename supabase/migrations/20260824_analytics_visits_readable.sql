-- IVM readable visits + visit-context columns.
-- Apply in the Supabase SQL editor AFTER reviewing.
-- Do not run from CI. This file does not delete events or drop existing tables.
--
-- Deploy order:
-- 1. Run this SQL in production.
-- 2. Then deploy the frontend that sends machine_opened / human_interaction
--    and optional referrer / page_path.
--
-- Identity rule: analytics_clients (client_id) wins over analytics_sessions
-- (session_id). Session mapping remains for historical rows without client_id.
--
-- Primary scan view: public.analytics_visits_readable

alter table public.analytics_events
  add column if not exists referrer text;

alter table public.analytics_events
  add column if not exists page_path text;

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

-- Recreate owned visit views. Do not drop analytics_sessions_readable
-- or analytics_session_summary.
drop view if exists public.analytics_visits_summary;
drop view if exists public.analytics_visits_readable;

-- Existing leading columns stay in the same order and types.
-- Client map is preferred over session map.
create or replace view public.analytics_events_readable as
select
    e.id,
    e.session_id,
    coalesce(c.label, s.label, 'Unknown'::text) as device,
    case
        when c.actor_type = 'owner'::text then 'OWNER'::text
        when c.actor_type = 'known-tester'::text then 'KNOWN TESTER'::text
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
    e."timestamp" as utc_time,
    e.client_id
from public.analytics_events e
left join public.analytics_sessions s
  on e.session_id = s.session_id
left join public.analytics_clients c
  on c.client_id = e.client_id;

create or replace view public.analytics_visits_readable as
with ev as (
  select
    e.session_id,
    (array_agg(e.client_id order by e.timestamp) filter (where e.client_id is not null))[1] as client_id,
    min(e.timestamp) as first_seen,
    max(e.timestamp) as last_seen,
    count(*)::bigint as event_count,
    count(*) filter (where e.event_name = 'machine_opened')::bigint as machine_open_count,
    count(*) filter (where e.event_name = 'human_interaction')::bigint as human_interaction_count,
    count(*) filter (where e.event_name = 'product_shown')::bigint as product_shown_count,
    count(*) filter (where e.event_name = 'slot_selected')::bigint as slot_selection_count,
    count(*) filter (where e.event_name = 'product_vended')::bigint as vend_count,
    count(*) filter (where e.event_name = 'restock_triggered')::bigint as restock_count,
    count(*) filter (where e.event_name in ('product_link_opened', 'haul_product_link_opened'))::bigint as product_click_count,
    count(*) filter (where e.event_name in ('share_item', 'share_haul'))::bigint as share_count,
    count(*) filter (where e.event_name = 'follow_restocks_opened')::bigint as follow_open_count,
    count(*) filter (where e.event_name = 'restock_signup_submitted')::bigint as signup_submit_count,
    count(*) filter (where e.event_name = 'restock_signup_succeeded')::bigint as signup_success_count,
    count(*) filter (where e.event_name in ('haul_opened', 'haul_card_viewed'))::bigint as haul_count,
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
    ))::bigint as meaningful_event_count,
    (array_agg(e.slot_code order by e.timestamp desc) filter (
      where e.event_name = 'slot_selected' and e.slot_code is not null
    ))[1] as last_slot
  from public.analytics_events e
  group by e.session_id
),
labeled as (
  select
    ev.*,
    coalesce(c.label, s.label, 'Unknown'::text) as visitor_label,
    case
      when c.actor_type = 'owner'::text then 'OWNER'::text
      when c.actor_type = 'known-tester'::text then 'KNOWN TESTER'::text
      when s.actor_type = 'owner'::text then 'OWNER'::text
      when s.actor_type = 'known-tester'::text then 'KNOWN TESTER'::text
      when ev.first_seen >= '2026-08-18 05:10:00+00'::timestamp with time zone then 'PUBLIC TEST'::text
      else 'PRELAUNCH'::text
    end as traffic,
    case
      when coalesce(c.actor_type, s.actor_type) in ('owner', 'known-tester') then 'OWNER TESTING'::text
      when ev.human_interaction_count > 0 and ev.meaningful_event_count > 0 then 'HUMAN / ENGAGED'::text
      when ev.human_interaction_count > 0 then 'HUMAN / UNENGAGED'::text
      when ev.machine_open_count > 0
        and ev.human_interaction_count = 0
        and ev.meaningful_event_count = 0
        then 'LIKELY AUTOMATED'::text
      when ev.machine_open_count > 0
        and ev.human_interaction_count = 0
        then 'UNKNOWN'::text
      when ev.meaningful_event_count > 0 then 'HUMAN / ENGAGED'::text
      when ev.product_shown_count >= 8
        or (ev.event_count > 0 and ev.product_shown_count = ev.event_count)
        then 'LIKELY AUTOMATED'::text
      else 'UNKNOWN'::text
    end as classification
  from ev
  left join public.analytics_clients c
    on c.client_id = ev.client_id
  left join public.analytics_sessions s
    on s.session_id = ev.session_id
)
select
  labeled.first_seen as visit_time,
  to_char(
    (labeled.first_seen at time zone 'America/Chicago'::text),
    'Mon DD · HH12:MI AM'::text
  ) as visit_time_local,
  labeled.last_seen,
  labeled.visitor_label,
  labeled.classification,
  case
    when labeled.classification = 'LIKELY AUTOMATED'::text and labeled.machine_open_count > 0
      then 'Opened machine, no human interaction'::text
    when labeled.classification = 'LIKELY AUTOMATED'::text and labeled.product_shown_count >= 8
      then ('Render burst (' || labeled.product_shown_count::text || ' product_shown), no interaction')::text
    when labeled.classification = 'HUMAN / UNENGAGED'::text
      then 'Opened machine, interacted, no product action'::text
    else nullif(
      concat_ws(
        ' → ',
        case
          when labeled.machine_open_count > 1 then 'Opened ×' || labeled.machine_open_count::text
        end,
        case
          when labeled.restock_count > 0 then 'Restocked ×' || labeled.restock_count::text
        end,
        case
          when labeled.slot_selection_count = 1 and labeled.last_slot is not null
            then 'Selected ' || labeled.last_slot
          when labeled.slot_selection_count > 0
            then 'Selected ×' || labeled.slot_selection_count::text
        end,
        case
          when labeled.vend_count > 0 then 'Vended ×' || labeled.vend_count::text
        end,
        case
          when labeled.product_click_count > 0
            then 'Clicked product link ×' || labeled.product_click_count::text
        end,
        case
          when labeled.share_count > 0 then 'Shared ×' || labeled.share_count::text
        end,
        case
          when labeled.haul_count > 0 then 'Haul ×' || labeled.haul_count::text
        end,
        case
          when labeled.follow_open_count > 0
            then 'Follow restocks ×' || labeled.follow_open_count::text
        end,
        case
          when labeled.signup_success_count > 0
            then 'Restock signup ×' || labeled.signup_success_count::text
        end
      ),
      ''
    )
  end as activity_summary,
  case
    when labeled.classification in (
      'OWNER TESTING',
      'HUMAN / ENGAGED',
      'HUMAN / UNENGAGED'
    ) then true
    when labeled.classification = 'LIKELY AUTOMATED'::text then false
    else null
  end as likely_human,
  (labeled.meaningful_event_count > 0) as engaged,
  labeled.traffic,
  labeled.machine_open_count,
  labeled.meaningful_event_count,
  labeled.event_count,
  labeled.slot_selection_count,
  labeled.vend_count,
  labeled.product_click_count,
  labeled.restock_count,
  labeled.share_count,
  labeled.follow_open_count,
  labeled.signup_submit_count,
  labeled.signup_success_count,
  labeled.human_interaction_count,
  extract(epoch from (labeled.last_seen - labeled.first_seen))::bigint as duration_seconds,
  (labeled.last_seen - labeled.first_seen) as active_span,
  labeled.client_id,
  labeled.session_id,
  labeled.first_seen,
  labeled.last_seen as last_seen_at
from labeled;

create or replace view public.analytics_sessions_overview as
select
  session_id,
  client_id,
  visitor_label as device,
  traffic,
  first_seen,
  last_seen,
  event_count as total_events,
  slot_selection_count as selections,
  vend_count as vends,
  restock_count as restocks,
  follow_open_count as signup_opens,
  signup_submit_count as signup_submits,
  signup_success_count as signup_successes,
  engaged,
  meaningful_event_count as engaged_event_count
from public.analytics_visits_readable;

create or replace view public.analytics_traffic_summary as
select
  o.traffic,
  count(*)::bigint as sessions,
  count(*) filter (where o.engaged)::bigint as engaged_sessions,
  coalesce(sum(o.total_events), 0)::bigint as event_count
from public.analytics_sessions_overview o
where o.traffic <> 'OWNER'
group by o.traffic;

create or replace view public.analytics_visits_summary as
select
  v.classification,
  count(*)::bigint as visits,
  count(*) filter (where v.engaged)::bigint as engaged_visits,
  coalesce(sum(v.event_count), 0)::bigint as event_count,
  coalesce(sum(v.meaningful_event_count), 0)::bigint as meaningful_event_count
from public.analytics_visits_readable v
where v.classification <> 'OWNER TESTING'
group by v.classification;

notify pgrst, 'reload schema';

-- After the frontend is live on a browser you want mapped, run in DevTools:
--   __ivmClientId()
-- Then insert that exact client_id. Custom domains have separate localStorage
-- from localhost and from *.vercel.app — register each origin separately.
--
-- insert into public.analytics_clients (client_id, label, actor_type, notes)
-- values ('cli_…', 'Ryan', 'owner', 'https://theinternetvendingmachine.com');
--
-- Existing session mapping remains in force for historical rows:
-- ses_60e4cb7e-c491-4297-8e5c-b53005a01aaf / Ryan Mac / owner
