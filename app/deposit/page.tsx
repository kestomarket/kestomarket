"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useWallet } from "@/lib/wallet";
import { usd } from "@/lib/format";

const PRESETS = [10, 25, 100];

export default function DepositPage() {
  const router = useRouter();
  const { deposit } = useWallet();
  const [amount, setAmount] = useState(25);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // NOTE: real revenue (the lagging metric) will come from the Stripe connector,
    // not from app code (PLAN.md §7). This only tops up the play balance.
    deposit(amount);
    router.push(`/deposit/success?amount=${amount}`);
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Add funds</h1>
      <p className="mt-1 text-slate-400">
        Convert real-feeling dollars into $KESTO at a generous rate of 100 $KESTO per $1. (Test mode — no charge.)
      </p>

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

        <div className="rounded-lg border border-kesto-line bg-kesto-bg/60 p-3 text-sm">
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Card details (test mode)</p>
          <input
            disabled
            value="4242 4242 4242 4242"
            className="w-full rounded-md border border-kesto-line bg-kesto-bg px-3 py-2 tabular-nums text-slate-400"
          />
          <div className="mt-2 flex gap-2">
            <input disabled value="12 / 34" className="w-1/2 rounded-md border border-kesto-line bg-kesto-bg px-3 py-2 text-slate-400" />
            <input disabled value="424" className="w-1/2 rounded-md border border-kesto-line bg-kesto-bg px-3 py-2 text-slate-400" />
          </div>
        </div>

        <button
          type="submit"
          data-attr="deposit-submit"
          className="w-full rounded-xl bg-kesto-lime py-3 font-bold text-kesto-bg hover:brightness-110"
        >
          Deposit {usd(amount)} → {(amount * 100).toLocaleString("en-US")} $KESTO
        </button>
      </form>
    </div>
  );
}
