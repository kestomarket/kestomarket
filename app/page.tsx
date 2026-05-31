"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";
import Link from "next/link";
import { HeroCta } from "@/components/HeroCta";
import { MarketCard } from "@/components/MarketCard";
import { MARKETS } from "@/lib/markets";

export default function HomePage() {
  const featured = MARKETS.slice(0, 6);
  const [variant, setVariant] = useState<string | boolean | undefined>(undefined);

  useEffect(() => {
    const flag = posthog.getFeatureFlag("metrik-exp-c668501e");
    setVariant(flag);
  }, []);

  const isTest = variant === "test";

  return (
    <div className={`space-y-12${isTest ? " bg-pink-200" : ""}`}>
      <HeroCta />

      <section>
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">🔥 Trending markets</h2>
          <Link href="/markets" className="text-sm font-semibold text-kesto-lime hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {featured.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      </section>

      <section className="card p-6 text-sm text-slate-400">
        <h3 className="font-semibold text-slate-200">How it works</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Claim your free $KESTO. (It is worth nothing. This is freeing.)</li>
          <li>Find a take you&apos;re irrationally confident about.</li>
          <li>Buy Yes or No. Watch the odds judge you in real time.</li>
        </ol>
      </section>
    </div>
  );
}
