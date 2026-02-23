"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import Image from "next/image";
import { animate, remove, cubicBezier } from "animejs";

const spring = cubicBezier(0.34, 1.56, 0.64, 1);
const springSnappy = cubicBezier(0.16, 1, 0.3, 1);
const material = cubicBezier(0.4, 0, 0.2, 1);
import AnimatedSticker from "./AnimatedSticker";

/*
 * Sticker positions calculated from Figma node 15:874 (459×609 group).
 * Each sticker is positioned at the CENTER of its Figma wrapper, using
 * translate(-50%,-50%) on the positioning container so left/top = center point.
 */
const STICKERS = [
  {
    id: "daisy",
    src: "/assets/folder/image 6.png",
    alt: "Daisy sticker",
    cx: "22.2%",
    cy: "55.1%",
    w: "49%",
    rotate: 0,
  },
  {
    id: "red-flower",
    src: "/assets/folder/image 5.png",
    alt: "Red flower sticker",
    cx: "41.9%",
    cy: "49.3%",
    w: "20.3%",
    rotate: 0,
  },
  {
    id: "green-clover",
    src: "/assets/folder/image 7.png",
    alt: "Green clover sticker",
    cx: "61.9%",
    cy: "64.2%",
    w: "36.6%",
    rotate: 0,
  },
  {
    id: "star-burst",
    src: "/assets/folder/image 8.png",
    alt: "Star burst sticker",
    cx: "22.2%",
    cy: "35.6%",
    w: "39%",
    rotate: -9,
  },
  {
    id: "pixel-art",
    src: "/assets/folder/image 9.png",
    alt: "Pixel art sticker",
    cx: "49.9%",
    cy: "41.5%",
    w: "19.2%",
    rotate: 17,
  },
  {
    id: "lightning",
    src: "/assets/folder/image 10.png",
    alt: "Lightning doodle",
    cx: "65.8%",
    cy: "47.1%",
    w: "16.1%",
    rotate: 30,
  },
];

interface FolderCardProps {
  easterEggTriggered?: boolean;
  onClick?: () => void;
}

export interface FolderCardHandle {
  /** The folder container div (gets scaled/rotated by scroll animation) */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** The native <img> used for frame-by-frame swaps */
  frameImageRef: React.RefObject<HTMLImageElement | null>;
  /** The wrapper around all stickers (faded out during scroll) */
  stickersRef: React.RefObject<HTMLDivElement | null>;
  /** Set true by Hero when scroll animation is active — disables hover effects */
  scrollActiveRef: React.MutableRefObject<boolean>;
  /** Kill any in-flight hover tweens (called by Hero when scroll first engages) */
  killHoverTweens: () => void;
}

const FolderCard = forwardRef<FolderCardHandle, FolderCardProps>(
  function FolderCard({ easterEggTriggered = false, onClick }, ref) {
    const cardRef = useRef<HTMLDivElement>(null);
    const frameImgRef = useRef<HTMLImageElement>(null);
    const stickersWrapperRef = useRef<HTMLDivElement>(null);
    const stickerRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const scrollActiveRef = useRef(false);

    useImperativeHandle(ref, () => ({
      containerRef: cardRef,
      frameImageRef: frameImgRef,
      stickersRef: stickersWrapperRef,
      scrollActiveRef,
      killHoverTweens: () => {
        if (cardRef.current) remove(cardRef.current);
      },
    }));

    useEffect(() => {
      if (!cardRef.current) return;
      animate(cardRef.current, {
        translateY: { from: 100, to: 0 },
        opacity: { from: 0, to: 1 },
        duration: 1200,
        ease: springSnappy,
        delay: 600,
      });
    }, []);

    // Handle Easter Egg animations
    useEffect(() => {
      if (!easterEggTriggered) return;

      if (cardRef.current) {
        remove(cardRef.current);
        animate(cardRef.current, {
          rotate: 0,
          duration: 800,
          ease: material,
        });
      }

      stickerRefs.current.forEach((stickerEl) => {
        if (!stickerEl) return;
        const delay = Math.random() * 300;
        const duration = 2000 + Math.random() * 800;
        const spreadX = (Math.random() - 0.5) * 300;
        const swingAmount = (Math.random() - 0.5) * 720;

        animate(stickerEl, {
          translateY: window.innerHeight + 100,
          translateX: spreadX,
          rotate: swingAmount,
          opacity: 0,
          duration,
          delay,
          ease: "inQuad",
        });
      });
    }, [easterEggTriggered]);

    /* ── Whole‑card hover / tap ── */
    const onEnter = () => {
      if (!cardRef.current || easterEggTriggered || scrollActiveRef.current) return;
      remove(cardRef.current);
      animate(cardRef.current, {
        rotate: 3,
        scale: 1.04,
        duration: 350,
        ease: spring,
      });
    };
    const onLeave = () => {
      if (!cardRef.current || easterEggTriggered || scrollActiveRef.current) return;
      remove(cardRef.current);
      animate(cardRef.current, {
        rotate: 6,
        scale: 1,
        duration: 500,
        ease: spring,
      });
    };
    const onDown = () => {
      if (!cardRef.current || easterEggTriggered || scrollActiveRef.current) return;
      remove(cardRef.current);
      animate(cardRef.current, {
        scale: 1.07,
        duration: 120,
        ease: material,
      });
    };
    const onUp = () => {
      if (!cardRef.current || easterEggTriggered || scrollActiveRef.current) return;
      remove(cardRef.current);
      animate(cardRef.current, {
        scale: 1,
        duration: 400,
        ease: spring,
      });
    };

    return (
      <div
        ref={cardRef}
        className="relative cursor-pointer opacity-0"
        style={{
          width: "min(80vw, 460px)",
          aspectRatio: "459 / 609",
          transform: "rotate(6deg)",
        }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onClick={onClick}
      >
        {/* ── Frame image for scroll animation (native img for fast src swap) ── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={frameImgRef}
          src="/assets/folder/folder.png"
          alt="Portfolio folder of S. Manvith"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />

        {/* ── Interactive sticker overlays ── */}
        <div ref={stickersWrapperRef} className="absolute inset-0">
          {STICKERS.map((s) => (
            <div
              key={s.id}
              ref={(el) => {
                if (el) stickerRefs.current.set(s.id, el);
              }}
              className="absolute"
              style={{
                left: s.cx,
                top: s.cy,
                width: s.w,
                transform: "translate(-50%, -50%)",
                zIndex: 5,
              }}
            >
              <AnimatedSticker
                src={s.src}
                alt={s.alt}
                rotate={s.rotate}
                disabled={easterEggTriggered}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default FolderCard;
