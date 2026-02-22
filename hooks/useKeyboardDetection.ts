"use client";

import { useEffect, useCallback } from "react";

export function useKeyboardDetection(callback: () => void) {
  useEffect(() => {
    let buffer = "";
    const targetSequence = "manvith";

    const handleKeyPress = (event: KeyboardEvent) => {
      // Only track alphanumeric keys
      if (event.key.match(/^[a-zA-Z]$/)) {
        buffer += event.key.toLowerCase();

        // Keep only last N characters (length of target word)
        if (buffer.length > targetSequence.length) {
          buffer = buffer.slice(-targetSequence.length);
        }

        // Check if sequence matches
        if (buffer === targetSequence) {
          callback();
          buffer = ""; // Reset after trigger
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [callback]);
}
