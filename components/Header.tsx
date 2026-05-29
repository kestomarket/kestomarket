"use client";

import Link from "next/link";
import { TrendingUp, Wallet } from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { kesto } from "@/lib/format";

export function Header() {
  const { balance, hydrated } = useWallet();

  return (
    <header className="sticky top-0 z-20 border-b border-kesto-line/60 bg-kesto-bg/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <TrendingUp className="h-5 w-5 text-kesto-lime" />
          <span className="text-lg">
            Kesto<span className="text-kesto-lime">Market</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link href="/markets" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-kesto-panel hover:text-white">
            Markets
          </Link>
          <div className="hidden items-center gap-2 rounded-lg border border-kesto-line bg-kesto-panel px-3 py-2 sm:flex">
            <Wallet className="h-4 w-4 text-kesto-lime" />
            <span className="tabular-nums">{hydrated ? kesto(balance) : "—"}</span>
          </div>
          <Link
            href="/deposit"
            className="rounded-lg bg-kesto-lime px-3 py-2 font-semibold text-kesto-bg hover:brightness-110"
          >
            Deposit
          </Link>
        </nav>
      </div>
    </header>
  );
}
