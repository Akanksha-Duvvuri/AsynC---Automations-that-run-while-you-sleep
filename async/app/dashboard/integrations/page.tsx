"use client";

import { useEffect, useState } from "react";
import { INTEGRATIONS, type Platform } from "@/lib/integrations";

/**
 * Integrations page
 * - fetches which platforms are connected (GET /api/credentials)
 * - "connect" opens an inline panel to paste the API key
 * - keys are sent once, encrypted server-side, never displayed again
 */

type ConnectedRow = { platform: Platform; label: string | null };

export default function IntegrationsPage() {
  const [connected, setConnected] = useState<Platform[]>([]);
  const [open, setOpen] = useState<Platform | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/credentials");
    if (res.ok) {
      const data: { connected: ConnectedRow[] } = await res.json();
      setConnected(data.connected.map((c) => c.platform));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (platform: Platform) => {
    if (busy || !apiKey.trim()) return;
    setBusy(true);
    setError("");

    const res = await fetch("/api/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, apiKey: apiKey.trim() }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "failed to save key");
      setBusy(false);
      return;
    }

    setApiKey("");
    setOpen(null);
    setBusy(false);
    load();
  };

  const disconnect = async (platform: Platform) => {
    await fetch("/api/credentials", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
    });
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-sm text-accent">$ ls ./integrations</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">integrations</h1>
        <p className="mt-2 font-mono text-xs text-dim">
          BYOK — your keys are AES-256 encrypted before they touch the database
        </p>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-dim">loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {INTEGRATIONS.map((intg) => {
            const isConnected = connected.includes(intg.id);
            const isOpen = open === intg.id;

            return (
              <div key={intg.id} className="glass rounded-xl">
                <div className="flex items-start justify-between px-5 py-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{intg.name}</h2>
                      <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-dim">
                        {intg.category}
                      </span>
                    </div>
                    <p className="mt-1.5 font-mono text-xs text-dim">
                      {intg.description}
                    </p>
                    <p
                      className={`mt-3 font-mono text-xs ${
                        isConnected ? "text-terminal-green" : "text-white/30"
                      }`}
                    >
                      [ {isConnected ? "connected" : "not connected"} ]
                    </p>
                  </div>

                  {isConnected ? (
                    <button
                      onClick={() => disconnect(intg.id)}
                      className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-white/50 transition-colors hover:border-red-400/40 hover:text-red-400"
                    >
                      disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setOpen(isOpen ? null : intg.id);
                        setApiKey("");
                        setError("");
                      }}
                      className="shrink-0 rounded-lg bg-accent/15 px-3 py-1.5 font-mono text-xs text-accent transition-colors hover:bg-accent/25"
                    >
                      {isOpen ? "cancel" : "connect"}
                    </button>
                  )}
                </div>

                {/* Inline key entry panel */}
                {isOpen && (
                  <div className="space-y-3 border-t border-white/5 px-5 py-4">
                    <label className="block font-mono text-xs text-dim">
                      &gt; {intg.keyLabel}
                    </label>
                    <input
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && save(intg.id)}
                      placeholder="paste your key here"
                      className="glass w-full rounded-lg px-3.5 py-2.5 font-mono text-sm text-white placeholder-white/25 outline-none focus:border-accent/50"
                    />
                    {error && (
                      <p className="font-mono text-xs text-red-400">
                        &gt; error: {error}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <a
                        href={intg.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-white/30 hover:text-white/60"
                      >
                        where do i find this? ↗
                      </a>
                      <button
                        onClick={() => save(intg.id)}
                        disabled={busy || !apiKey.trim()}
                        className="rounded-lg bg-gradient-to-r from-accent to-accent-2 px-4 py-2 font-mono text-xs font-semibold disabled:opacity-40"
                      >
                        {busy ? "encrypting..." : "save key →"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
