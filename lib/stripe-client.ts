import { loadStripe, type Stripe } from "@stripe/stripe-js";

/**
 * Browser-side Stripe.js singleton. Uses the publishable test key.
 * loadStripe is called once at module load so the script is shared across mounts.
 */
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!publishableKey) {
    return Promise.resolve(null);
  }
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
