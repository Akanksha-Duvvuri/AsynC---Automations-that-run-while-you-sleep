"use client";

import { useState } from "react";

/**
 * PromptBox
 * The "describe your workflow" terminal. For now this is a demo:
 * it fake-analyzes the input and suggests a package based on
 * simple keyword matching. Later, this calls the FastAPI backend
 * and the real agent replies.
 */

// Very simple keyword → package matcher (placeholder for the real agent)
function suggestPackage(input: string): { pkg: string; reason: string } {
  const text = input.toLowerCase();
  const wantsShipping = /ship|nimbus|courier|delivery|tracking/.test(text);
  const wantsPayments = /pay|razorpay|invoice|zoho|gst|order/.test(text);

  if (wantsShipping)
    return {
      pkg: "scale.pkg",
      reason: "shipping automation needs the full stack",
    };
  if (wantsPayments)
    return {
      pkg: "growth.pkg",
      reason: "payment + invoice flows live here",
    };
  return {
    pkg: "starter.pkg",
    reason: "messaging + sheets covers this",
  };
}

type Line = { kind: "input" | "system" | "result"; text: string };

export default function PromptBox() {
  const [value, setValue] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);

  const run = () => {
    const trimmed = value.trim();
    if (!trimmed || busy) return;

    setLines((prev) => [...prev, { kind: "input", text: trimmed }]);
    setValue("");
    setBusy(true);

    // Fake analyzing delay — this is where the FastAPI call goes later
    setLines((prev) => [...prev, { kind: "system", text: "analyzing workflow..." }]);

    setTimeout(() => {
      const { pkg, reason } = suggestPackage(trimmed);
      setLines((prev) => [
        ...prev,
        {
          kind: "result",
          text: `✓ match found → ${pkg}  (${reason})`,
        },
      ]);
      setBusy(false);
    }, 1400);
  };

  return (
    <section id="prompt" className="relative px-4 pb-32">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-sm text-accent">$ user async</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Not sure what you need?{" "}
          <span className="text-white/50">Just describe it.</span>
        </h2>

        {/* Terminal */}
        <div className="glass mt-10 rounded-xl">
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-xs text-dim">
              workflow-matcher — interactive
            </span>
          </div>

          {/* Output history */}
          <div className="min-h-[120px] space-y-2 px-5 py-4 font-mono text-sm">
            <p className="text-dim">
              {"// e.g. \u201cwhen someone pays on razorpay, whatsapp them a confirmation\u201d"}
            </p>
            {lines.map((line, i) => (
              <p
                key={i}
                className={
                  line.kind === "input"
                    ? "text-white/90"
                    : line.kind === "system"
                    ? "text-dim"
                    : "text-terminal-green"
                }
              >
                {line.kind === "input" ? (
                  <>
                    <span className="text-terminal-green">you@async</span>
                    <span className="text-white/40">:~$</span> {line.text}
                  </>
                ) : (
                  <>&gt; {line.text}</>
                )}
              </p>
            ))}
          </div>

          {/* Input row */}
          <div className="flex items-center gap-3 border-t border-white/5 px-5 py-4 font-mono text-sm">
            <span className="shrink-0">
              <span className="text-terminal-green">you@async</span>
              <span className="text-white/40">:~$</span>
            </span>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
              placeholder="describe your workflow_"
              className="w-full bg-transparent text-white/90 placeholder-white/25 outline-none"
              disabled={busy}
            />
            <button
              onClick={run}
              disabled={busy || !value.trim()}
              className="shrink-0 rounded-md bg-accent/20 px-3 py-1.5 text-xs text-accent transition-colors hover:bg-accent/30 disabled:opacity-40"
            >
              run ↵
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
