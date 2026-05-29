"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { getStripe } from "@/lib/stripe-client";
import { usd } from "@/lib/format";

const PRESETS = [10, 25, 100];
const stripePromise = getStripe();

/** Match the Payment Element to the KestoMarket dark theme. */
const appearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#c6f135",
    colorBackground: "#0b1020",
    colorText: "#e2e8f0",
    colorDanger: "#f87171",
    borderRadius: "8px",
    // The Element renders in an iframe, so CSS vars from the page aren't
    // available — use a concrete stack and load Inter via the `fonts` option.
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
};

/** Load Inter inside the Payment Element iframe so it matches the app font. */
const fonts = [
  { cssSrc: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" },
];

export default function DepositPage() {
  const [amount, setAmount] = useState(25);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startPayment(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = (await res.json()) as { clientSecret?: string; error?: string };
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error ?? "Could not start payment. Try again.");
      }
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Add funds</h1>
      <p className="mt-1 text-slate-400">
        Convert real-feeling dollars into $KESTO at a generous rate of 100 $KESTO per $1. Pay with Stripe in test mode —
        use card <span className="tabular-nums text-slate-300">4242 4242 4242 4242</span>, any future date, any CVC.
      </p>

      {!clientSecret ? (
        <form onSubmit={startPayment} className="card mt-6 space-y-5 p-6">
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(p)}
                className={clsx(
                  "rounded-lg border py-3 font-semibold",
                  amount === p ? "border-kesto-lime bg-kesto-lime/10 text-kesto-lime" : "border-kesto-line text-slate-300",
                )}
              >
                {usd(p)}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs text-slate-400" htmlFor="amount">
              Amount (USD)
            </label>
            <input
              id="amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-kesto-line bg-kesto-bg px-3 py-2 tabular-nums outline-none focus:border-kesto-lime"
            />
          </div>

          {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-kesto-lime py-3 font-bold text-kesto-bg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Preparing…" : `Continue to payment → ${(amount * 100).toLocaleString("en-US")} $KESTO`}
          </button>
        </form>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance, fonts }}>
          <PaymentForm amount={amount} onBack={() => setClientSecret(null)} />
        </Elements>
      )}
    </div>
  );
}

function PaymentForm({ amount, onBack }: { amount: number; onBack: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        // Used only if a redirect (e.g. 3DS) is required. The success page
        // re-verifies the PaymentIntent server-side before crediting.
        return_url: `${window.location.origin}/deposit/success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      router.push(`/deposit/success?payment_intent=${paymentIntent.id}`);
      return;
    }

    setError("Payment is processing. Check back shortly.");
    setSubmitting(false);
  }

  return (
    <form onSubmit={onSubmit} className="card mt-6 space-y-5 p-6">
      <PaymentElement />

      {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

      <button
        type="submit"
        data-attr="deposit-submit"
        disabled={!stripe || submitting}
        className="w-full rounded-xl bg-kesto-lime py-3 font-bold text-kesto-bg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Processing…" : `Pay ${usd(amount)}`}
      </button>

      <button
        type="button"
        onClick={onBack}
        disabled={submitting}
        className="w-full text-center text-sm text-slate-400 hover:text-slate-200 disabled:opacity-60"
      >
        ← Change amount
      </button>
    </form>
  );
}
