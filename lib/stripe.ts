import "server-only";
import Stripe from "stripe";

/**
 * Server-side Stripe client. Reads the secret key from STRIPE_SECRET_KEY.
 * Test mode only for this parody app — never ship a live key here.
 */
const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set. Add it to .env.local and your Vercel project env.");
}

export const stripe = new Stripe(secretKey);

/** $KESTO play money minted per US dollar deposited. Mirrors lib/wallet.tsx. */
export const KESTO_PER_USD = 100;
