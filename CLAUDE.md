# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoSell Ghana — a Next.js car marketplace platform for Ghana's automotive market. Sellers submit listings through a multi-step form, pay optionally via Paystack (GHS), and admin staff approve/publish listings. Published listings auto-post to Facebook/Instagram via Meta Graph API.

The repo is a monorepo: `web/` is the production Next.js app. Legacy static files (`index.html`, `admin.html`, `styles.css`, `script.js`) in the root are kept for backward compatibility only.

## Commands

All commands should be run from the `web/` directory, or use the root-level wrapper scripts.

```bash
# From repo root (delegates to web/)
npm run dev         # Start dev server
npm run build       # Production build
npm run lint        # ESLint check

# From web/ directly
npm run dev
npm run build
npm run start
npm run lint

# Database seed scripts (run from web/, require .env.local)
npm run legacy-sample-seed
npm run legacy-sample-upload-photos
npm run legacy-sample-migrate
```

> **Note**: `web/AGENTS.md` warns that this uses Next.js 16 with breaking changes. Before writing routing or API code, check `web/node_modules/next/dist/docs/` for this version's conventions.

## Architecture

### Next.js App Router (`web/src/app/`)

All routing uses the App Router. Key pages:
- `/` — Home (hero + featured listings)
- `/sell` — 4-step sell wizard (`SellWizard` component)
- `/cars` — Paginated listing browse
- `/cars/[id]` — Listing detail with photo gallery
- `/admin` — Password-protected admin dashboard
- `/pay/callback` — Paystack redirect handler

### API Routes (`web/src/app/api/`)

| Route | Auth | Purpose |
|---|---|---|
| `POST /api/car-submissions` | Public | Submit listing + upload photos |
| `GET/POST /api/paystack/*` | Public | Payment initialize/verify/webhook |
| `POST /api/admin/login` | None | Issue JWT cookie |
| `GET /api/admin/submissions` | JWT cookie | List all submissions |
| `PATCH /api/admin/submissions/[id]` | JWT cookie | Update status/notes; triggers Meta post |

Admin routes verify the JWT cookie via `lib/admin-api-auth.ts`. The admin password comes from `ADMIN_PASSWORD` env var; sessions signed with `ADMIN_JWT_SECRET`.

### Database (Supabase / PostgreSQL)

Single table: `car_submissions`. Key fields:
- `status` — controls visibility: `new → contacted → completed → rejected/archived`
- `package_type` — `free | premium | complete`
- `photos` — JSONB array of Supabase Storage URLs
- `paystack_reference / paystack_payment_status` — payment state
- `meta_fb_post_id / meta_ig_media_id / meta_social_posted_at` — auto-post state

RLS: public SELECT is restricted to rows where `status` matches `NEXT_PUBLIC_LISTING_STATUSES` (defaults to `completed`). All writes use the service role key server-side.

Schema migrations live in `web/scripts/supabase-*.sql` — run them manually in the Supabase SQL editor in order.

### Key `lib/` Modules

- `supabase/` — Three client factories: browser (anon key), server (anon key + cookie), service (service role key — server only)
- `admin-session.ts` — JWT sign/verify using `jose`
- `listings.ts` — Paginated public listing queries
- `car-submission-insert.ts` — Validates and builds DB row from form data
- `paystack-*.ts` — Payment config, amount lookup, verification
- `notify-email.ts` — Resend email on new submission (gracefully no-ops without API key)
- `meta-social-auto-post.ts` — Facebook Page + Instagram auto-post triggered on `completed` status
- `whatsapp.ts` — `wa.me` URL builder for the WhatsApp float button

### Listing Status Flow

```
new → contacted → completed   (published publicly, auto-posts to Meta)
                → rejected
                → archived
```

Status changes are made by admin via `PATCH /api/admin/submissions/[id]`. Setting `completed` triggers Meta auto-post if `META_AUTO_POST_ENABLED=true`.

### Photo Upload Flow

Client uploads files directly to Supabase Storage bucket `car-photos` (path: `submissions/{uuid}_filename`). Public URLs are returned and stored in `car_submissions.photos` (JSONB array).

### SEO Article Pages

Dynamic SEO content pages (e.g., "Buy Toyota in Ghana") are generated from metadata in `lib/seo-guide-*.ts` files. They share a common article shell component under `components/seo/`.

## Environment Variables

Copy `web/.env.example` to `web/.env.local`. Required for local dev:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Required for form submission API

# Admin auth
ADMIN_PASSWORD=
ADMIN_JWT_SECRET=

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_LISTING_STATUSES=completed
NEXT_PUBLIC_WHATSAPP_E164=233XXXXXXXXX

# Optional features
NEXT_PUBLIC_PAYSTACK_ENABLED=false
PAYSTACK_SECRET_KEY=
RESEND_API_KEY=
NOTIFY_EMAIL_TO=
META_AUTO_POST_ENABLED=false
META_PAGE_ACCESS_TOKEN=
META_PAGE_ID=
META_IG_USER_ID=
```

## Deployment

See `web/docs/how-to-push.md`. Production URL: `https://autosellgh.com`. Deployed on Vercel (inferred from Next.js setup). Set all env vars in Vercel dashboard; `NEXT_PUBLIC_SITE_URL` must point to the production domain for SEO and Paystack callbacks to work correctly.

## Paystack Integration

Docs: `web/docs/paystack-setup.md`. Payment is optional and feature-flagged via `NEXT_PUBLIC_PAYSTACK_ENABLED`. Packages: Free (GHS 0), Premium (GHS 50), Complete (GHS 200). After payment, Paystack redirects to `/pay/callback?reference=...` which calls `/api/paystack/verify`.

## Meta Auto-Posting

Docs: `web/docs/meta-auto-post-setup.md`. Controlled by `META_AUTO_POST_ENABLED`. Posts are triggered server-side in `PATCH /api/admin/submissions/[id]` when status changes to `completed`. Results (post IDs or errors) are stored back on the row.
