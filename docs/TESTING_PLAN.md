# Testing plan — Internet Vending Machine V0

## Goal

We are testing whether people:

- enjoy browsing the machine
- select multiple products
- VEND things they would genuinely consider buying
- use KEEP STOCKED
- use ALREADY OWN
- restock to discover more products
- build a haul
- share products or their haul
- want to continue browsing or return later

This is behavioral prototype testing, not a purchase test. VEND does not buy anything.

## Current analytics events

All of these go through the centralized `track()` function in `src/lib/analytics.ts`:

- `product_shown`
- `slot_selected`
- `product_vended`
- `keep_stocked`
- `already_own`
- `share_item`
- `share_haul`
- `restock_triggered`

Each event includes a timestamp, an anonymous session ID, and optional `product_id`, `slot_code`, and `restock_id`.

Events currently persist locally in `localStorage["ivm.v0.events"]` as a backup and debugging log. Machine counters also live in `localStorage["ivm.v0.machine"]`.

A remote Supabase sink is implemented (`src/lib/analytics/remote.ts`) so tester interactions from multiple devices can be viewed centrally. It is not live until a Supabase project is configured and the public env vars are set. Remote failure must not break the machine; local tracking continues either way.

`/test-results` summarizes these events. It is on in local development and off in production unless `VITE_ENABLE_TEST_RESULTS=true`.

## Next setup steps

1. Create a Supabase project
2. Run `supabase/schema.sql`
3. Add `VITE_SUPABASE_URL`
4. Add `VITE_SUPABASE_ANON_KEY`
5. Verify localhost events arrive remotely
6. Deploy the project to Vercel
7. Add the same Supabase environment variables in Vercel
8. Verify production analytics
9. Temporarily enable `/test-results` if needed
10. Send the first build to 5–10 testers

Do not enable `/test-results` on the URL you send to testers unless you intend them to see research data.

## Tester instruction

> Pretend VEND means buy. Browse the machine and vend anything you'd genuinely consider getting. Use Already Own if you already have something you think belongs here. Restock when you want to see more. Nothing will actually be purchased.

The in-app first-visit card covers the same idea more briefly. Testers should dismiss it once; that dismissal is remembered locally.

## Follow-up questions

After they have used the machine:

1. Did you want to keep browsing/restocking?
2. Would you come back later to see what changed?
3. Was anything confusing?
4. Was there anything you expected the machine to do that it didn't?
