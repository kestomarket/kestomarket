"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { usd } from "@/lib/format";

const PRESETS = [10, 25, 100];

export default function DepositPage() {
  return (
    <Suspense>
      <DepositForm />
    </Suspense>
  );
}

function DepositForm() {
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";
  const [amount, setAmount] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout. Try again.");
      }
      // Hand off to Stripe's hosted checkout page.
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Add funds</h1>
      <p className="mt-1 text-slate-400">
        Convert real-feeling dollars into $KESTO at a generous rate of 100 $KESTO per $1. Checkout runs in Stripe test
        mode — use card <span className="tabular-nums text-slate-300">4242 4242 4242 4242</span>, any future date, any CVC.
      </p>

      {canceled && (
        <p className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
          Checkout canceled — no charge was made. Pick an amount to try again.
        </p>
      )}

      <form onSubmit={onSubmit} className="card mt-6 space-y-5 p-6">
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

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>
        )}

        <button
          type="submit"
          data-attr="deposit-submit"
          disabled={loading}
          className="w-full rounded-xl bg-kesto-lime py-3 font-bold text-kesto-bg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Redirecting to Stripe…"
            : `Deposit ${usd(amount)} → ${(amount * 100).toLocaleString("en-US")} $KESTO`}
        </button>
      </form>
    </div>
  );
}
