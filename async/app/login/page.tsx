"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DotField from "@/components/DotField";

/**
 * Login — centered glass terminal card on the dot field.
 * Uses NextAuth's credentials signIn with redirect disabled
 * so we can show terminal-style errors inline.
 */

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("authentication failed — check your credentials");
      setBusy(false);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-void px-4">
      <DotField />

      <div className="glass relative w-full max-w-md rounded-xl">
        {/* Terminal title bar */}
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-xs text-dim">auth.async — login</span>
        </div>

        <div className="space-y-5 px-6 py-8">
          <div>
            <label className="mb-1.5 block font-mono text-xs text-dim">
              &gt; email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="you@startup.in"
              className="glass w-full rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-accent/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs text-dim">
              &gt; password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="••••••••"
              className="glass w-full rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-accent/50"
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-red-400">
              &gt; error: {error}
            </p>
          )}

          <button
            onClick={submit}
            disabled={busy || !email || !password}
            className="w-full rounded-lg bg-gradient-to-r from-accent to-accent-2 py-3 font-mono text-sm font-semibold transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
          >
            {busy ? "authenticating..." : "authenticate →"}
          </button>

          <p className="text-center font-mono text-xs text-dim">
            no account?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              ./signup
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
