"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

interface AnimatedStickerProps {
  src: string;
  alt: string;
  rotate?: number;
  disabled?: boolean;
}

export default function AnimatedSticker({
  src,
  alt,
  rotate = 0,
  disabled = false,
}: AnimatedStickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (disabled || !ref.current) return;
    gsap.to(ref.current, {
      rotation: rotate + (Math.random() > 0.5 ? 10 : -10),
      scale: 1.15,
      duration: 0.4,
      ease: "back.out(1.7)",
    });
  };

  const handleMouseLeave = () => {
    if (disabled || !ref.current) return;
    gsap.to(ref.current, {
      rotation: rotate,
      scale: 1,
      duration: 0.5,
      ease: "elastic.out(1, 0.4)",
    });
  };

  const handlePointerDown = () => {
    if (disabled || !ref.current) return;
    gsap.to(ref.current, {
      scale: 1.25,
      duration: 0.15,
      ease: "power2.out",
    });
  };

  const handlePointerUp = () => {
    if (disabled || !ref.current) return;
    gsap.to(ref.current, {
      scale: 1.15,
      duration: 0.3,
      ease: "elastic.out(1, 0.4)",
    });
  };

  return (
    <div
      ref={ref}
      className={`select-none ${!disabled ? "cursor-pointer" : ""}`}
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
