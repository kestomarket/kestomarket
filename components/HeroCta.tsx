import Link from "next/link";

/**
 * EXPERIMENT SURFACE. This hero copy + CTA is what Metrik's loop A/B-tests once
 * tracking is installed. For now it renders the control variant statically; the
 * agent introduces variant routing when it ships the first experiment.
 */
const HERO = {
  headline: "Bet on literally anything.",
  sub: "Be wrong with confidence.",
  cta: "Claim 1,000 free $KESTO",
};

export function HeroCta() {
  return (
    <section className="card relative overflow-hidden p-8 sm:p-12">
      <p className="mb-4 inline-flex rounded-full border border-kesto-line bg-kesto-bg/60 px-3 py-1 text-xs text-slate-300">
        🔮 Prediction markets for opinions you already have
      </p>
      <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">{HERO.headline}</h1>
      <p className="mt-3 text-lg text-slate-300">{HERO.sub}</p>
      <Link
        href="/signup"
        data-attr="hero-cta"
        data-event="signup_started"
        data-ph-capture-attribute="signup_started"
        className="mt-7 inline-flex items-center rounded-xl bg-kesto-lime px-6 py-3 text-base font-bold text-kesto-bg hover:brightness-110"
      >
        {HERO.cta}
      </Link>
      <p className="mt-3 text-xs text-slate-500">No card. No cash. No idea what you&apos;re doing. Perfect.</p>
    </section>
  );
}
