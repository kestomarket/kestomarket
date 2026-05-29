"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useWallet } from "@/lib/wallet";
import { cents, kesto } from "@/lib/format";
import type { Market } from "@/lib/markets";

const QUICK = [25, 50, 100];

export function TradeWidget({ market }: { market: Market }) {
  const { balance, hydrated, trade } = useWallet();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState(50);
  const [status, setStatus] = useState<null | "ok" | "insufficient">(null);

  const price = side === "yes" ? market.yes : 100 - market.yes;
  const shares = price > 0 ? amount / (price / 100) : 0;
  const profit = shares - amount;

  function placeTrade() {
    setStatus(null);
    if (amount <= 0) return;
    setStatus(trade(amount) ? "ok" : "insufficient");
  }

  return (
    <div className="card p-5">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          data-attr="trade-yes"
          onClick={() => setSide("yes")}
          className={clsx(
            "rounded-lg px-3 py-2 text-sm font-semibold",
            side === "yes" ? "bg-emerald-500 text-kesto-bg" : "bg-emerald-500/10 text-emerald-300",
          )}
        >
          Yes · {cents(market.yes)}
        </button>
        <button
          type="button"
          data-attr="trade-no"
          onClick={() => setSide("no")}
          className={clsx(
            "rounded-lg px-3 py-2 text-sm font-semibold",
            side === "no" ? "bg-rose-500 text-kesto-bg" : "bg-rose-500/10 text-rose-300",
          )}
        >
          No · {cents(100 - market.yes)}
        </button>
      </div>

      <label className="mt-4 block text-xs text-slate-400">Amount ($KESTO)</label>
      <input
        type="number"
        min={0}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-kesto-line bg-kesto-bg px-3 py-2 tabular-nums outline-none focus:border-kesto-lime"
      />
      <div className="mt-2 flex gap-2">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setAmount(q)}
            className="rounded-md border border-kesto-line px-2 py-1 text-xs text-slate-300 hover:border-kesto-lime"
          >
            {q}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setAmount(Math.floor(balance))}
          className="rounded-md border border-kesto-line px-2 py-1 text-xs text-slate-300 hover:border-kesto-lime"
        >
          Max
        </button>
      </div>

      <p className="mt-3 text-sm text-slate-300">
        ≈ <span className="font-semibold text-white">{shares.toFixed(1)} shares</span> · pays{" "}
        <span className="font-semibold text-kesto-lime">{kesto(shares)}</span> if {side.toUpperCase()} hits
        <span className="block text-xs text-slate-500">
          (potential profit {kesto(profit)} — or a valuable life lesson)
        </span>
      </p>

      <button
        type="button"
        data-attr="place-trade"
        onClick={placeTrade}
        className="mt-4 w-full rounded-xl bg-kesto-lime py-3 font-bold text-kesto-bg hover:brightness-110"
      >
        Place trade
      </button>

      {status === "ok" && (
        <p className="mt-3 text-sm text-emerald-300">Trade placed. Bold. Statistically unwise. We respect it.</p>
      )}
      {status === "insufficient" && (
        <p className="mt-3 text-sm text-rose-300">
          Not enough $KESTO.{" "}
          <Link href="/deposit" className="underline">
            Deposit more →
          </Link>
        </p>
      )}

      <p className="mt-4 text-xs text-slate-500">Balance: {hydrated ? kesto(balance) : "—"}</p>
    </div>
  );
}
