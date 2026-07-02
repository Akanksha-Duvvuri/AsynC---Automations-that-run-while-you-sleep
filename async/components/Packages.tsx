"use client";

/**
 * Packages
 * Three glass cards styled as terminal windows.
 * Integration lists are rendered as terminal output lines.
 */

type Pkg = {
  file: string;
  price: string;
  tagline: string;
  integrations: string[];
  highlight?: boolean;
};

const packages: Pkg[] = [
  {
    file: "starter.pkg",
    price: "₹2,000/mo",
    tagline: "the essentials, automated",
    integrations: ["aisensy — whatsapp", "brevo — email", "google sheets"],
  },
  {
    file: "growth.pkg",
    price: "₹4,500/mo",
    tagline: "money in, messages out",
    integrations: [
      "everything in starter",
      "razorpay — payments",
      "zoho books — invoicing",
    ],
    highlight: true,
  },
  {
    file: "scale.pkg",
    price: "₹8,000/mo",
    tagline: "full ops on autopilot",
    integrations: [
      "everything in growth",
      "nimbuspost — shipping",
      "custom flows + priority support",
    ],
  },
];

export default function Packages() {
  return (
    <section id="packages" className="relative px-4 py-28">
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <p className="font-mono text-sm text-accent">$ ls ./packages</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Pick your stack. <span className="text-white/50">We run it.</span>
        </h2>

        {/* Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.file}
              className={`glass group rounded-xl transition-all duration-300 hover:-translate-y-1.5 hover:glow-accent ${
                pkg.highlight ? "border-accent/40" : ""
              }`}
            >
              {/* Terminal title bar */}
              <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 font-mono text-xs text-dim">
                  {pkg.file}
                </span>
                {pkg.highlight && (
                  <span className="ml-auto rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] text-accent">
                    popular
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="px-5 py-6">
                <p className="font-mono text-2xl font-bold">{pkg.price}</p>
                <p className="mt-1 font-mono text-xs text-dim">
                  {"// "}
                  {pkg.tagline}
                </p>

                <ul className="mt-6 space-y-2.5 font-mono text-sm">
                  {pkg.integrations.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-terminal-green">✓</span>
                      <span className="text-white/75">{item}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/signup"
                  className={`mt-8 block rounded-lg py-2.5 text-center font-mono text-sm transition-all ${
                    pkg.highlight
                      ? "bg-gradient-to-r from-accent to-accent-2 font-semibold"
                      : "glass text-white/80 hover:text-white"
                  }`}
                >
                  install {pkg.file} →
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center font-mono text-xs text-dim">
          all plans BYOK — you bring your own API keys, we bring the brain
        </p>
      </div>
    </section>
  );
}
