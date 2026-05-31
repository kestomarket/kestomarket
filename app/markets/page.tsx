"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { MarketCard } from "@/components/MarketCard";
import { MARKETS } from "@/lib/markets";

export default function MarketsPage() {
  const [isTest, setIsTest] = useState(false);

  useEffect(() => {
    setIsTest(posthog.getFeatureFlag("metrik-exp-07128fd2") === "test");
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">All markets</h1>
      <p className="mt-1 text-slate-400">Every one of these resolves in vibes. Trade responsibly. (Don&apos;t.)</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {MARKETS.map((m) => (
          <MarketCard key={m.id} market={m} isTest={isTest} />
        ))}
      </div>
    </div>
  );
}
