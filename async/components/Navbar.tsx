"use client";

import Link from "next/link";

/**
 * Navbar
 * Floating translucent glass bar, pinned to the top with margin,
 * rounded — deliberately not full-width so the dot field
 * shows around it.
 */

const links = [
  { label: "features", href: "#features" },
  { label: "packages", href: "#packages" },
  { label: "docs", href: "#" },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
      <nav className="glass flex w-full max-w-5xl items-center justify-between rounded-2xl px-5 py-3">
        {/* Logo */}
        <Link href="/" className="font-mono text-lg font-bold tracking-tight">
          AsynC<span className="blink text-accent">_</span>
        </Link>

        {/* Center links — hidden on small screens */}
        <div className="hidden items-center gap-8 font-mono text-sm text-white/60 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="font-mono text-sm text-white/60 transition-colors hover:text-white"
          >
            login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-gradient-to-r from-accent to-accent-2 px-4 py-2 font-mono text-sm font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            get started →
          </Link>
        </div>
      </nav>
    </header>
  );
}
