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

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount * 100, // cents
          product_data: {
            name: `${(amount * KESTO_PER_USD).toLocaleString("en-US")} $KESTO top-up`,
            description: "Play-money credit for KestoMarket (parody — $KESTO is worth $0.00).",
          },
        },
      },
    ],
    metadata: { kesto_usd: String(amount) },
    success_url: `${origin}/deposit/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/deposit?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
