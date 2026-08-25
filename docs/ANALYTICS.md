# Analytics

First-party analytics for The Internet Vending Machine. Raw rows stay in `analytics_events`. Scan visits in `analytics_visits_readable`.

## What a visit means

**Who/what opened the machine, when, and what they actually did.**

| Signal | Meaning |
|---|---|
| `machine_opened` | The URL/site was opened. One event per page load. |
| `human_interaction` | First trusted pointer/click/touch/key/scroll in that session. |
| `slot_selected`, `product_vended`, restock, share, haul, outbound clicks, etc. | Meaningful product/machine actions. |
| `client_id` | Persistent browser identity. Used to label Ryan / owner testing. |
| `session_id` | One usage period, not a forever tab. |

Initial machine rendering no longer writes 16 `product_shown` rows. Restock no longer does either. `slot_selected` is the product-inspection signal.

## Session vs client

`client_id` (`ivm.v0.client` in localStorage)

- Lives as long as the browser origin’s localStorage.
- Identifies a known tester across many sessions.
- Custom domains, localhost, and `*.vercel.app` each have **separate** localStorage. Register each origin separately.

`session_id` (`ivm.v0.session` + `ivm.v0.session.active`)

- Represents one usage period.
- Tracked activity (page load, `track()` events, trusted interaction) refreshes the last-active timestamp.
- After **30 minutes with no activity**, the **next** activity mints a new `session_id`.
- Idle tabs do **not** rotate on a timer. A tab left open overnight keeps its current session until something happens again.
- Reloads within 30 minutes stay on the same session and add another `machine_opened`.

## Classification (heuristic)

Applied in `analytics_visits_readable`. Mapped clients always win.

| Classification | Rule |
|---|---|
| **OWNER TESTING** | `analytics_clients` or `analytics_sessions` marks the visitor as `owner` or `known-tester`. |
| **HUMAN / ENGAGED** | Trusted `human_interaction` plus at least one meaningful product/machine action. Historic sessions with those actions but no new human signal are also treated as engaged. |
| **HUMAN / UNENGAGED** | Trusted interaction, then left without a product/machine action. |
| **LIKELY AUTOMATED** | Machine opened (or a legacy `product_shown` render burst) with no trusted interaction and no meaningful action. |
| **UNKNOWN** | Not enough evidence. Includes new-world opens that have product events but no trusted interaction (for example a hash auto-select). |

This is behavioral, not crawler-grade bot detection. No fingerprinting, no user-agent lists.

`meaningful_event_count` excludes `machine_opened`, `human_interaction`, and `product_shown`. `event_count` is still the raw total.

## Register this browser as Ryan / Owner

Each origin needs its own row.

1. Open the machine on that origin (custom domain, localhost, or Vercel).
2. Open DevTools → Console.
3. Run `__ivmClientId()`.
4. In the Supabase SQL editor, run the insert it prints, for example:

```sql
insert into public.analytics_clients (client_id, label, actor_type, notes)
values ('cli_…', 'Ryan', 'owner', 'https://theinternetvendingmachine.com');
```

Do not invent historical `client_id` values. After this mapping, every new session from that browser classifies as **Ryan / OWNER TESTING**.

Existing session mapping remains valid for old rows without `client_id` (`ses_60e4cb7e-c491-4297-8e5c-b53005a01aaf` → Ryan Mac / owner).

## Supabase setup (do this manually)

In the Supabase SQL editor, run in order:

1. [`supabase/schema.sql`](../supabase/schema.sql) — only needed on a fresh project.
2. [`supabase/migrations/20260823_analytics_client_identity.sql`](../supabase/migrations/20260823_analytics_client_identity.sql) — skip if already applied.
3. **[`supabase/migrations/20260824_analytics_visits_readable.sql`](../supabase/migrations/20260824_analytics_visits_readable.sql)** — run this for the new visit view. Required before or with the frontend deploy.

Then open **Table Editor → `analytics_visits_readable`**. Sort by `visit_time` descending.

The migration:

- Adds optional `referrer` and `page_path` on `analytics_events` (used by `machine_opened`).
- Rebuilds `analytics_events_readable` so `client_id` mappings win.
- Creates `analytics_visits_readable` (primary scan view).
- Recreates `analytics_sessions_overview` and `analytics_traffic_summary` as compatibility wrappers.
- Adds `analytics_visits_summary` (counts by classification, excluding owner testing).
- Does **not** delete raw events.
- Does **not** drop `analytics_sessions_readable` or `analytics_session_summary`.

If step 3 errors because another view depends on `analytics_sessions_overview`, paste the error; those live-only views were never checked into git.

## Testing checklist

Use a private window unless the scenario says “Ryan browser”. After each run, refresh `analytics_visits_readable`.

1. **Fresh incognito, open page, do nothing**  
   Expect: `Unknown` · `LIKELY AUTOMATED` · `Opened machine, no human interaction` · `machine_open_count = 1` · no `product_shown` burst · `human_interaction_count = 0`.

2. **Fresh incognito, scroll or click the machine, do not select a product**  
   Expect: `Unknown` · `HUMAN / UNENGAGED` · `Opened machine, interacted, no product action` · `human_interaction_count = 1` · `engaged = false`.

3. **Fresh incognito, select a slot and click VIEW PRODUCT**  
   Expect: `Unknown` · `HUMAN / ENGAGED` · summary like `Selected A3 → Clicked product link ×1` · `likely_human = true` · `engaged = true`.

4. **Known Ryan browser, restock / select / vend heavily**  
   Expect: `Ryan` (or your mapped label) · `OWNER TESTING` even across many `session_id`s · summary lists restocks, selections, vends.

5. **Leave a Ryan tab idle more than 30 minutes, then resume**  
   Expect: a **new** `session_id` on resume · still `Ryan` / `OWNER TESTING` via `client_id` · the idle session is not split until resume (no timer-made extra sessions).

6. **Reload several times within 30 minutes**  
   Expect: same `session_id` · `machine_open_count` matches reloads · still no 16-row `product_shown` bursts.

7. **Confirm initial load does not create 16 `product_shown` rows**  
   In `analytics_events` (or `analytics_events_readable`), a new visit should start with `machine_opened`, not 16 `product_shown` events. Restock should write `restock_triggered` only.

Historic rows from before this change may be `UNKNOWN` or show old `product_shown` bursts. That is expected.
