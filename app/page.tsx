"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { HeroCta } from "@/components/HeroCta";
import { MarketCard } from "@/components/MarketCard";
import { MARKETS } from "@/lib/markets";

export default function HomePage() {
  const featured = MARKETS.slice(0, 6);
  const isTest = posthog.getFeatureFlag("metrik-exp-eb8205f9") === "test";

  return (
    <div
      className={
        isTest
          ? "space-y-12 bg-gray-950 text-white min-h-screen p-6 rounded-xl"
          : "space-y-12"
      }
    >
      <HeroCta />

      <section>
        <div className="flex items-end justify-between">
          <h2
            className={
              isTest
                ? "text-xl font-bold text-white"
                : "text-xl font-bold"
            }
          >
            🔥 Trending markets
          </h2>
          <Link
            href="/markets"
            className={
              isTest
                ? "text-sm font-semibold text-white underline hover:text-gray-200"
                : "text-sm font-semibold text-kesto-lime hover:underline"
            }
          >
            View all →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {featured.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      </section>

      <section
        className={
          isTest
            ? "bg-gray-800 text-white p-6 text-sm rounded-xl"
            : "card p-6 text-sm text-slate-400"
        }
      >
        <h3
          className={
            isTest
              ? "font-semibold text-white"
              : "font-semibold text-slate-200"
          }
        >
          How it works
        </h3>
        <ol
          className={
            isTest
              ? "mt-2 list-decimal space-y-1 pl-5 text-gray-100"
              : "mt-2 list-decimal space-y-1 pl-5"
          }
        >
          <li>Claim your free $KESTO. (It is worth nothing. This is freeing.)</li>
          <li>Find a take you&apos;re irrationally confident about.</li>
          <li>Buy Yes or No. Watch the odds judge you in real time.</li>
        </ol>
      </section>
    </div>
  );
}
