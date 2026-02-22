"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
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
}

export default function FolderCard({ easterEggTriggered = false }: FolderCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const stickerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.6 }
    );
  }, []);

  // Handle Easter Egg animations
  useEffect(() => {
    if (!easterEggTriggered) return;

    // Straighten folder (remove rotation)
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotation: 0,
        duration: 0.8,
        ease: "power2.inOut",
      });
    }

    // Animate stickers falling with helical motion
    stickerRefs.current.forEach((stickerEl, id) => {
      if (!stickerEl) return;

      const delay = Math.random() * 0.3; // Stagger start times
      const duration = 2 + Math.random() * 0.8;
      const spreadX = (Math.random() - 0.5) * 300; // Random left/right drift
      const swingAmount = (Math.random() - 0.5) * 720; // Random rotation amount

      gsap.to(stickerEl, {
        y: window.innerHeight + 100,
        x: spreadX,
        rotation: swingAmount,
        opacity: 0,
        duration: duration,
        delay: delay,
        ease: "power1.in",
      });
    });
  }, [easterEggTriggered]);

  /* ── Whole‑card hover / tap ── */
  const onEnter = () => {
    if (!cardRef.current || easterEggTriggered) return;
    gsap.to(cardRef.current, {
      rotation: 3,
      scale: 1.03,
      duration: 0.5,
      ease: "power2.out",
    });
  };
  const onLeave = () => {
    if (!cardRef.current || easterEggTriggered) return;
    gsap.to(cardRef.current, {
      rotation: 6,
      scale: 1,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });
  };
  const onDown = () => {
    if (!cardRef.current || easterEggTriggered) return;
    gsap.to(cardRef.current, {
      scale: 1.07,
      duration: 0.15,
      ease: "power2.out",
    });
  };
  const onUp = () => {
    if (!cardRef.current || easterEggTriggered) return;
    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.4,
      ease: "elastic.out(1, 0.4)",
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
    >
      {/* ── Complete folder image as base ── */}
      <Image
        src="/assets/folder/folder.png"
        alt="Portfolio folder of S. Manvith"
        fill
        className="object-contain pointer-events-none select-none"
        priority
        draggable={false}
        sizes="(max-width: 640px) 80vw, 460px"
      />

      {/* ── Interactive sticker overlays ── */}
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
  );
}
