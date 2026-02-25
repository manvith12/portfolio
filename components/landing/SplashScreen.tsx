"use client";

import { useEffect, useRef, useState } from "react";

interface SplashScreenProps {
  /** When true, the splash begins its exit animation and calls onComplete */
  ready: boolean;
  /** Fired after exit animation finishes — parent can unmount splash */
  onComplete: () => void;
}

/**
 * A minimal, aesthetic splash screen.
 * Floating particles drift with gentle entropy while a soft
 * progress ring fills. Once `ready` flips true the whole screen
 * fades out and the callback fires.
 */
export default function SplashScreen({ ready, onComplete }: SplashScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [exiting, setExiting] = useState(false);

  // When ready, play exit animation then call onComplete
  useEffect(() => {
    if (!ready) return;
    // Small delay so the ring visually completes before we fade
    const t1 = setTimeout(() => setExiting(true), 200);
    const t2 = setTimeout(onComplete, 1100); // 200ms delay + 900ms fade
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [ready, onComplete]);

  return (
    <div
      ref={containerRef}
      className={`splash-container ${exiting ? "splash-exit" : ""}`}
      aria-live="polite"
      aria-label="Loading"
    >
      {/* Floating particles — pure CSS entropy */}
      <div className="splash-particles" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="splash-dot"
            style={{
              // Distribute using golden-angle-ish offsets for organic feel
              // toFixed(4) ensures server and client serialize identical strings
              "--dx": `${(Math.cos(i * 2.39996) * 38).toFixed(4)}vw`,
              "--dy": `${(Math.sin(i * 2.39996) * 38).toFixed(4)}vh`,
              "--delay": `${(i * 0.27) % 3.2}s`,
              "--dur": `${3.5 + (i % 4) * 1.2}s`,
              "--size": `${3 + (i % 5) * 2}px`,
              "--hue": `${220 + (i * 17) % 60}`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Center content: pulsing ring + name */}
      <div className="splash-center">
        <svg
          className="splash-ring"
          viewBox="0 0 100 100"
          width="80"
          height="80"
        >
          <circle
            className="splash-ring-track"
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
          />
          <circle
            className={`splash-ring-fill ${ready ? "splash-ring-done" : ""}`}
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="276.46"
            strokeDashoffset="276.46"
          />
        </svg>
        <p className="splash-name">S. Manvith</p>
      </div>
    </div>
  );
}
