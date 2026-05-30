import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "KestoMarket — Bet on literally anything",
  description: "The prediction market for opinions you already have. (Parody. Play money only.)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <script src="https://metrik-api-107100051278.europe-west1.run.app/sdk.js" data-token="5d0b236d-0f87-4943-a1a2-be8f08f57e0a" data-metrik-sdk async></script>
        <WalletProvider>
          <Header />
          <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-8">{children}</main>
          <footer className="border-t border-kesto-line/60 py-6 text-center text-xs text-slate-500">
            KestoMarket is a parody. No real money, no real betting, no real anything. $KESTO is worth exactly $0.00.
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
