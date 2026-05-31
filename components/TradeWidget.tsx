"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useWallet } from "@/lib/wallet";
import { cents, kesto } from "@/lib/format";
import type { Market } from "@/lib/markets";
import { useButtonClass } from "@/components/PostHogProvider";

const QUICK = [25, 50, 100];
/** Pre-checked add-on quietly folded into the trade cost. */
const SHIELD_COST = 5;

export function TradeWidget({ market }: { market: Market }) {
  const { balance, hydrated, trade } = useWallet();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState(50);
  const [shield, setShield] = useState(true);
  const [status, setStatus] = useState<null | "ok" | "insufficient">(null);

  const price = side === "yes" ? market.yes : 100 - market.yes;
  const shares = price > 0 ? amount / (price / 100) : 0;
  const profit = shares - amount;
  const totalCost = amount + (shield ? SHIELD_COST : 0);

  // Derive per-render control classes for Yes/No (they depend on `side` state)
  const yesControlClass = clsx(
    "rounded-lg px-3 py-2 text-sm font-semibold",
    side === "yes" ? "bg-emerald-500 text-kesto-bg" : "bg-emerald-500/10 text-emerald-300",
  );
  const noControlClass = clsx(
    "rounded-lg px-3 py-2 text-sm font-semibold",
    side === "no" ? "bg-rose-500 text-kesto-bg" : "bg-rose-500/10 text-rose-300",
  );
  const placeTradeControlClass =
    "mt-4 w-full rounded-xl bg-kesto-lime py-3 font-bold text-kesto-bg hover:brightness-110";

  const yesBtnClass = useButtonClass(yesControlClass);
  const noBtnClass = useButtonClass(noControlClass);
  const placeTradeBtnClass = useButtonClass(placeTradeControlClass);

  function placeTrade() {
    setStatus(null);
    if (amount <= 0) return;
    setStatus(trade(totalCost) ? "ok" : "insufficient");
  }

  return (
    <div className="card p-5">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          data-attr="trade-yes"
          onClick={() => setSide("yes")}
          className={yesBtnClass}
        >
          Yes · {cents(market.yes)}
        </button>
        <button
          type="button"
          data-attr="trade-no"
          onClick={() => setSide("no")}
          className={noBtnClass}
        >
          No · {cents(100 - market.yes)}
        </button>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-300">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
        </span>
        {12 + (market.volume % 37)} people trading this right now
      </p>

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

      <label className="mt-4 flex items-start gap-3 rounded-lg border border-kesto-line bg-kesto-bg/40 p-3 text-sm">
        <input
          type="checkbox"
          data-attr="trade-shield"
          checked={shield}
          onChange={(e) => setShield(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-kesto-lime"
        />
        <span className="text-slate-300">
          Add <span className="font-semibold">KestoShield</span> (+{SHIELD_COST} $KESTO)
          <span className="block text-xs text-slate-500">Protects this trade if the vibes shift unexpectedly.</span>
        </span>
      </label>

      <button
        type="button"
        data-attr="place-trade"
        onClick={placeTrade}
        className={placeTradeBtnClass}
      >
        Place trade · {kesto(totalCost)}
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
