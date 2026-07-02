"use client";

import DecryptText from "./DecryptText";

/**
 * Hero
 * Sits on top of the page-wide DotField (rendered by the page itself,
 * so the spotlight works across the whole landing page).
 */

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      {/* Badge */}
      <div className="glass mb-8 flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs text-white/70">
        <span className="text-accent"></span>
        BYOK · We'll take care of the rest
      </div>

      {/* Headline */}
      <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl">
        Automations that run{" "}
        <span className="gradient-text">
          <DecryptText text="while you sleep" speed={40} revealEvery={3} startDelay={400} />
        </span>
      </h1>

      {/* Sub-line in code-comment style */}
      <p className="mt-6 font-mono text-sm text-dim sm:text-base">
        {"// your ops, on autopilot — whatsapp, payments, invoices, shipping"}
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <a
          href="/signup"
          className="rounded-xl bg-gradient-to-r from-accent to-accent-2 px-7 py-3.5 font-mono text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          get started →
        </a>
        <a
          href="#prompt"
          className="glass rounded-xl px-7 py-3.5 font-mono text-sm text-white/80 transition-colors hover:text-white"
        >
          describe your workflow
        </a>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 font-mono text-xs text-white/30">
        scroll <span className="inline-block animate-bounce">↓</span>
      </div>
    </section>
  );
}
