"use client";

import { useEffect, useState } from "react";
import { TradeWidgetWithFlag } from "@/components/TradeWidgetWithFlag";
import { TradeWidgetTest2252 } from "@/components/TradeWidgetTest2252";
import type { Market } from "@/lib/markets";

const FLAG_KEY = "metrik-exp-2252c7d1";

declare global {
  interface Window {
    posthog?: {
      getFeatureFlag?: (key: string) => string | undefined;
      onFeatureFlags?: (cb: () => void) => void;
    };
    metrik?: {
      getFlag?: (key: string) => string | undefined;
      onVariants?: (cb: () => void) => void;
    };
  }
}

export function TradeWidgetExp2252({ market }: { market: Market }) {
  const [isTest, setIsTest] = useState(false);

  useEffect(() => {
    const check = () => {
      const flag =
        window.metrik?.getFlag?.(FLAG_KEY) ?? window.posthog?.getFeatureFlag?.(FLAG_KEY);
      setIsTest(flag === "test");
    };
    check();
    window.metrik?.onVariants?.(check);
    window.posthog?.onFeatureFlags?.(check);
  }, []);

  if (isTest) {
    return <TradeWidgetTest2252 market={market} />;
  }
  // Control: render the existing TradeWidgetWithFlag unchanged
  return <TradeWidgetWithFlag market={market} />;
}
