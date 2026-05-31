"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { getStripe } from "@/lib/stripe-client";
import { usd, usdFromCents } from "@/lib/format";

const PRESETS = [10, 25, 100];
/** Anchored default: pre-select the largest preset and badge it "Most popular". */
const DEFAULT_AMOUNT = 100;
const POPULAR_AMOUNT = 100;
const stripePromise = getStripe();

interface IntentResult {
  clientSecret: string;
  baseCents: number;
  feeCents: number;
  totalCents: number;
}

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
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [autoReload, setAutoReload] = useState(true);
  const [intent, setIntent] = useState<IntentResult | null>(null);
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
      const data = (await res.json()) as Partial<IntentResult> & { error?: string };
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error ?? "Could not start payment. Try again.");
      }
      // Remember the auto-reload preference for the (future) recurring top-up.
      try {
        localStorage.setItem("kesto_auto_reload", JSON.stringify(autoReload));
      } catch {
        /* ignore */
      }
      const resolvedIntent: IntentResult = {
        clientSecret: data.clientSecret,
        baseCents: data.baseCents ?? amount * 100,
        feeCents: data.feeCents ?? 0,
        totalCents: data.totalCents ?? amount * 100,
      };
      setIntent(resolvedIntent);
      window.metrik?.track("checkout_started", {
        amount_usd: amount,
        base_cents: resolvedIntent.baseCents,
        fee_cents: resolvedIntent.feeCents,
        total_cents: resolvedIntent.totalCents,
      });
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

      {!intent ? (
        <form onSubmit={startPayment} className="card mt-6 space-y-5 p-6">
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                data-attr="deposit-preset"
                data-amount={p}
                data-event="deposit_preset_selected"
                data-ph-capture-attribute="deposit_preset_selected"
                onClick={() => setAmount(p)}
                className={clsx(
                  "relative rounded-lg border py-3 font-semibold",
                  amount === p ? "border-kesto-lime bg-kesto-lime/10 text-kesto-lime" : "border-kesto-line text-slate-300",
                )}
              >
                {usd(p)}
                {p === POPULAR_AMOUNT && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-kesto-lime px-2 py-0.5 text-[10px] font-bold text-kesto-bg">
                    Most popular
                  </span>
                )}
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

          <label className="flex items-start gap-3 rounded-lg border border-kesto-line bg-kesto-bg/40 p-3 text-sm">
            <input
              type="checkbox"
              data-attr="deposit-auto-reload"
              data-event="auto_reload_toggled"
              data-ph-capture-attribute="auto_reload_toggled"
              checked={autoReload}
              onChange={(e) => setAutoReload(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-kesto-lime"
            />
            <span className="text-slate-300">
              Keep me in the action — <span className="font-semibold">auto-reload {usd(amount)}</span> whenever my balance
              runs low.
              <span className="block text-xs text-slate-500">Cancel anytime in settings.</span>
            </span>
          </label>

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
        <Elements stripe={stripePromise} options={{ clientSecret: intent.clientSecret, appearance, fonts }}>
          <PaymentForm intent={intent} onBack={() => setIntent(null)} />
        </Elements>
      )}
    </div>
  );
}

function PaymentForm({ intent, onBack }: { intent: IntentResult; onBack: () => void }) {
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

      {/* Fee disclosed only here, on the final step — the amount screen quoted
          the round number. */}
      <dl className="space-y-1 rounded-lg border border-kesto-line bg-kesto-bg/40 p-3 text-sm">
        <div className="flex justify-between text-slate-400">
          <dt>Deposit</dt>
          <dd className="tabular-nums">{usdFromCents(intent.baseCents)}</dd>
        </div>
        <div className="flex justify-between text-slate-400">
          <dt>Processing fee</dt>
          <dd className="tabular-nums">{usdFromCents(intent.feeCents)}</dd>
        </div>
        <div className="flex justify-between border-t border-kesto-line pt-1 font-semibold text-slate-200">
          <dt>Total</dt>
          <dd className="tabular-nums">{usdFromCents(intent.totalCents)}</dd>
        </div>
      </dl>

      {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

      <button
        type="submit"
        data-attr="deposit-submit"
        disabled={!stripe || submitting}
        className="w-full rounded-xl bg-kesto-lime py-3 font-bold text-kesto-bg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Processing…" : `Pay ${usdFromCents(intent.totalCents)}`}
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
