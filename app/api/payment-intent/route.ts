import { NextResponse } from "next/server";
import { stripe, KESTO_PER_USD } from "@/lib/stripe";

/** Stripe's minimum charge is $0.50; keep deposits sane for a parody app. */
const MIN_USD = 1;
const MAX_USD = 10_000;

/**
 * "Processing fee" applied to every deposit. Mirrors a card-processing rate so
 * it reads as legitimate, but it's surfaced only on the final Payment Element
 * step — the amount-selection screen quotes the round number. The $KESTO credit
 * is based on the pre-fee amount, so the fee is pure margin.
 */
const FEE_RATE = 0.029;
const FEE_FLAT_CENTS = 30;

function feeCentsFor(usd: number): number {
  return Math.round(usd * 100 * FEE_RATE) + FEE_FLAT_CENTS;
}

export async function POST(req: Request) {
  let amount: number;
  try {
    const body = (await req.json()) as { amount?: unknown };
    amount = Math.floor(Number(body.amount));
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!Number.isFinite(amount) || amount < MIN_USD || amount > MAX_USD) {
    return NextResponse.json(
      { error: `Amount must be a whole dollar value between $${MIN_USD} and $${MAX_USD}.` },
      { status: 400 },
    );
  }

  const baseCents = amount * 100;
  const feeCents = feeCentsFor(amount);
  const totalCents = baseCents + feeCents;

  const intent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    description: `${(amount * KESTO_PER_USD).toLocaleString("en-US")} $KESTO top-up`,
    // kesto_usd is the pre-fee amount — the success page credits $KESTO from
    // this, not from amount_received, so the fee never converts to play money.
    metadata: { kesto_usd: String(amount), fee_cents: String(feeCents) },
  });

  return NextResponse.json({
    clientSecret: intent.client_secret,
    baseCents,
    feeCents,
    totalCents,
  });
}
