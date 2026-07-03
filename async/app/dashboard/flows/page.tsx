"use client";

import { useEffect, useState } from "react";

/**
 * Flows page
 * - terminal-style creator: describe the automation in plain English
 * - flows save as "draft" — the agent (Phase 4) will interpret + activate
 * - list shows all flows with status pills
 */

type Flow = {
  id: string;
  instruction: string;
  status: "draft" | "active" | "paused";
  createdAt: string;
};

const statusStyle: Record<Flow["status"], string> = {
  draft: "bg-white/5 text-white/40",
  active: "bg-terminal-green/15 text-terminal-green",
  paused: "bg-amber-400/15 text-amber-400",
};

export default function FlowsPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/flows");
    if (res.ok) {
      const data = await res.json();
      setFlows(data.flows);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (busy || instruction.trim().length < 10) return;
    setBusy(true);
    setError("");

    const res = await fetch("/api/flows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instruction: instruction.trim() }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "failed to create flow");
      setBusy(false);
      return;
    }

    setInstruction("");
    setBusy(false);
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-sm text-accent">$ cat ./flows</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">flows</h1>
        <p className="mt-2 font-mono text-xs text-dim">
          describe what you want — the agent builds and runs it in the background
        </p>
      </div>

      {/* Creator terminal */}
      <div className="glass rounded-xl">
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono text-xs text-dim">new-flow — editor</span>
        </div>

        <div className="px-5 py-4">
          <p className="mb-3 font-mono text-xs text-dim">
            {"// e.g. \u201cwhen someone pays on razorpay, whatsapp them a confirmation and create a zoho invoice\u201d"}
          </p>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="you@async:~$ describe your workflow_"
            rows={3}
            className="glass w-full resize-none rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-white/25 outline-none focus:border-accent/50"
          />
          {error && (
            <p className="mt-2 font-mono text-xs text-red-400">
              &gt; error: {error}
            </p>
          )}
          <div className="mt-3 flex justify-end">
            <button
              onClick={create}
              disabled={busy || instruction.trim().length < 10}
              className="rounded-lg bg-gradient-to-r from-accent to-accent-2 px-5 py-2.5 font-mono text-xs font-semibold disabled:opacity-40"
            >
              {busy ? "saving..." : "create flow →"}
            </button>
          </div>
        </div>
      </div>

      {/* Flow list */}
      {loading ? (
        <p className="font-mono text-sm text-dim">loading...</p>
      ) : flows.length === 0 ? (
        <div className="glass rounded-xl px-6 py-12 text-center">
          <p className="font-mono text-sm text-dim">no flows yet</p>
          <p className="mt-1 font-mono text-xs text-white/25">
            create your first one above — it takes one sentence
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {flows.map((flow) => (
            <div
              key={flow.id}
              className="glass flex items-start justify-between gap-4 rounded-xl px-5 py-4"
            >
              <div>
                <p className="font-mono text-sm text-white/85">
                  {flow.instruction}
                </p>
                <p className="mt-1.5 font-mono text-[11px] text-white/25">
                  created {new Date(flow.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] ${statusStyle[flow.status]}`}
              >
                {flow.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
