"use client";

import { useRef } from "react";
import Image from "next/image";
import { animate, remove, cubicBezier } from "animejs";

const spring = cubicBezier(0.34, 1.56, 0.64, 1);
const material = cubicBezier(0.4, 0, 0.2, 1);

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
    remove(ref.current);
    animate(ref.current, {
      rotate: rotate + (Math.random() > 0.5 ? 12 : -12),
      scale: 1.18,
      duration: 300,
      ease: spring,
    });
  };

  const handleMouseLeave = () => {
    if (disabled || !ref.current) return;
    remove(ref.current);
    animate(ref.current, {
      rotate: rotate,
      scale: 1,
      duration: 500,
      ease: spring,
    });
  };

  const handlePointerDown = () => {
    if (disabled || !ref.current) return;
    remove(ref.current);
    animate(ref.current, {
      scale: 1.28,
      duration: 100,
      ease: material,
    });
  };

  const handlePointerUp = () => {
    if (disabled || !ref.current) return;
    remove(ref.current);
    animate(ref.current, {
      scale: 1.18,
      duration: 300,
      ease: spring,
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
