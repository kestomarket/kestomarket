# KestoMarket

A parody prediction market — *"Bet on literally anything. Be wrong with confidence."*
It's the demo app that **Metrik** optimizes.

> Parody only. No real money, no real betting. `$KESTO` is play money worth $0.00.

## Deliberately clean (no analytics)

This app ships with **zero analytics code** — no PostHog, no tracking SDK, no
custom events. That's on purpose: Metrik's whole pitch is that it *installs*
tracking for you (autocapture) and brings revenue in via connectors, so the
product app stays clean. Tracking gets added later by the Metrik install step
(a `@metrik/sdk` snippet), not hand-written here.

To stay autocapture-ready without writing analytics code, the key funnel actions
carry stable `data-attr` hooks:

| `data-attr` | Where | Funnel step |
|---|---|---|
| `hero-cta` | landing hero | top of funnel (the A/B-tested surface) |
| `market-card` | market cards | browse |
| `trade-yes` / `trade-no` / `place-trade` | market detail | engagement |
| `signup-submit` | /signup | signup (claims 1,000 $KESTO) |
| `deposit-submit` | /deposit | conversion (revenue comes via Stripe connector) |

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## The funnel

`/` (hero) → `/signup` (claim bonus) → `/markets` → `/markets/[id]` (trade Yes/No) → `/deposit`

State (the play `$KESTO` balance) lives client-side in `lib/wallet.tsx`
(localStorage). Markets are static data in `lib/markets.ts`.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS. Deploys to Vercel.
