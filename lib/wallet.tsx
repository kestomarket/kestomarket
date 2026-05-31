"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Client-side fake wallet ($KESTO play money), persisted to localStorage.
 * No real money anywhere — deposits just top up the play balance and fire the
 * revenue event used as Metrik's lagging metric.
 */

const STORAGE_KEY = "kesto_wallet_v1";
const KESTO_PER_USD = 100;

interface WalletState {
  balance: number;
  claimed: boolean;
}

interface WalletContextValue extends WalletState {
  hydrated: boolean;
  claimBonus: () => void;
  /** Spend $KESTO on a trade. Returns false if the balance is too low. */
  trade: (cost: number) => boolean;
  /** Convert a USD deposit into $KESTO play balance. */
  deposit: (usdAmount: number) => void;
  reset: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({ balance: 0, claimed: false });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as WalletState);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const claimBonus = useCallback(() => {
    setState((s) => {
      if (s.claimed) return s;
      window.metrik?.track("activation", { bonus_kesto: 1000 });
      return { balance: s.balance + 1000, claimed: true };
    });
  }, []);

  const trade = useCallback(
    (cost: number) => {
      if (state.balance < cost) return false;
      setState((s) => ({ ...s, balance: Math.max(0, s.balance - cost) }));
      return true;
    },
    [state.balance],
  );

  const deposit = useCallback((usdAmount: number) => {
    setState((s) => ({ ...s, balance: s.balance + usdAmount * KESTO_PER_USD }));
  }, []);

  const reset = useCallback(() => setState({ balance: 0, claimed: false }), []);

  return (
    <WalletContext.Provider value={{ ...state, hydrated, claimBonus, trade, deposit, reset }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within <WalletProvider>");
  return ctx;
}
