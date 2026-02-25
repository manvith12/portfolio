"use client";

import { useState, useEffect } from "react";

interface ResponsiveScale {
  /** Scale multiplier for GSAP scale tweens (1 on desktop, reduced on mobile) */
  holdScale: number;
  /** Final scale at timeline end */
  finalScale: number;
  /** Scroll distance multiplier (shorter on mobile for less scrolling) */
  scrollEnd: string;
  /** Title fade-out Y offset */
  titleY: number;
  /** Folder card vertical offset */
  folderOffsetY: number;
  /** Whether the viewport is considered mobile */
  isMobile: boolean;
}

const MOBILE_BREAKPOINT = 768;

function getValues(width: number): ResponsiveScale {
  if (width < MOBILE_BREAKPOINT) {
    return {
      holdScale: 1.3,
      finalScale: 1.5,
      scrollEnd: "+=350%",
      titleY: -50,
      folderOffsetY: -80,
      isMobile: true,
    };
  }
  return {
    holdScale: 1.8,
    finalScale: 2.0,
    scrollEnd: "+=500%",
    titleY: -80,
    folderOffsetY: -130,
    isMobile: false,
  };
}

export function useResponsiveScale(): ResponsiveScale {
  const [values, setValues] = useState<ResponsiveScale>(() =>
    typeof window !== "undefined" ? getValues(window.innerWidth) : getValues(1024)
  );

  useEffect(() => {
    const onResize = () => {
      setValues(getValues(window.innerWidth));
    };
    window.addEventListener("resize", onResize);
    // Sync on mount in case SSR width differs
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return values;
}
