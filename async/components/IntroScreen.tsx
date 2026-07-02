"use client";

import { useEffect, useState } from "react";
import DecryptText from "./DecryptText";
import DotField from "./DotField";

/**
 * IntroScreen
 * Full-screen overlay shown on first visit per session.
 * A glass terminal window "boots up", decrypts the welcome line,
 * then waits for Enter / click / tap to fade out and reveal the page.
 *
 * Sequence:
 *   stage 0 — terminal appears, command line types
 *   stage 1 — "establishing connection..." line
 *   stage 2 — decrypt animation for the welcome message
 *   stage 3 — "press enter to continue" + listening for input
 */

export default function IntroScreen({ onFinish }: { onFinish: () => void }) {
  const [stage, setStage] = useState(0);
  const [leaving, setLeaving] = useState(false);

  // advance through boot stages on timers
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 900);
    const t2 = setTimeout(() => setStage(2), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // once fully decrypted (stage 3), listen for enter / click
  useEffect(() => {
    if (stage < 3) return;

    const leave = () => {
      setLeaving(true);
      // let the fade-out play before unmounting
      setTimeout(onFinish, 600);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") leave();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("click", leave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", leave);
    };
  }, [stage, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-void transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <DotField gap={44} spotlightRadius={140} />

      {/* Terminal window */}
      <div className="glass relative mx-4 w-full max-w-2xl rounded-xl shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-xs text-dim">
            AsynC — zsh
          </span>
        </div>

        {/* Terminal body */}
        <div className="space-y-3 px-6 py-8 font-mono text-sm sm:text-base">
          <p className="text-dim">
            <span className="text-terminal-green">user@AsynC</span>
            <span className="text-white/40">:~$</span>{" "}
            <span className="text-white/90">./initialize</span>
          </p>

          {stage >= 1 && (
            <p className="text-white/50">&gt; establishing connection...</p>
          )}

          {stage >= 2 && (
            <p className="text-xl sm:text-3xl font-semibold tracking-tight">
              <span className="text-white/40">&gt; </span>
              <DecryptText
                text="Hello, welcome to AsynC"
                speed={28}
                revealEvery={2}
                className="gradient-text"
                onDone={() => setStage(3)}
              />
            </p>
          )}

          {stage >= 3 && (
            <p className="pt-4 text-xs text-dim sm:text-sm">
              press <span className="rounded border border-white/15 px-1.5 py-0.5 text-white/70">enter</span> to
              continue <span className="blink text-accent">▍</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
