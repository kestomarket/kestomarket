import { NextResponse } from "next/server";
import { stripe, KESTO_PER_USD } from "@/lib/stripe";

/** Stripe's minimum charge is $0.50; keep deposits sane for a parody app. */
const MIN_USD = 1;
const MAX_USD = 10_000;

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

  const intent = await stripe.paymentIntents.create({
    amount: amount * 100, // cents
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    description: `${(amount * KESTO_PER_USD).toLocaleString("en-US")} $KESTO top-up`,
    metadata: { kesto_usd: String(amount) },
  });

  return NextResponse.json({ clientSecret: intent.client_secret });
}
