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
  "/assets/folder/folder42.svg",
];

// Landmark indices
const FOLDER12_INDEX = 11; // 0-based index of folder12.svg
const FOLDER26_INDEX = 26; // 0-based index of folder26.svg (folder13-1 is an extra frame, shifts indices up)

// ── LRU Cache for preloaded HTMLImageElements ──
class LRUFrameCache {
  private cache = new Map<number, HTMLImageElement>();
  private maxSize: number;
  constructor(maxSize = 20) {
    this.maxSize = maxSize;
  }
  get(key: number): HTMLImageElement | undefined {
    const val = this.cache.get(key);
    if (val !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, val);
    }
    return val;
  }
  set(key: number, value: HTMLImageElement): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value!;
      this.cache.delete(oldest);
    }
    this.cache.set(key, value);
  }
  has(key: number): boolean {
    return this.cache.has(key);
  }
  clear(): void {
    this.cache.clear();
  }
}

const BUFFER_AHEAD = 8;
const BUFFER_BEHIND = 3;

interface HeroProps {
  easterEggTriggered?: boolean;
  /** Called once the first batch of frames is loaded (splash can dismiss) */
  onReady?: () => void;
}

export default function Hero({ easterEggTriggered = false, onReady }: HeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const folderRef = useRef<FolderCardHandle>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isAutoPlaying = useRef(false);
  const frameCacheRef = useRef(new LRUFrameCache(20));
  const loadingRef = useRef(new Set<number>());
  const targetFrameRef = useRef(0);
  const renderedFrameRef = useRef(-1);
  const rafIdRef = useRef(0);
  const isUnmountedRef = useRef(false);

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
    const pin = pinWrapperRef.current;
    const folder = folderRef.current;
    if (!pin || !folder) return;

    const container = folder.containerRef.current;
    const frameImg = folder.frameImageRef.current;
    const stickers = folder.stickersRef.current;
    const title = titleRef.current;

    if (!container || !frameImg || !stickers || !title) return;

    const cache = frameCacheRef.current;
    const loading = loadingRef.current;
    isUnmountedRef.current = false;

    // ── Load a single frame as a decoded HTMLImageElement ──
    function loadFrame(idx: number) {
      if (cache.has(idx) || loading.has(idx) || isUnmountedRef.current) return;
      loading.add(idx);
      const img = new Image();
      img.src = FRAME_PATHS[idx];
      img.onload = () => {
        if (isUnmountedRef.current) { loading.delete(idx); return; }
        // Use decode() for async decoding so the browser doesn't jank on first display
        img.decode().then(() => {
          if (isUnmountedRef.current) { loading.delete(idx); return; }
          cache.set(idx, img);
          loading.delete(idx);
        }).catch(() => {
          // decode() can fail on some browsers/formats; still cache the loaded img
          cache.set(idx, img);
          loading.delete(idx);
        });
      };
      img.onerror = () => loading.delete(idx);
    }

    // ── Rolling buffer: preload frames around current position ──
    function loadAround(centerIdx: number) {
      const start = Math.max(0, centerIdx - BUFFER_BEHIND);
      const end = Math.min(FRAME_PATHS.length - 1, centerIdx + BUFFER_AHEAD);
      for (let i = start; i <= end; i++) loadFrame(i);
    }

    // ── rAF render loop (no React state, direct img.src swap) ──
    function renderLoop() {
      if (isUnmountedRef.current) return;
      const target = targetFrameRef.current;
      if (target !== renderedFrameRef.current) {
        const cached = cache.get(target);
        if (cached && frameImg) {
          frameImg.src = cached.src;
          renderedFrameRef.current = target;
        }
      }
      rafIdRef.current = requestAnimationFrame(renderLoop);
    }

    // Preload first 12 frames (through folder12 landmark), then start render loop
    let loadedCount = 0;
    const PRELOAD_TARGET = Math.min(FOLDER12_INDEX + 1, FRAME_PATHS.length);
    const onReadyRef = onReady; // capture for closure

    function checkReady() {
      loadedCount++;
      if (loadedCount >= PRELOAD_TARGET && onReadyRef) {
        onReadyRef();
      }
    }

    for (let i = 0; i < PRELOAD_TARGET; i++) {
      if (cache.has(i)) { checkReady(); continue; }
      loading.add(i);
      const img = new Image();
      img.src = FRAME_PATHS[i];
      img.onload = () => {
        if (isUnmountedRef.current) { loading.delete(i); return; }
        img.decode().then(() => {
          cache.set(i, img);
          loading.delete(i);
          checkReady();
        }).catch(() => {
          cache.set(i, img);
          loading.delete(i);
          checkReady();
        });
      };
      img.onerror = () => { loading.delete(i); checkReady(); };
    }

    rafIdRef.current = requestAnimationFrame(renderLoop);

    // Eagerly preload folder26.svg (SVG landmark) so it's decoded before the hold phase
    loadFrame(FOLDER26_INDEX);

    // ── Frame update helper (called from GSAP onUpdate) ──
    function updateFrame(idx: number) {
      targetFrameRef.current = idx;
      loadAround(idx);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: "+=500%", // Extended to accommodate 3-second holds at both folder12 and folder26
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const f = folderRef.current;
            if (!f) return;
            const wasActive = f.scrollActiveRef.current;
            f.scrollActiveRef.current = self.progress > 0.01;
            // First moment scroll engages: kill any in-flight hover tweens so
            // they don't fight GSAP's scale/rotation scroll animation
            if (!wasActive && self.progress > 0.01) {
              f.killHoverTweens();
            }
          },
        },
      });

      const frameState = { current: 0 };

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
          current: FOLDER12_INDEX, // Stop at folder12 (index 11)
          duration: 0.15,
          ease: "power1.inOut",
          onUpdate() {
            updateFrame(Math.round(frameState.current));
          },
        },
        0.10
      );

      /* ─── PHASE 2B (0.25→0.50): FORCED 3-SECOND HOLD at folder12 with pan-in scale effect ─── */
      // Hold frame at folder12 - scale in from 1.0 to 1.8 (increased by 0.2 from 1.6)
      tl.to(
        container,
        {
          scale: 1.8,
          duration: 0.25, // 0.25 timeline duration ≈ 3 seconds with scrub: 0.8
          ease: "power2.inOut",
        },
        0.25
      );

      /* ─── PHASE 2C (0.50→0.65): Resume frame advancement from folder13 to folder26 ─── */
      tl.to(
        frameState,
        {
          current: FOLDER26_INDEX, // Advance to folder26 (index 26)
          duration: 0.15,
          ease: "power1.inOut",
          onUpdate() {
            updateFrame(Math.round(frameState.current));
          },
          onComplete() {
            updateFrame(FOLDER26_INDEX);
          },
        },
        0.50
      );

      /* ─── PHASE 2D (0.65→0.90): FORCED 3-SECOND HOLD at folder26 with pan-in scale effect ─── */
      // Hold frame at folder26 - scale to 1.8 (same treatment as folder12)
      tl.to(
        container,
        {
          scale: 1.8,
          duration: 0.25, // 0.25 timeline duration ≈ 3 seconds with scrub: 0.8
          ease: "power2.inOut",
        },
        0.65
      );

      /* ─── PHASE 2E (0.90→0.98): Advance from folder27 to folder42 ─── */
      tl.to(
        frameState,
        {
          current: FRAME_PATHS.length - 1, // Advance to last frame (folder42)
          duration: 0.08,
          ease: "power1.inOut",
          onUpdate() {
            updateFrame(Math.round(frameState.current));
          },
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
      isUnmountedRef.current = true;
      cancelAnimationFrame(rafIdRef.current);
      cache.clear();
      loading.clear();
      ctx.revert();
    };
  // onReady is captured once at mount via onReadyRef — intentionally run once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Click handler: left half scrolls back to last important frame (from folder12+), right half scrolls forward */
  const handleFolderClick = useCallback((isLeft: boolean) => {
    if (isAutoPlaying.current) return;
    const tl = tlRef.current;
    const st = tl?.scrollTrigger;
    if (!st) return;

    isAutoPlaying.current = true;

    const currentProgress = st.progress ?? 0;

    let targetProgress: number;

    if (isLeft && currentProgress >= 0.25) {
      // ── Left half: scroll BACK to the start of the previous hold phase ──
      if (currentProgress > 0.92) {
        targetProgress = 0.65; // back to folder26 hold start
      } else if (currentProgress >= 0.50) {
        // >= (not >) so landing exactly at 0.50 via right-click still goes back
        targetProgress = 0.25; // back to folder12 hold start
      } else {
        targetProgress = 0; // back to the very beginning
      }
    } else {
      // ── Right half (or any click before folder12): scroll FORWARD to next important frame ──
      if (currentProgress < 0.25) {
        targetProgress = 0.50; // forward to folder12 hold
      } else if (currentProgress < 0.65) {
        targetProgress = 0.90; // forward to folder26 hold
      } else {
        targetProgress = 1.0; // forward to end
      }
    }

    const targetScrollY = st.start + (st.end - st.start) * targetProgress;
    const duration = Math.abs(targetProgress - currentProgress) < 0.4 ? 1.5 : 2.5;

    gsap.to(window, {
      scrollTo: { y: targetScrollY, autoKill: false },
      duration,
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
