# NASTECH Gadgets

**Smart Tech. Better Life.** — Nigeria's marketplace to sell/trade-in phones, laptops, tablets, smartwatches, audio and consoles for instant cash, or shop certified refurbished devices. Built as an original, upgraded take on the Cashify-style buy/sell/trade-in model, themed to the NASTECH brand (blue `#0078F0` / chrome silver, light theme) and wired for **Nigerian payment methods only** (Paystack, Flutterwave, direct bank transfer).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Prisma** ORM — SQLite for local dev (zero install), schema written to be Postgres-compatible for production (see below)
- **Auth.js (NextAuth v5)** — credentials login, JWT sessions, role-based access (`CUSTOMER` / `ADMIN` / `SUPERADMIN`)
- **Paystack** + **Flutterwave** + **manual bank transfer** — selectable/toggleable per admin settings, with webhook-verified payment confirmation
- **Zustand** — client-side cart
- **Recharts** — admin analytics

## Getting started

```bash
npm install
npm run db:push    # create the local SQLite database from prisma/schema.prisma
npm run db:seed     # load categories, brands, models, quote rules, sample products & users
npm run dev
```

Visit **http://localhost:3000**. Admin console is at **/admin/login**.

### Seeded logins

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@nastech.ng` | `Admin@12345` |
| Admin | `ops@nastech.ng` | `Ops@12345` |
| Customer | `chidinma@example.com` | `Customer@123` |

**Change these before deploying anywhere public.**

## Environment variables

Copy `.env.example` to `.env` and fill in real values for anything beyond local dev:

- `DATABASE_URL` — defaults to local SQLite (`file:./dev.db`). For production, see "Moving to PostgreSQL" below.
- `AUTH_SECRET` — session signing secret (`npx auth secret` to generate one).
- `PAYSTACK_SECRET_KEY` / `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — from your Paystack dashboard (test or live).
- `FLUTTERWAVE_SECRET_KEY` / `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` / `FLUTTERWAVE_WEBHOOK_SECRET_HASH` — from your Flutterwave dashboard. The webhook hash is a string **you** choose and set in both the Flutterwave dashboard and this env var.
- `NEXT_PUBLIC_SITE_URL` — your deployed URL, used to build payment callback/redirect URLs.

Payment gateways won't actually charge anything until you supply real Paystack/Flutterwave keys — with the placeholder test keys, initializing a payment will fail gracefully with an error message instead of silently succeeding.

### Wiring up webhooks

- Paystack dashboard → Settings → API Keys & Webhooks → Webhook URL: `https://yourdomain/api/payments/paystack/webhook`
- Flutterwave dashboard → Settings → Webhooks → URL: `https://yourdomain/api/payments/flutterwave/webhook`, Secret hash: same value as `FLUTTERWAVE_WEBHOOK_SECRET_HASH`

Webhooks are the source of truth for payment confirmation; the browser redirect back from checkout (`/checkout/callback`) also re-verifies immediately so the customer sees an up-to-date status without waiting on the webhook.

## What's included

**Storefront**
- Home, category → brand → model trade-in quote wizard with a live-updating instant price
- Pickup scheduling (address, date, time slot) and a generated `NAS-SEL-######` tracking code
- Refurbished shop with filters, product detail, reviews, cart, multi-step checkout
- Checkout supports Paystack, Flutterwave and direct bank transfer (admin-toggleable), each producing a `NAS-ORD-######` tracking code
- Unified order/sell-request tracking page with a live status timeline
- Customer account area: orders, sell requests, profile

**Admin console** (`/admin`)
- Dashboard with revenue chart and key stats
- Orders: search/filter, detail view, status + note updates
- Sell requests: search/filter, condition answers, revised-offer tool, status updates
- Products: full CRUD (pricing, stock, grade, specs, images)
- Catalog & Pricing: manage categories, brands, models and the condition questions/deductions that drive the trade-in quote engine
- Users: role management (super admin only)
- Payments: transaction log + active-gateway summary
- Settings: payment gateway toggle & default, bank transfer details, shipping threshold, site contact info

## Moving to PostgreSQL

The schema (`prisma/schema.prisma`) deliberately avoids SQLite-incompatible features (no native enums, no `Decimal`, no scalar arrays — money is stored as `Int` kobo, enums are plain `String`). To switch:

1. Change `datasource db { provider = "sqlite" ... }` to `provider = "postgresql"`.
2. Point `DATABASE_URL` at a real Postgres instance (e.g. Neon, Supabase, RDS).
3. `npx prisma db push` (or set up proper migrations with `prisma migrate`).

No application code changes required.

## Project structure

```
prisma/               schema + seed script
src/app/(site)/        public storefront pages (route group — has Header/Footer)
src/app/admin/          admin console (own auth-guarded shell, no public chrome)
src/app/api/            route handlers: sell-requests, orders, payments, admin CRUD
src/components/         ui/ (design system), layout/, home/, shop/, sell/, admin/
src/lib/                prisma client, auth config, quote engine, payment SDK wrappers, settings
```
