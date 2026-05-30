import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { usd } from "@/lib/format";
import { CreditOnSuccess } from "@/components/CreditOnSuccess";

export default async function DepositSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string }>;
}) {
  const { payment_intent } = await searchParams;

  let paidUsd = 0;
  let verified = false;
  if (payment_intent) {
    try {
      const intent = await stripe.paymentIntents.retrieve(payment_intent);
      if (intent.status === "succeeded") {
        verified = true;
        // Credit the pre-fee amount only — kesto_usd is the round number the
        // user picked; the processing fee they were also charged is not minted.
        const baseUsd = Number(intent.metadata?.kesto_usd);
        paidUsd = Number.isFinite(baseUsd) ? baseUsd : (intent.amount_received ?? intent.amount ?? 0) / 100;
      }
    } catch {
      verified = false;
    }
  }

  if (!verified) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="card p-8">
          <div className="text-5xl">🤔</div>
          <h1 className="mt-4 text-2xl font-bold">Payment not confirmed</h1>
          <p className="mt-2 text-slate-300">
            We couldn&apos;t verify this checkout session. If you were charged in test mode (you weren&apos;t — it&apos;s
            test mode), nothing happened.
          </p>
          <Link
            href="/deposit"
            className="mt-6 inline-flex rounded-xl bg-kesto-lime px-6 py-3 font-bold text-kesto-bg hover:brightness-110"
          >
            Back to deposit
          </Link>
        </div>
      </div>
    );
  }

  const kestoAmount = (paidUsd * 100).toLocaleString("en-US");

  return (
    <div className="mx-auto max-w-md text-center">
      <CreditOnSuccess sessionId={payment_intent!} usdAmount={paidUsd} />
      <div className="card p-8">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-4 text-2xl font-bold">Deposit complete</h1>
        <p className="mt-2 text-slate-300">
          {usd(paidUsd)} became <span className="font-semibold text-kesto-lime">{kestoAmount} $KESTO</span>. Economists
          hate this one trick.
        </p>
        <Link
          href="/markets"
          className="mt-6 inline-flex rounded-xl bg-kesto-lime px-6 py-3 font-bold text-kesto-bg hover:brightness-110"
        >
          Go lose it all →
        </Link>
        <p className="mt-3 text-xs text-slate-500">Charged in Stripe test mode only. This is a parody. You are fine.</p>
      </div>
    </div>
  );
}
