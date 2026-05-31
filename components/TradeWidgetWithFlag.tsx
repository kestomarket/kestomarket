"use client";

import { useEffect, useRef, useState } from "react";
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
  const [showSuccess, setShowSuccess] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleWrapperClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (!target.closest("button[data-attr='place-trade']")) return;

    setShowSuccess(false);
    queueMicrotask(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const hasError = wrapper.querySelector("p.text-rose-300");
      if (!hasError) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    });
  }

  return (
    <div ref={wrapperRef} onClick={handleWrapperClick}>
      <TradeWidget market={market} />
      {showSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 shadow-lg shadow-emerald-500/10 animate-trade-success"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-kesto-bg">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-emerald-200">Trade placed</p>
            <p className="text-xs text-emerald-300/70">Your position is locked in.</p>
          </div>
        </div>
      )}
    </div>
  );
}
