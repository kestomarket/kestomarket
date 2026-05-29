"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/wallet";

export default function SignupPage() {
  const router = useRouter();
  const { claimBonus } = useWallet();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    claimBonus();
    router.push("/markets");
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-slate-400">…and we&apos;ll spot you 1,000 $KESTO to lose with dignity.</p>

      <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
        <div>
          <label className="block text-xs text-slate-400" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="degenerate@example.com"
            className="mt-1 w-full rounded-lg border border-kesto-line bg-kesto-bg px-3 py-2 outline-none focus:border-kesto-lime"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="probably_right_69"
            className="mt-1 w-full rounded-lg border border-kesto-line bg-kesto-bg px-3 py-2 outline-none focus:border-kesto-lime"
          />
        </div>
        <button
          type="submit"
          data-attr="signup-submit"
          className="w-full rounded-xl bg-kesto-lime py-3 font-bold text-kesto-bg hover:brightness-110"
        >
          Create account &amp; claim 1,000 $KESTO
        </button>
        <p className="text-center text-xs text-slate-500">
          By signing up you agree to be wrong publicly. (It&apos;s a parody — no real account is created.)
        </p>
      </form>
    </div>
  );
}
