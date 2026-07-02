"use client";

import { useEffect, useRef, useState } from "react";

/**
 * DecryptText
 * Renders text that starts as scrambled characters and "decrypts"
 * left-to-right into the real string. The core mechanic:
 *
 * 1. Every `speed` ms we re-render the string.
 * 2. Characters before `revealed` show their real value.
 * 3. Characters after it show a random glyph from CHARSET.
 * 4. `revealed` increases by 1 every `revealEvery` ticks,
 *    so the scramble "resolves" progressively.
 */

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*<>/\\|~";

type Props = {
  text: string;
  speed?: number;        // ms between scramble frames
  revealEvery?: number;  // frames per character reveal (higher = slower)
  className?: string;
  startDelay?: number;   // ms to wait before starting
  onDone?: () => void;   // fires when fully decrypted
};

export default function DecryptText({
  text,
  speed = 30,
  revealEvery = 2,
  className = "",
  startDelay = 0,
  onDone,
}: Props) {
  const [display, setDisplay] = useState("");
  const [started, setStarted] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;

    let frame = 0;
    let revealed = 0;

    const interval = setInterval(() => {
      frame++;
      if (frame % revealEvery === 0) revealed++;

      // Build the visible string: real chars up to `revealed`, noise after
      const out = text
        .split("")
        .map((ch, i) => {
          if (ch === " ") return " "; // keep spaces stable — looks cleaner
          if (i < revealed) return ch;
          return CHARSET[Math.floor(Math.random() * CHARSET.length)];
        })
        .join("");

      setDisplay(out);

      if (revealed >= text.length && !doneRef.current) {
        doneRef.current = true;
        clearInterval(interval);
        setDisplay(text);
        onDone?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [started, text, speed, revealEvery, onDone]);

  // Reserve space with the real text so layout never jumps
  return (
    <span className={className} aria-label={text}>
      {display || "\u00A0"}
    </span>
  );
}
