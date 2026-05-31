import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarket } from "@/lib/markets";
import { cents, volume } from "@/lib/format";
import { TradeWidgetWithFlag } from "@/components/TradeWidgetWithFlag";

export default async function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const market = getMarket(id);
  if (!market) notFound();
  const no = 100 - market.yes;

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
        {/* TradeWidgetWithFlag renders the original TradeWidget (control) or the
            enhanced feedback variant (test) based on PostHog flag metrik-exp-f347cc10 */}
        <TradeWidgetWithFlag market={market} />
      </aside>
    </div>
  );
}
