"use client";

import { useEffect, useState } from "react";
import IntroScreen from "@/components/IntroScreen";
import DotField from "@/components/DotField";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Packages from "@/components/Packages";
import PromptBox from "@/components/PromptBox";

/**
 * Landing page
 * - Shows the IntroScreen once per browser session (sessionStorage flag)
 * - One page-wide DotField sits behind everything so the spotlight
 *   follows the cursor across all sections
 */

export default function Home() {
  // null = still checking sessionStorage (avoids intro flashing on reload)
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem("async-intro-seen");
    setShowIntro(!seen);
  }, []);

  const finishIntro = () => {
    sessionStorage.setItem("async-intro-seen", "1");
    setShowIntro(false);
  };

  // Wait until we know whether to show the intro — prevents flicker
  if (showIntro === null) {
    return <div className="min-h-screen bg-void" />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {showIntro && <IntroScreen onFinish={finishIntro} />}

      {/* Page-wide dot field behind all content */}
      <div className="absolute inset-0">
        <DotField />
      </div>

      <div className="relative">
        <Navbar />
        <Hero />
        <Packages />
        <PromptBox />

        {/* Footer */}
        <footer className="border-t border-white/5 px-4 py-10 text-center font-mono text-xs text-dim">
          <p>
            AsynC<span className="text-accent">_</span> A startup for Indian startups
          </p>
          <p className="mt-2 text-white/25">
            © {new Date().getFullYear()} AsynC. all systems operational{" "}
          </p>
        </footer>
      </div>
    </main>
  );
}
