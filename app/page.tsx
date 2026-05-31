"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";
import Link from "next/link";
import { HeroCta } from "@/components/HeroCta";
import { MarketCard } from "@/components/MarketCard";
import { MARKETS } from "@/lib/markets";

export default function HomePage() {
  const featured = MARKETS.slice(0, 6);
  const [isPink, setIsPink] = useState(false);

  useEffect(() => {
    setIsPink(posthog.getFeatureFlag("metrik-exp-bbfe5731") === "test");
  }, []);

  return (
    <div className="space-y-12" style={{ backgroundColor: isPink ? "pink" : undefined }}>
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
