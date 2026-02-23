"use client";

import { useState, useCallback } from "react";
import { Hero } from "@/components/landing";
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function Home() {
  const [easterEggTriggered, setEasterEggTriggered] = useState(false);

  const handleEasterEgg = useCallback(() => {
    setEasterEggTriggered(true);
  }, []);

  useKeyboardDetection(handleEasterEgg);

  return (
    <main
      className={`w-full transition-colors duration-1000 ${
        easterEggTriggered ? "bg-black" : "bg-[#1828c3]"
      }`}
    >
      <Hero easterEggTriggered={easterEggTriggered} />

      {/* About Me section — scroll target after folder opens */}
      <section
        id="aboutme"
        className="relative min-h-screen w-full flex items-center justify-center px-8"
        style={{ background: "#f5e6d3" }}
      >
        <h2
          className="text-6xl md:text-8xl text-[#1828c3] select-none"
          style={{ fontFamily: "var(--font-awergy)" }}
        >
          About Me
        </h2>
      </section>

      <SpeedInsights />
    </main>
  );
}
