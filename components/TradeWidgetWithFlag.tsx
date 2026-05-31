"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { TradeWidget } from "@/components/TradeWidget";
import type { Market } from "@/lib/markets";

declare global {
  interface Window {
    posthog?: {
      getFeatureFlag?: (key: string) => string | boolean | undefined;
      capture?: (event: string, props?: Record<string, unknown>) => void;
    };
  }
}

const FLAG_KEY = "metrik-exp-f347cc10";

export function TradeWidgetWithFlag({ market }: { market: Market }) {
  const [isTest, setIsTest] = useState(false);

  useEffect(() => {
    const check = () => {
      const flag =
        window.metrik?.getFlag?.(FLAG_KEY) ?? window.posthog?.getFeatureFlag?.(FLAG_KEY);
      setIsTest(flag === "test");
    };
    check();
    // Re-check once PostHog variants are loaded
    window.metrik?.onVariants?.(check);
    return posthog.onFeatureFlags(check);
  }, []);

  if (!isTest) {
    // Control: render the original TradeWidget unchanged
    return <TradeWidget market={market} />;
  }

  // Test variant: render TradeWidget with enhanced feedback wrapper
  return <TradeWidgetTest market={market} />;
}

function TradeWidgetTest({ market }: { market: Market }) {
  // We render the original TradeWidget but intercept its container to
  // overlay the enhanced button state via a wrapping div that captures
  // the click on the Place Trade button.
  //
  // Because TradeWidget owns its own button, we use a thin overlay approach:
  // we track tradeStatus here and pass it down via a custom wrapper that
  // intercepts the button click before it reaches TradeWidget's handler.

  const [tradeStatus, setTradeStatus] = useState<"idle" | "placing" | "placed">("idle");

  function handleWrapperClick(e: React.MouseEvent<HTMLDivElement>) {
    // Find if the click target is (or is inside) the Place Trade button
    const target = e.target as HTMLElement;
    const btn = target.closest<HTMLButtonElement>("button[data-attr='place-trade']");
    if (!btn || tradeStatus !== "idle") return;

    // Immediately show "placing" state
    setTradeStatus("placing");

    // Let the original click handler run (we don't stop propagation)
    // After a short tick, watch for the trade to resolve by waiting a
    // reasonable max time, then show "placed"
    // We use a MutationObserver on the button text to detect when the
    // original handler finishes, or fall back to a timeout.
    const observer = new MutationObserver(() => {
      // Once the original handler finishes, button re-enables with default label
      if (!btn.disabled && !btn.textContent?.includes("Placing trade")) {
        observer.disconnect();
        setTradeStatus("placed");
        setTimeout(() => setTradeStatus("idle"), 1500);
      }
    });
    observer.observe(btn, { childList: true, subtree: true, attributes: true });

    // Safety fallback: resolve after 4s regardless
    setTimeout(() => {
      observer.disconnect();
      setTradeStatus((s) => {
        if (s === "placing") {
          setTimeout(() => setTradeStatus("idle"), 1500);
          return "placed";
        }
        return s;
      });
    }, 4000);
  }

  return (
    <div className="relative" onClick={handleWrapperClick}>
      <TradeWidget market={market} />

      {/* Overlay the Place Trade button with our feedback state */}
      {tradeStatus !== "idle" && (
        <div
          className="pointer-events-none absolute inset-0 flex items-end"
          aria-hidden="true"
        >
          {/* Positioned to cover just the Place Trade button area at the bottom of the card */}
          <div className="w-full px-5 pb-5">
            <div
              className={`mt-4 flex w-full items-center justify-center rounded-xl py-3 font-bold text-kesto-bg ${
                tradeStatus === "placed"
                  ? "bg-kesto-lime"
                  : "cursor-not-allowed bg-kesto-lime/50 opacity-70"
              }`}
            >
              {tradeStatus === "placing" ? (
                <span className="flex items-center gap-2">
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
                <>Trade placed ✓</>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
