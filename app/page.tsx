"use client";

import { useState, useCallback } from "react";
import { Hero } from "@/components/landing";
import SplashScreen from "@/components/landing/SplashScreen";
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

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
      {!splashDone && (
        <SplashScreen ready={framesReady} onComplete={handleSplashComplete} />
      )}

      <Hero
        easterEggTriggered={easterEggTriggered}
        onReady={handleFramesReady}
      />

      <SpeedInsights />
      <Analytics />
    </main>
  );
}
