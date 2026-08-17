# Internet Vending Machine

A finite, rotating collection of unusually useful products from around the internet.

> The internet gave us infinite shelves. Internet Vending Machine puts the constraint back.

This is the **V0 testing prototype**. Vending does not purchase anything. It adds a product to a personal haul so we can learn what people would actually consider getting.

## Local development

Requires **Node 20+** (a `.nvmrc` is included for 22).

```bash
cp .env.example .env
npm install
npm run dev
```

Then open the local URL Vite prints (`http://127.0.0.1:5173/`).

`/test-results` is available in local development.

## Production build

```bash
npm run build
npm run preview
```

## Required environment variables

Public client values only. Never put the Supabase service role key in this app.

| Variable | Required | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | For remote analytics | Project URL, e.g. `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | For remote analytics | Anon / public key |
| `VITE_ENABLE_TEST_RESULTS` | Optional | Set to `true` to enable `/test-results` in production. Defaults on in local dev, off in production. |

Copy `.env.example` to `.env` locally. On Vercel, set the same names in Project Settings → Environment Variables.

The machine still works if these are missing. Events stay in `localStorage` only.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel (Vite / other preset). Build command `npm run build`, output `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Optionally set `VITE_ENABLE_TEST_RESULTS=true` if you want the private results page on the deployed URL. Leave it unset before sending the public link to friends.
5. Deploy. SPA routes are rewritten via `vercel.json`.

Do not configure a custom domain yet.

### Supabase (one-time)

1. Create a project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. Copy the project URL and anon key into env vars.

Inventory stays in [`src/data/products.ts`](src/data/products.ts). Do not move it into Supabase yet.

## Adding products

1. Add a `Product` object to the `products` array in `src/data/products.ts`.
2. Use `status: "test" | "active" | "house-stock"` to make it eligible for the live machine.
3. Set `illustration` to a reusable key from [`src/illustrations/keys.ts`](src/illustrations/keys.ts).
4. Optional: set `productImage` for the inspector only.
5. Keep `id` stable. Historical analytics events key off `product_id`, not the display name.

## What V0 stores

- Local: session id, haul, restock history, intro dismissal, metrics, and a backup event log (`ivm.v0.*`)
- Remote (if configured): anonymous rows in `analytics_events`

Nothing is purchased. Suggest / stock / follow are informational placeholders.
