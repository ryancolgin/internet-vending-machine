# Inventory workflow — Internet Vending Machine V0

Do not maintain a duplicate inventory list in this file, a spreadsheet, or a Markdown product catalog.

## Current source of truth

For V0, product inventory lives in:

`src/data/products.ts`

That typed `products` array is the catalog. Restock, slots, haul, share, and analytics all read from it. Product performance events key off the stable `id` field (`product_id` in analytics), not the display name.

## Current workflow

New products can be:

1. discovered by us
2. reviewed for fit
3. added to `products.ts`
4. assigned a stable product ID
5. assigned an illustration key
6. given machine copy and metadata
7. added as Test Stock
8. evaluated using tester analytics

Keep IDs stable. If a product leaves the machine and later returns, historical events should still point at the same `id`.

Illustration keys are defined in `src/illustrations/keys.ts` and mapped in `src/illustrations/catalog.tsx`. Optional `productImage` is for the selected-product inspector only.

Live rotation uses `status` values `test`, `active`, and `house-stock`. Candidates, retired, and archived products stay in the file but are not restocked into the 16 visible slots.

## Stocking philosophy

> Small objects and software with unusually high utility, thoughtfulness, or design relative to their size and price.

The machine may include physical products, software, digital products, useful free tools, stationery, repair products, travel items, reference objects, and unusually good everyday objects.

## Visual product system

- Machine slot → illustration
- Selected inspector → real product image when available
- Dispense → illustration
- Haul → illustration by default
- Actual merchant purchase later → real product

Do not replace the illustration system with photography in the windows, tray, or haul.

## Product lifecycle

Candidate → Test Stock → Active → House Stock / Retired → Archived

Retired products can later return as:

**BACK IN MACHINE**

In V0 this lifecycle is expressed as `status` and optional `badges` on the product object. There is no admin UI yet.

## Future source of truth

Once V0 testing demonstrates enough value to continue, migrate inventory from `src/data/products.ts` into a Supabase `products` table.

Keep analytics and inventory as separate systems. Existing `product_id` values should survive that migration so old test results remain readable.

Eventually build a private `/stockroom` interface for:

- viewing all products
- adding candidates
- editing product metadata
- choosing product images
- reviewing machine copy
- TEST / PASS decisions
- activating products
- House Stock decisions
- retiring products
- bringing products back
- viewing product performance

The goal is that the curator should eventually manage inventory through Stockroom rather than editing code or database rows directly.

Do not implement Supabase product inventory or Stockroom yet.
