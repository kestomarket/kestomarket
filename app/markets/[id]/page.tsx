'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarket } from "@/lib/markets";
import { cents, volume } from "@/lib/format";
import { TradeWidget } from "@/components/TradeWidget";

export default function MarketPage({ params }: { params: { id: string } }) {
  const market = getMarket(params.id);
  if (!market) notFound();
  const no = 100 - market.yes;

  const [flagVariant, setFlagVariant] = useState<string | boolean | null | undefined>(undefined);

  useEffect(() => {
    const variant =
      typeof window !== "undefined" && window.posthog?.getFeatureFlag
        ? window.posthog.getFeatureFlag("metrik-exp-a757edc1")
        : undefined;
    setFlagVariant(variant ?? null);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <Link href="/markets" className="text-sm text-slate-400 hover:underline">
          ← All markets
        </Link>

        <div className="mt-3 flex items-start gap-3">
          <span className="text-4xl">{market.emoji}</span>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">{market.category}</p>
            <h1 className="text-2xl font-bold leading-snug">{market.question}</h1>
          </div>
        </div>

        <div className="card mt-5 p-5">
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold text-emerald-300">{cents(market.yes)}</p>
              <p className="text-xs text-slate-400">Yes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-rose-300">{cents(no)}</p>
              <p className="text-xs text-slate-400">No</p>
            </div>
          </div>
          <p className="mt-4 text-slate-300">{market.description}</p>
          <p className="mt-3 text-xs text-slate-500">
            {volume(market.volume)} volume · closes {market.closes}
          </p>
        </div>
      </div>

      <aside>
        <TradeWidget market={market} experimentVariant={flagVariant === "test" ? "test" : "control"} />
      </aside>
    </div>
  );
}
