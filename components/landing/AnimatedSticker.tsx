"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

interface AnimatedStickerProps {
  src: string;
  alt: string;
  rotate?: number;
}

export default function AnimatedSticker({
  src,
  alt,
  rotate = 0,
}: AnimatedStickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      rotation: rotate + (Math.random() > 0.5 ? 10 : -10),
      scale: 1.15,
      duration: 0.4,
      ease: "back.out(1.7)",
    });
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      rotation: rotate,
      scale: 1,
      duration: 0.5,
      ease: "elastic.out(1, 0.4)",
    });
  };

  const handlePointerDown = () => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      scale: 1.25,
      duration: 0.15,
      ease: "power2.out",
    });
  };

  const handlePointerUp = () => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      scale: 1.15,
      duration: 0.3,
      ease: "elastic.out(1, 0.4)",
    });
  };

  return (
    <div
      ref={ref}
      className="cursor-pointer select-none"
      style={{ transform: `rotate(${rotate}deg)` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <Image
        src={src}
        alt={alt}
        width={200}
        height={200}
        draggable={false}
        className="w-full h-auto pointer-events-none"
      />
    </div>
  );
}
