"use client";

import { useEffect, useRef } from "react";

/**
 * DotField
 * Full-screen canvas of dots. Dots near the mouse glow brighter
 * and shift toward the accent color — the "spotlight" effect.
 *
 * Canvas is used instead of DOM nodes because a grid at ~40px spacing
 * on a 1080p screen is ~1300 dots — way too many for divs.
 */

type Props = {
  /** distance in px within which dots react to the cursor */
  spotlightRadius?: number;
  /** grid spacing between dots */
  gap?: number;
  className?: string;
};

export default function DotField({
  spotlightRadius = 180,
  gap = 36,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let dots: { x: number; y: number }[] = [];

    // Rebuild the dot grid to match the current canvas size
    const build = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = [];
      for (let x = gap / 2; x < canvas.offsetWidth; x += gap) {
        for (let y = gap / 2; y < canvas.offsetHeight; y += gap) {
          dots.push({ x, y });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const { x: mx, y: my } = mouse.current;

      for (const d of dots) {
        const dist = Math.hypot(d.x - mx, d.y - my);

        if (dist < spotlightRadius) {
          // Inside the spotlight: closer = brighter + bigger + more purple
          const t = 1 - dist / spotlightRadius; // 0 → edge, 1 → center
          const r = 1.2 + t * 1.6;
          // interpolate gray → purple
          const alpha = 0.25 + t * 0.75;
          ctx.fillStyle = `rgba(${139 + t * 40}, ${92 + t * 60}, 246, ${alpha})`;
          ctx.beginPath();
          ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Ambient dot — barely visible
          ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
          ctx.beginPath();
          ctx.arc(d.x, d.y, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    build();
    draw();

    window.addEventListener("resize", build);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [gap, spotlightRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    />
  );
}
