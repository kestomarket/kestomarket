import Link from "next/link";
import type { Market } from "@/lib/markets";
import { cents, volume } from "@/lib/format";

export function MarketCard({ market }: { market: Market }) {
  const no = 100 - market.yes;
  return (
    <Link
      href={`/markets/${market.id}`}
      data-attr="market-card"
      data-market={market.id}
      className="card block p-5 transition hover:border-kesto-lime/40"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{market.emoji}</span>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-slate-400">{market.category}</p>
          <h3 className="mt-1 font-semibold leading-snug">{market.question}</h3>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold">
        <span className="rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-emerald-300">Yes · {cents(market.yes)}</span>
        <span className="rounded-lg bg-rose-500/10 px-3 py-2 text-center text-rose-300">No · {cents(no)}</span>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {volume(market.volume)} volume · closes {market.closes}
      </p>
    </Link>
  );
}
