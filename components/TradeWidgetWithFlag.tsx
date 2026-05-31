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
        <p className="mt-2 text-sm text-emerald-300">Trade placed ✓</p>
      )}
    </div>
  );
}
