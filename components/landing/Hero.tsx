"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import FolderCard from "./FolderCard";

interface HeroProps {
  easterEggTriggered?: boolean;
}

export default function Hero({ easterEggTriggered = false }: HeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;
    gsap.fromTo(
      titleRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.15 }
    );
  }, []);

  useEffect(() => {
    if (!easterEggTriggered || !titleRef.current) return;

    // Animate title text change
    gsap.to(titleRef.current, {
      duration: 0.3,
      opacity: 0,
      onComplete: () => {
        if (titleRef.current) {
          titleRef.current.textContent = "yes????";
          gsap.to(titleRef.current, {
            duration: 0.4,
            opacity: 1,
            ease: "back.out(1.7)",
          });
        }
      },
    });
  }, [easterEggTriggered]);

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center gap-4 overflow-hidden px-4 py-16">
      {/* Title */}
      <h1
        ref={titleRef}
        className="select-none text-center leading-none text-white opacity-0"
        style={{
          fontFamily: "var(--font-awergy)",
          fontSize: "clamp(4rem, 14vw, 12.5rem)",
        }}
      >
        Portfolio
      </h1>

      {/* Folder card */}
      <FolderCard easterEggTriggered={easterEggTriggered} />
    </section>
  );
}
