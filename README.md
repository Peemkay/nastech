# NASTECH Gadgets

**Smart Tech. Better Life.** — Nigeria's marketplace to sell/trade-in phones, laptops, tablets, smartwatches, audio and consoles for instant cash; shop brand-new or certified refurbished devices; and book hardware/software repairs. Built as an original, upgraded take on the Cashify-style model, themed to the NASTECH brand (blue `#0078F0` / chrome silver, light theme) and wired for **Nigerian payment methods only** (Paystack, Flutterwave, direct bank transfer).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Prisma** ORM — **PostgreSQL** (e.g. [Neon](https://neon.tech), free tier). Any Postgres works; Neon is the fastest to set up.
- **Auth.js (NextAuth v5)** — credentials login, JWT sessions, role-based access (`CUSTOMER` / `ADMIN` / `SUPERADMIN`)
- **Paystack** + **Flutterwave** + **manual bank transfer** — selectable/toggleable per admin settings, with webhook-verified payment confirmation
- **Google Maps Geocoding + Distance Matrix** — real road-distance delivery pricing from the depot (Dutsen Alhaji Market, Abuja) to the customer, with a flat-fee fallback when unconfigured
- **[nga-states-lga API](https://nga-states-lga.onrender.com)** — live Nigeria states/LGA data for address forms, cached daily with an offline fallback list
- **Vercel Blob** — admin product photo uploads
- **Termii** — SMS OTP for phone-number verification at registration (Nigeria-focused SMS provider)
- **Zustand** — client-side cart
- **Recharts** — admin analytics

## Getting started

You need a Postgres database first — [Neon](https://neon.tech) has a free tier that takes under a minute (sign in with GitHub → New Project → copy the connection string). Any other Postgres (Supabase, RDS, local) works too.

```bash
npm install
cp .env.example .env   # then paste your DATABASE_URL in, plus INITIAL_ADMIN_EMAIL/PASSWORD (see below)
npm run db:push        # create the schema
npm run db:seed        # load categories, brands, models, quote rules, sample products, regions, repair services
npm run dev
```

Visit **http://localhost:3000**. Admin console is at **/admin/login**.

### Getting your first admin account

**No demo accounts or passwords ship with this app** — that's a real security liability the moment it's live. Instead, set `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` in `.env` (pick your own real email + a strong password) before seeding. The first admin is created:
- automatically during `npm run db:seed`, or
- automatically the first time anyone loads `/admin/login`, if seeding was skipped (self-healing — safe to leave the env vars set permanently)

Once you've logged in, that admin can register further admins with assigned privilege levels from **Users → Add Admin** (super admin only), and rotate their own password from **Account → Profile**.

Regular customers register themselves from the site (`/register`), verifying their phone number by OTP.

## Environment variables

Copy `.env.example` to `.env` and fill in real values:

- `DATABASE_URL` — your Postgres connection string (Neon/Supabase/etc.).
- `AUTH_SECRET` — session signing secret (`npx auth secret` to generate one). **Required** in production — the app won't start without it.
- `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` / `INITIAL_ADMIN_NAME` — bootstraps your first admin account (see above). Pick a real email and a strong password — this is the only admin credential that will ever exist unless *you* create more from the dashboard.
- `TERMII_API_KEY` / `TERMII_SENDER_ID` — from [termii.com](https://termii.com) (Nigeria-focused SMS/OTP provider), used to send the phone-verification code at registration. Without it, the OTP is logged server-side and returned in the API response marked as dev-mode instead of texted — registration still works end-to-end for testing, but **no one can actually receive a real code until this is configured**, so set it before real launch.
- `PAYSTACK_SECRET_KEY` / `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — from your Paystack dashboard (test or live).
- `FLUTTERWAVE_SECRET_KEY` / `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` / `FLUTTERWAVE_WEBHOOK_SECRET_HASH` — from your Flutterwave dashboard. The webhook hash is a string **you** choose and set in both the Flutterwave dashboard and this env var.
- `GOOGLE_MAPS_API_KEY` — server-only secret from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) with the **Geocoding API** and **Distance Matrix API** enabled. Without it, delivery fees fall back to a flat ₦2,500 instead of real distance-based pricing — checkout still works either way.
- `BLOB_READ_WRITE_TOKEN` — from your Vercel project → **Storage** → create a Blob store (auto-added to env vars once linked). Without it, the admin "Add photo" button fails with a clear error; everything else still works.
- `NEXT_PUBLIC_SITE_URL` — optional. Payment callback URLs auto-detect from the incoming request if this is unset, so it's safe to leave blank until you know your final domain.

Payment gateways won't actually charge anything until you supply real Paystack/Flutterwave keys — with the placeholder test keys, initializing a payment will fail gracefully with an error message instead of silently succeeding. Bank transfer works with no keys at all.

### Wiring up webhooks

- Paystack dashboard → Settings → API Keys & Webhooks → Webhook URL: `https://yourdomain/api/payments/paystack/webhook`
- Flutterwave dashboard → Settings → Webhooks → URL: `https://yourdomain/api/payments/flutterwave/webhook`, Secret hash: same value as `FLUTTERWAVE_WEBHOOK_SECRET_HASH`

Webhooks are the source of truth for payment confirmation; the browser redirect back from checkout (`/checkout/callback`) also re-verifies immediately so the customer sees an up-to-date status without waiting on the webhook.

## What's included

**Storefront**
- Log in with **email or phone number** + password; registration requires **OTP phone verification** before the account is created
- Home, category → brand → model trade-in quote wizard with a live-updating instant price. Guests can explore and see the estimate, but must register + verify their phone before scheduling a pickup — same gate on the repair-booking flow
- Pickup scheduling (address, LGA, date, time slot) and a generated `NAS-SEL-######` tracking code
- Shop with brand-new and certified-refurbished devices, filters, product detail, reviews, cart, multi-step checkout
- Repair booking: category → device/issue → drop-off or pickup → live estimate, producing a `NAS-REP-######` tracking code
- Checkout supports Paystack, Flutterwave and direct bank transfer (admin-toggleable), with a real road-distance delivery fee, producing a `NAS-ORD-######` tracking code
- Unified order/sell-request/repair tracking page with a live status timeline
- Customer account area: orders, sell requests, repairs, profile, change password
- Only Abuja FCT is enabled for pickup/delivery by default — every other state shows as "coming soon" until an admin turns it on

**Admin console** (`/admin`)
- Dashboard with revenue chart and key stats (orders, sell requests, repairs, low stock)
- Orders: search/filter, detail view, status + note updates
- Sell requests: search/filter, condition answers, revised-offer tool, status updates
- Repairs: search/filter, issue breakdown, final-cost + payment-received toggle, status updates
- Products: full CRUD (pricing, stock, grade — including brand-new, specs) with real photo uploads (drag-in, multiple images, cover photo)
- Catalog & Pricing: manage categories, brands, models, trade-in condition questions/deductions, and the repair-service price list
- Users: register new admins with an assigned privilege level, and role management (super admin only)
- Payments: transaction log + active-gateway summary
- Settings: payment gateway toggle & default, bank transfer details, **delivery pricing** (depot address/coordinates, base fare, per-km rate, minimum fare, max range), and **serviceable regions** (per-state enable/disable)

## Deploying a live preview (Vercel + Neon)

Vercel is the natural host for a Next.js app — it deploys straight from this GitHub repo and redeploys automatically on every push. It has no persistent disk, so the database lives on Neon (free Postgres) instead.

1. **Database** — at [neon.tech](https://neon.tech), sign in with GitHub → **New Project**. Copy the **pooled connection string** it gives you — that's your `DATABASE_URL`.
2. **Seed it** — locally, put that connection string in `.env` as `DATABASE_URL`, then run `npm run db:push && npm run db:seed`. This creates the schema and sample data directly on the live database (Neon accepts connections from anywhere, so this works from your machine).
3. **Deploy** — at [vercel.com](https://vercel.com), sign in with GitHub → **Add New… → Project** → import `Peemkay/nastech`. Framework preset auto-detects as Next.js — no build config needed. Before clicking Deploy, add these **Environment Variables**:
   - `DATABASE_URL` — the same Neon connection string from step 1
   - `AUTH_SECRET` — generate with `npx auth secret` (or `openssl rand -base64 32`)
   - `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` — your real admin login (created automatically on first visit to `/admin/login`)
   - Optionally `TERMII_API_KEY` / `TERMII_SENDER_ID` for real SMS delivery of registration OTP codes (otherwise codes are dev-mode/on-screen only — fine for testing, not for real users)
   - Optionally `PAYSTACK_SECRET_KEY` / `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` / `FLUTTERWAVE_SECRET_KEY` / `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` / `FLUTTERWAVE_WEBHOOK_SECRET_HASH` if you want real card payments to work — bank transfer works without them
   - Optionally `GOOGLE_MAPS_API_KEY` for real distance-based delivery pricing (falls back to a flat fee without it)
   - Optionally `BLOB_READ_WRITE_TOKEN` for admin product photo uploads (link a Blob store from the Storage tab and Vercel adds this automatically)
4. **Deploy.** Vercel gives you a `https://nastech-*.vercel.app` URL. Visit it, then log in at `/admin/login` with the `INITIAL_ADMIN_EMAIL`/`INITIAL_ADMIN_PASSWORD` you set.

That's it — no `vercel.json`, no custom build command. `prisma generate` runs automatically via the `postinstall` script. Every subsequent `git push` to `main` redeploys automatically.

**Tip:** Neon supports branching a dev database off your main one for local work, so you don't develop directly against the live data — see Neon's dashboard → **Branches**.

## Project structure

```
prisma/               schema + seed script
src/app/(site)/        public storefront pages (route group — has Header/Footer)
src/app/admin/          admin console (own auth-guarded shell, no public chrome)
src/app/api/            route handlers: sell-requests, orders, payments, admin CRUD
src/components/         ui/ (design system), layout/, home/, shop/, sell/, admin/
src/lib/                prisma client, auth config, quote engine, payment SDK wrappers, settings
```
