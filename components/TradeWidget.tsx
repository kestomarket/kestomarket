"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";
import posthog from "posthog-js";
import { useWallet } from "@/lib/wallet";
import { cents, kesto } from "@/lib/format";
import type { Market } from "@/lib/markets";

const QUICK = [25, 50, 100];
/** Pre-checked add-on quietly folded into the trade cost. */
const SHIELD_COST = 5;

export function TradeWidget({ market }: { market: Market }) {
  const { balance, hydrated, trade } = useWallet();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState(50);
  const [shield, setShield] = useState(true);
  const [status, setStatus] = useState<null | "ok" | "insufficient">(null);

  const [isPlacing, setIsPlacing] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);

  const [expVariant, setExpVariant] = useState<string | boolean | null | undefined>(undefined);

  useEffect(() => {
    const flag = posthog.getFeatureFlag("metrik-exp-e172305a");
    setExpVariant(flag);
  }, []);

  const isTestVariant = expVariant === "test";

  const price = side === "yes" ? market.yes : 100 - market.yes;
  const shares = price > 0 ? amount / (price / 100) : 0;
  const profit = shares - amount;
  const totalCost = amount + (shield ? SHIELD_COST : 0);

  async function placeTrade() {
    setStatus(null);
    setTradeError(null);
    if (amount <= 0) return;

    if (isTestVariant) setIsPlacing(true);
    try {
      const success = trade(totalCost);
      if (success) {
        setStatus("ok");
        window.metrik?.track("bet_placed", {
          market_id: market.id,
          side,
          amount,
          shield,
          total_cost: totalCost,
        });
      } else {
        setStatus("insufficient");
        if (isTestVariant) {
          setTradeError("Not enough $KESTO to place this trade.");
        }
        window.metrik?.track("bet_rejected_insufficient_funds", {
          market_id: market.id,
          side,
          amount,
          total_cost: totalCost,
          balance,
        });
      }
    } catch {
      if (isTestVariant) {
        setTradeError("Something went wrong. Please try again.");
      }
    } finally {
      if (isTestVariant) setIsPlacing(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          data-attr="trade-yes"
          data-event="trade_side_selected"
          data-side="yes"
          data-ph-capture-attribute="trade_side_selected"
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
          data-event="trade_side_selected"
          data-side="no"
          data-ph-capture-attribute="trade_side_selected"
          onClick={() => setSide("no")}
          className={clsx(
            "rounded-lg px-3 py-2 text-sm font-semibold",
            side === "no" ? "bg-rose-500 text-kesto-bg" : "bg-rose-500/10 text-rose-300",
          )}
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

      {/* ── Place trade button ─────────────────────────────────────────────
          Control variant: plain button, no disabled state, no spinner.
          Test variant   : disabled while placing, spinner label, inline error.
      ──────────────────────────────────────────────────────────────────── */}
      {isTestVariant ? (
        <>
          <button
            type="button"
            data-attr="place-trade"
            onClick={placeTrade}
            disabled={isPlacing}
            className={clsx(
              "mt-4 w-full rounded-xl py-3 font-bold text-kesto-bg",
              isPlacing
                ? "cursor-not-allowed bg-kesto-lime/50 opacity-70"
                : "bg-kesto-lime hover:brightness-110",
            )}
          >
            {isPlacing ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Placing trade…
              </span>
            ) : (
              <>Place trade · {kesto(totalCost)}</>
            )}
          </button>

          {tradeError && (
            <p className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {tradeError}{" "}
              {status === "insufficient" && (
                <Link href="/deposit" className="underline">
                  Deposit more →
                </Link>
              )}
            </p>
          )}
        </>
      ) : (
        /* Control: original button, no disabled/spinner/error UI */
        <button
          type="button"
          data-attr="place-trade"
          onClick={placeTrade}
          className="mt-4 w-full rounded-xl bg-kesto-lime py-3 font-bold text-kesto-bg hover:brightness-110"
        >
          Place trade · {kesto(totalCost)}
        </button>
      )}

      <p className="mt-4 text-xs text-slate-500">Balance: {hydrated ? kesto(balance) : "—"}</p>
    </div>
  );
}
