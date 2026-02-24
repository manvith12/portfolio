"use client";

import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import FolderCard, { type FolderCardHandle } from "./FolderCard";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/** Frame image paths for the 42-frame folder opening sequence */
const FRAME_PATHS = [
  "/assets/folder/folder.svg",
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
  "/assets/folder/folder12.svg",
  "/assets/folder/folder13.png",
  "/assets/folder/folder13-1.png",
  "/assets/folder/folder14.png",
  "/assets/folder/folder15.png",
  "/assets/folder/folder16.png",
  "/assets/folder/folder17.png",
  "/assets/folder/folder18.png",
  "/assets/folder/folder19.png",
  "/assets/folder/folder20.png",
  "/assets/folder/folder21.png",
  "/assets/folder/folder22.png",
  "/assets/folder/folder23.png",
  "/assets/folder/folder24.png",
  "/assets/folder/folder25.png",
  "/assets/folder/folder26.svg",
  "/assets/folder/folder27.png",
  "/assets/folder/folder28.png",
  "/assets/folder/folder29.png",
  "/assets/folder/folder30.png",
  "/assets/folder/folder31.png",
  "/assets/folder/folder32.png",
  "/assets/folder/folder33.png",
  "/assets/folder/folder34.png",
  "/assets/folder/folder35.png",
  "/assets/folder/folder36.png",
  "/assets/folder/folder37.png",
  "/assets/folder/folder38.png",
  "/assets/folder/folder39.png",
  "/assets/folder/folder40.png",
  "/assets/folder/folder41.png",
  "/assets/folder/folder42.png",
];

// Landmark indices
const FOLDER12_INDEX = 11; // 0-based index of folder12.svg
const FOLDER26_INDEX = 26; // 0-based index of folder26.svg (folder13-1 is an extra frame, shifts indices up)

// Rolling buffer config
const BUFFER_AHEAD = 8;
const BUFFER_BEHIND = 3;

interface HeroProps {
  easterEggTriggered?: boolean;
}

export default function Hero({ easterEggTriggered = false }: HeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const folderRef = useRef<FolderCardHandle>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isAutoPlaying = useRef(false);

  // Frame buffer system using refs (no React re-renders)
  const bitmapCache = useRef<Map<number, ImageBitmap>>(new Map());
  const pendingLoads = useRef<Set<number>>(new Set());
  const currentFrameRef = useRef(0);
  const lastRenderedFrame = useRef(-1);
  const rafId = useRef(0);
  const isUnmounted = useRef(false);

  /** Load a single frame as ImageBitmap (async, off main thread decoding) */
  const loadFrame = useCallback((index: number): Promise<ImageBitmap | null> => {
    if (bitmapCache.current.has(index) || pendingLoads.current.has(index)) {
      return Promise.resolve(bitmapCache.current.get(index) ?? null);
    }
    if (index < 0 || index >= FRAME_PATHS.length) return Promise.resolve(null);

    pendingLoads.current.add(index);

    return fetch(FRAME_PATHS[index])
      .then((res) => res.blob())
      .then((blob) => createImageBitmap(blob))
      .then((bmp) => {
        if (!isUnmounted.current) {
          bitmapCache.current.set(index, bmp);
        }
        pendingLoads.current.delete(index);
        return bmp;
      })
      .catch(() => {
        pendingLoads.current.delete(index);
        return null;
      });
  }, []);

  /** Fill the rolling buffer around a target frame index */
  const fillBuffer = useCallback(
    (targetIdx: number) => {
      // Load frames ahead
      const loadPromises: Promise<ImageBitmap | null>[] = [];
      for (let i = targetIdx; i <= Math.min(targetIdx + BUFFER_AHEAD, FRAME_PATHS.length - 1); i++) {
        if (!bitmapCache.current.has(i)) {
          loadPromises.push(loadFrame(i));
        }
      }

      // Evict old frames behind
      const evictBefore = targetIdx - BUFFER_BEHIND;
      bitmapCache.current.forEach((bmp, key) => {
        if (key < evictBefore) {
          bmp.close(); // Free GPU memory
          bitmapCache.current.delete(key);
        }
      });

      return loadPromises;
    },
    [loadFrame]
  );

  /** Render a frame to canvas using rAF (decoupled from React) */
  const renderFrame = useCallback(() => {
    const folder = folderRef.current;
    if (!folder) return;

    const canvas = folder.canvasRef.current;
    const ctx = folder.canvasCtxRef.current;
    if (!canvas || !ctx) return;

    const targetFrame = currentFrameRef.current;

    // Adaptive frame skipping: if we're behind, jump to target
    if (targetFrame === lastRenderedFrame.current) return;

    const bitmap = bitmapCache.current.get(targetFrame);
    if (bitmap) {
      // Resize canvas if needed (match display size at device pixel ratio)
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for perf
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);

      // Draw bitmap scaled to fit canvas (contain)
      const bmpAspect = bitmap.width / bitmap.height;
      const canvasAspect = w / h;
      let dw: number, dh: number, dx: number, dy: number;
      if (bmpAspect > canvasAspect) {
        dw = w;
        dh = w / bmpAspect;
        dx = 0;
        dy = (h - dh) / 2;
      } else {
        dh = h;
        dw = h * bmpAspect;
        dx = (w - dw) / 2;
        dy = 0;
      }

      ctx.drawImage(bitmap, dx, dy, dw, dh);
      lastRenderedFrame.current = targetFrame;
    }

    // Fill buffer around current position
    fillBuffer(targetFrame);
  }, [fillBuffer]);

  /** rAF render loop — runs independently of React */
  const startRenderLoop = useCallback(() => {
    const loop = () => {
      if (isUnmounted.current) return;
      renderFrame();
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
  }, [renderFrame]);

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
    isUnmounted.current = false;

    // Preload first few frames eagerly, then start rolling buffer
    const initialLoad = Promise.all(
      Array.from({ length: Math.min(BUFFER_AHEAD, FRAME_PATHS.length) }, (_, i) =>
        loadFrame(i)
      )
    );

    // Render first frame once loaded
    initialLoad.then(() => {
      if (!isUnmounted.current) {
        currentFrameRef.current = 0;
        renderFrame();
      }
    });

    // Start the rAF render loop
    startRenderLoop();

    const pin = pinWrapperRef.current;
    const folder = folderRef.current;
    if (!pin || !folder) return;

    const container = folder.containerRef.current;
    const canvas = folder.canvasRef.current;
    const stickers = folder.stickersRef.current;
    const title = titleRef.current;

    if (!container || !canvas || !stickers || !title) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: "+=500%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const f = folderRef.current;
            if (!f) return;
            const wasActive = f.scrollActiveRef.current;
            f.scrollActiveRef.current = self.progress > 0.01;
            if (!wasActive && self.progress > 0.01) {
              f.killHoverTweens();
            }
          },
        },
      });

      const frameState = { current: 0 };

      /** Shared frame update — just sets the target index; rAF loop handles rendering */
      const updateFrame = () => {
        const idx = Math.round(frameState.current);
        if (idx !== currentFrameRef.current) {
          currentFrameRef.current = idx;
        }
      };

      /* ─── PHASE 1 (0→0.10): Straighten + fade stickers + hide title ─── */
      tl.to(
        container,
        {
          rotation: 0,
          duration: 0.1,
          ease: "power2.inOut",
        },
        0
      );

      tl.fromTo(
        stickers,
        { opacity: 1 },
        { opacity: 0, duration: 0.08, ease: "power2.in" },
        0.01
      );

      tl.fromTo(
        title,
        { opacity: 1, y: 0 },
        { opacity: 0, y: -80, duration: 0.08, ease: "power2.in" },
        0
      );

      /* ─── PHASE 2A (0.10→0.25): Advance frames 1-11 to reach folder12 ─── */
      tl.to(
        frameState,
        {
          current: FOLDER12_INDEX,
          duration: 0.15,
          ease: "power1.inOut",
          onUpdate: updateFrame,
        },
        0.10
      );

      /* ─── PHASE 2B (0.25→0.50): FORCED 3-SECOND HOLD at folder12 with pan-in scale effect ─── */
      tl.to(
        container,
        {
          scale: 1.8,
          duration: 0.25,
          ease: "power2.inOut",
        },
        0.25
      );

      /* ─── PHASE 2C (0.50→0.65): Resume frame advancement from folder13 to folder26 ─── */
      tl.to(
        frameState,
        {
          current: FOLDER26_INDEX,
          duration: 0.15,
          ease: "power1.inOut",
          onUpdate: updateFrame,
        },
        0.50
      );

      /* ─── PHASE 2D (0.65→0.90): FORCED 3-SECOND HOLD at folder26 with pan-in scale effect ─── */
      tl.to(
        container,
        {
          scale: 1.8,
          duration: 0.25,
          ease: "power2.inOut",
        },
        0.65
      );

      /* ─── PHASE 2E (0.90→0.98): Advance from folder27 to folder42 ─── */
      tl.to(
        frameState,
        {
          current: FRAME_PATHS.length - 1,
          duration: 0.08,
          ease: "power1.inOut",
          onUpdate: updateFrame,
        },
        0.90
      );

      /* ─── PHASE 3 (0.98→1.0): Final transition ─── */
      tl.to(
        container,
        {
          scale: 2.0,
          duration: 0.02,
          ease: "power2.inOut",
        },
        0.98
      );

      tlRef.current = tl;
    });

    return () => {
      isUnmounted.current = true;
      cancelAnimationFrame(rafId.current);
      // Free all cached bitmaps
      bitmapCache.current.forEach((bmp) => bmp.close());
      bitmapCache.current.clear();
      pendingLoads.current.clear();
      ctx.revert();
    };
  }, [loadFrame, fillBuffer, renderFrame, startRenderLoop]);

  /** Click handler: Three-stage navigation - folder12 → folder26 → folder42 */
  const handleFolderClick = useCallback(() => {
    if (isAutoPlaying.current) return;
    const tl = tlRef.current;
    const st = tl?.scrollTrigger;
    if (!st) return;

    isAutoPlaying.current = true;

    // Check current progress in animation
    const currentProgress = st.progress ?? 0;

    // Determine target scroll position based on current progress
    let targetProgress: number;
    if (currentProgress < 0.25) {
      // User clicked at the beginning → scroll to end of folder12 hold (0.50)
      targetProgress = 0.50;
    } else if (currentProgress < 0.65) {
      // User clicked at folder12 → scroll to end of folder26 hold (0.90)
      targetProgress = 0.90;
    } else {
      // User clicked at folder26 or beyond → scroll to end (folder42)
      targetProgress = 1.0;
    }

    // Calculate the actual scroll pixel value based on target progress
    const targetScrollY = st.start + (st.end - st.start) * targetProgress;

    gsap.to(window, {
      scrollTo: { y: targetScrollY, autoKill: false },
      duration: currentProgress < 0.25 ? 2.0 : 3.0,
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
      <div style={{ transform: "translateY(-130px)" }}>
        <FolderCard
          ref={folderRef}
          easterEggTriggered={easterEggTriggered}
          onClick={handleFolderClick}
        />
      </div>

    </section>
  );
}
