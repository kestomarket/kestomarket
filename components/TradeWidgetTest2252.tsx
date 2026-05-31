"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useWallet } from "@/lib/wallet";
import { kesto } from "@/lib/format";
import type { Market } from "@/lib/markets";

const PRESETS = [25, 50, 100, 250];

export function TradeWidgetTest2252({ market }: { market: Market }) {
  const { balance, hydrated, trade } = useWallet();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState(50);
  const [shield, setShield] = useState(true);
  const [status, setStatus] = useState<null | "ok" | "insufficient">(null);

  const [isPlacing, setIsPlacing] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const fee = shield ? Math.ceil(amount * 0.05) : 0;
  const totalCost = amount + fee;

  async function placeTrade() {
    setStatus(null);
    setTradeError(null);
    if (amount <= 0) return;

    setIsPlacing(true);
    try {
      const success = trade(totalCost);
      if (success) {
        setStatus("ok");
      } else {
        setStatus("insufficient");
        // Test variant: surface inline error and disable button for 1.5s to prevent rage-clicks
        setTradeError("Insufficient funds — Deposit to continue");
        setButtonDisabled(true);
        setTimeout(() => {
          setButtonDisabled(false);
        }, 1500);
      }
    } catch {
      setTradeError("Something went wrong. Please try again.");
      setButtonDisabled(true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 1500);
    } finally {
      setIsPlacing(false);
    }
  }

  return (
    <div className="card p-5">
      {/* Side selector */}
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
            side === "yes"
              ? "bg-emerald-500 text-kesto-bg"
              : "bg-emerald-500/10 text-emerald-300",
          )}
        >
          Yes · {market.yes}¢
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
            side === "no"
              ? "bg-rose-500 text-kesto-bg"
              : "bg-rose-500/10 text-rose-300",
          )}
        >
          No · {100 - market.yes}¢
        </button>
      </div>

      {/* Amount presets */}
      <div className="mt-4 grid grid-cols-4 gap-1">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setAmount(p);
              setTradeError(null);
            }}
            className={clsx(
              "rounded-md py-1.5 text-xs font-semibold",
              amount === p
                ? "bg-kesto-lime text-kesto-bg"
                : "bg-kesto-line/30 text-slate-300 hover:bg-kesto-line/60",
            )}
          >
            {kesto(p)}
          </button>
        ))}
      </div>

      {/* Custom amount input */}
      <div className="mt-3">
        <label className="block text-xs text-slate-400" htmlFor="trade-amount-2252">
          Amount ($KESTO)
        </label>
        <input
          id="trade-amount-2252"
          type="number"
          min={1}
          value={amount}
          onChange={(e) => {
            setAmount(Number(e.target.value));
            setTradeError(null);
          }}
          className="mt-1 w-full rounded-lg border border-kesto-line bg-kesto-bg px-3 py-2 tabular-nums outline-none focus:border-kesto-lime"
        />
      </div>

      {/* Shield toggle */}
      <label className="mt-3 flex items-start gap-2 text-xs text-slate-400">
        <input
          type="checkbox"
          checked={shield}
          onChange={(e) => setShield(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 accent-kesto-lime"
        />
        <span>Shield (5% fee · {kesto(fee)}) — protects against sudden price moves</span>
      </label>

      {/* Cost summary */}
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>Total cost</span>
        <span className="font-semibold text-slate-200">{kesto(totalCost)}</span>
      </div>

      {/* Balance */}
      <p className="mt-1 text-right text-xs text-slate-500">
        Balance: {hydrated ? kesto(balance) : "—"}
      </p>

      {/* Place trade button */}
      <button
        type="button"
        data-attr="place-trade"
        data-event="bet_placed"
        data-ph-capture-attribute="bet_placed"
        disabled={isPlacing || buttonDisabled}
        onClick={placeTrade}
        className={clsx(
          "mt-4 w-full rounded-xl py-3 font-bold text-kesto-bg transition-opacity",
          isPlacing || buttonDisabled
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
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Placing…
          </span>
        ) : buttonDisabled ? (
          "Try again shortly…"
        ) : (
          <>Place trade · {kesto(totalCost)}</>
        )}
      </button>

      {/* Test variant: inline insufficient-funds error with deposit link */}
      {tradeError && (
        <p className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {status === "insufficient" ? (
            <>
              Insufficient funds —{" "}
              <Link href="/deposit" className="underline hover:text-rose-200">
                Deposit to continue
              </Link>
            </>
          ) : (
            tradeError
          )}
        </p>
      )}

      {/* Success confirmation */}
      {status === "ok" && !tradeError && (
        <p className="mt-2 text-center text-sm text-emerald-400">Trade placed!</p>
      )}
    </div>
  );
}
