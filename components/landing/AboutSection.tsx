"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* Stickers visible in the D3→D4 panning transition zone (~88–115vh) */
const STICKER_DECO = [
  { src: "/assets/folder/image 5.png", x: "20vw", y: "92vh", rotate: 15 },
  { src: "/assets/folder/image 6.png", x: "68vw", y: "88vh", rotate: -20 },
  { src: "/assets/folder/image 7.png", x: "38vw", y: "110vh", rotate: 10 },
  { src: "/assets/folder/image 8.png", x: "75vw", y: "112vh", rotate: -12 },
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const d3Ref = useRef<HTMLImageElement>(null);
  const blueOverlayRef = useRef<HTMLDivElement>(null);
  const endFolderRef = useRef<HTMLImageElement>(null);
  const stickerRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const d3 = d3Ref.current;
    const blueOverlay = blueOverlayRef.current;
    const endFolder = endFolderRef.current;

    if (!section || !canvas || !d3 || !blueOverlay || !endFolder) return;

    const ctx = gsap.context(() => {
      // D3 starts off-screen above; endFolder starts off-screen above
      gsap.set(d3, { yPercent: -120 });
      gsap.set(endFolder, { yPercent: -300 });

      // Stickers start invisible
      STICKER_DECO.forEach((s, i) => {
        const el = stickerRefs.current[i];
        if (!el) return;
        gsap.set(el, { xPercent: -50, yPercent: -50, rotation: s.rotate, scale: 0 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "about",
          trigger: section,
          start: "top top",
          end: "+=500%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onLeaveBack: () => {
            // User scrolled back above About's start — jump to Hero frame stage
            // (folder12 fully open, just before D1 drop begins at 0.75)
            gsap.killTweensOf(window);
            const heroST = ScrollTrigger.getById("hero");
            if (!heroST) return;
            const frameStagePos =
              heroST.start + (heroST.end - heroST.start) * 0.74;
            gsap.to(window, {
              scrollTo: frameStagePos,
              duration: 0.6,
              ease: "power2.inOut",
            });
          },
        },
      });

      /* ── Phase 1 (0→0.10): Desktop-3 drops with bounce ── */
      tl.to(d3, { yPercent: 0, duration: 0.10, ease: "bounce.out" }, 0);

      /* ── Phase 2 (0.15→0.35): Pan down to Desktop-4 ── */
      tl.to(
        canvas,
        { yPercent: -50, duration: 0.20, ease: "power2.inOut" },
        0.15
      );

      // Stickers pop in during D3→D4 pan
      [0, 1].forEach((i) => {
        const el = stickerRefs.current[i];
        if (!el) return;
        tl.to(
          el,
          { scale: 1, duration: 0.06, ease: "back.out(1.7)" },
          0.18 + i * 0.04
        );
      });
      [2, 3].forEach((i) => {
        const el = stickerRefs.current[i];
        if (!el) return;
        tl.to(
          el,
          { scale: 1, duration: 0.06, ease: "elastic.out(1, 0.5)" },
          0.28 + (i - 2) * 0.04
        );
      });

      /* ── Phase 3 (0.60→0.68): Blue overlay fades in ── */
      tl.to(
        blueOverlay,
        { opacity: 1, duration: 0.08, ease: "power1.in" },
        0.60
      );

      /* ── Phase 4 (0.65→0.85): endofabout drops with bounce ── */
      tl.to(
        endFolder,
        { yPercent: 0, duration: 0.20, ease: "bounce.out" },
        0.65
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="aboutme"
      className="relative h-screen w-full overflow-hidden bg-[#1828c3]"
    >
      {/* Canvas: single column, 100vw × 200vh (D3 top cell, D4 bottom cell) */}
      <div
        ref={canvasRef}
        className="absolute left-0 top-0"
        style={{ width: "100vw", height: "200vh" }}
      >
        {/* Desktop-3: top cell — drops in with bounce */}
        <div className="absolute left-0 top-0 h-[100vh] w-[100vw]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={d3Ref}
            src="/assets/folder/Desktop - 3.png"
            alt="Desktop 3"
            className="h-full w-full select-none object-cover"
            draggable={false}
          />
        </div>

        {/* Desktop-4: bottom cell */}
        <div className="absolute left-0 top-[100vh] h-[100vh] w-[100vw]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/folder/Desktop - 4.png"
            alt="Desktop 4"
            className="h-full w-full select-none object-cover"
            draggable={false}
          />
        </div>

        {/* Decorative stickers in the D3→D4 transition zone */}
        {STICKER_DECO.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            ref={(el) => {
              stickerRefs.current[i] = el;
            }}
            src={s.src}
            alt=""
            className="pointer-events-none absolute select-none"
            style={{
              left: s.x,
              top: s.y,
              width: "clamp(60px, 8vw, 120px)",
            }}
            draggable={false}
          />
        ))}
      </div>

      {/* Blue overlay — covers desktop canvas for endofabout transition */}
      <div
        ref={blueOverlayRef}
        className="pointer-events-none absolute inset-0 bg-[#1828c3] opacity-0"
        style={{ zIndex: 10 }}
      />

      {/* endofabout — drops from above with bounce over blue bg */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 11 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={endFolderRef}
          src="/assets/folder/endofabout.png"
          alt="End of About section"
          className="max-h-[70vh] max-w-[80vw] select-none object-contain"
          draggable={false}
        />
      </div>
    </section>
  );
}
