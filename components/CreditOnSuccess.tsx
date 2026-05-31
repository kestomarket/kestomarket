"use client";

import { useEffect, useRef } from "react";
import { useWallet } from "@/lib/wallet";

const CREDITED_KEY = "kesto_credited_sessions_v1";

/**
 * Credits the local $KESTO play balance once per verified Stripe session.
 * The actual charge already happened on Stripe; this just mints the play money.
 * Idempotent across refreshes via a localStorage set of credited session ids.
 */
export function CreditOnSuccess({ sessionId, usdAmount }: { sessionId: string; usdAmount: number }) {
  const { deposit, hydrated } = useWallet();
  const done = useRef(false);

  useEffect(() => {
    if (!hydrated || done.current) return;

    let credited: string[] = [];
    try {
      credited = JSON.parse(localStorage.getItem(CREDITED_KEY) ?? "[]") as string[];
    } catch {
      credited = [];
    }
    if (credited.includes(sessionId)) {
      done.current = true;
      return;
    }

    deposit(usdAmount);
    window.metrik?.track("purchase", {
      session_id: sessionId,
      usd_amount: usdAmount,
      kesto_credited: usdAmount * 100,
    });
    done.current = true;
    try {
      localStorage.setItem(CREDITED_KEY, JSON.stringify([...credited, sessionId]));
    } catch {
      /* ignore */
    }
  }, [hydrated, sessionId, usdAmount, deposit]);

  return null;
}
