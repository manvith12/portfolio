"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { Hero } from "@/components/landing";
import SplashScreen from "@/components/landing/SplashScreen";
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection";

// Defer non-critical analytics until after hydration
const SpeedInsights = lazy(() =>
  import("@vercel/speed-insights/next").then((m) => ({ default: m.SpeedInsights }))
);
const Analytics = lazy(() =>
  import("@vercel/analytics/next").then((m) => ({ default: m.Analytics }))
);

export default function Home() {
  const [easterEggTriggered, setEasterEggTriggered] = useState(false);
  const [framesReady, setFramesReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  const handleEasterEgg = useCallback(() => {
    setEasterEggTriggered(true);
  }, []);

  const handleFramesReady = useCallback(() => {
    setFramesReady(true);
  }, []);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  useKeyboardDetection(handleEasterEgg);

  return (
    <main
      className={`w-full transition-colors duration-1000 ${
        easterEggTriggered ? "bg-black" : "bg-[#1828c3]"
      }`}
    >
      {/* SEO: visually hidden H1 with target keywords */}
      <h1 className="sr-only">
        Sanisetty Manvith &mdash; Developer Portfolio | IIIT Kottayam
      </h1>

      {!splashDone && (
        <SplashScreen ready={framesReady} onComplete={handleSplashComplete} />
      )}

      <Hero
        easterEggTriggered={easterEggTriggered}
        onReady={handleFramesReady}
      />

      <Suspense fallback={null}>
        <SpeedInsights />
        <Analytics />
      </Suspense>
    </main>
  );
}
