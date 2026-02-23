"use client";

import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import FolderCard, { type FolderCardHandle } from "./FolderCard";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/** Frame image paths for the 12-frame folder opening sequence */
const FRAME_PATHS = [
  "/assets/folder/folder.png",
  "/assets/folder/folder2.png",
  "/assets/folder/folder3.png",
  "/assets/folder/folder4.png",
  "/assets/folder/folder5.png",
  "/assets/folder/folder6.png",
  "/assets/folder/folder7.png",
  "/assets/folder/folder8.png",
  "/assets/folder/folder9.png",
  "/assets/folder/folder10.png",
  "/assets/folder/folder11.png",
  "/assets/folder/folder12.png",
];

interface HeroProps {
  easterEggTriggered?: boolean;
}

export default function Hero({ easterEggTriggered = false }: HeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const folderRef = useRef<FolderCardHandle>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isAutoPlaying = useRef(false);
  const framesRef = useRef<HTMLImageElement[]>([]);

  // Entrance animation for title
  useEffect(() => {
    if (!titleRef.current) return;
    gsap.fromTo(
      titleRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.15 }
    );
  }, []);

  // Easter egg: change title text
  useEffect(() => {
    if (!easterEggTriggered || !titleRef.current) return;

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

  // ── Main scroll animation setup ──
  useEffect(() => {
    // Preload all frames
    Promise.all(
      FRAME_PATHS.map(
        (src) =>
          new Promise<HTMLImageElement>((resolve) => {
            const img = new window.Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
          })
      )
    ).then((frames) => {
      framesRef.current = frames;
    });

    const pin = pinWrapperRef.current;
    const folder = folderRef.current;
    if (!pin || !folder) return;

    const container = folder.containerRef.current;
    const frameImg = folder.frameImageRef.current;
    const stickers = folder.stickersRef.current;
    const title = titleRef.current;

    if (!container || !frameImg || !stickers || !title) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      const frameState = { current: 0 };

      /* ─── PHASE 1 (0→0.15): Zoom in + straighten + fade stickers + hide title ─── */
      tl.to(
        container,
        {
          scale: 1.8,
          rotation: 0,
          duration: 0.15,
          ease: "power2.inOut",
        },
        0
      );

      tl.to(
        stickers,
        {
          opacity: 0,
          duration: 0.1,
          ease: "power2.in",
        },
        0.02
      );

      tl.to(
        title,
        {
          opacity: 0,
          y: -80,
          duration: 0.1,
          ease: "power2.in",
        },
        0
      );

      /* ─── PHASE 2 (0.15→0.55): Frame-by-frame folder opening ─── */
      tl.to(
        frameState,
        {
          current: FRAME_PATHS.length - 1,
          duration: 0.4,
          ease: "none",
          onUpdate: function () {
            const idx = Math.round(frameState.current);
            if (frameImg && framesRef.current[idx]) {
              frameImg.src = framesRef.current[idx].src;
            }
          },
        },
        0.15
      );

      /* ─── PHASE 3 (0.55→0.70): Pan out slightly to show opened folder ─── */
      tl.to(
        container,
        {
          scale: 1.2,
          duration: 0.15,
          ease: "power2.inOut",
        },
        0.55
      );

      /* ─── PHASE 4 (0.70→1.0): Aggressive zoom into top-left of folder ─── */
      tl.to(
        container,
        {
          scale: 12,
          xPercent: 60,
          yPercent: -30,
          duration: 0.3,
          ease: "power3.in",
        },
        0.70
      );

      tlRef.current = tl;
    });

    return () => ctx.revert();
  }, []);

  /** Click handler: auto-scroll through the animation then jump to #aboutme */
  const handleFolderClick = useCallback(() => {
    if (isAutoPlaying.current) return;
    const st = tlRef.current?.scrollTrigger;
    if (!st) return;

    isAutoPlaying.current = true;

    gsap.to(window, {
      scrollTo: { y: st.end, autoKill: false },
      duration: 3.5,
      ease: "power2.inOut",
      onComplete: () => {
        isAutoPlaying.current = false;
      },
    });
  }, []);

  return (
    <section
      ref={pinWrapperRef}
      className="relative flex min-h-screen w-full flex-col items-center justify-center gap-4 overflow-hidden px-4 py-16"
    >
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
      <FolderCard
        ref={folderRef}
        easterEggTriggered={easterEggTriggered}
        onClick={handleFolderClick}
      />
    </section>
  );
}
