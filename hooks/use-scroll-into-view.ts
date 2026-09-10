"use client";

import { useEffect, useRef } from "react";

/**
 * Brings an element into view once, when it appears.
 *
 * Submitting one of the long forms swaps it for a short confirmation panel.
 * The page suddenly gets much shorter while the scroll position stays put, so
 * the viewport ends up below the new content and the page appears to lurch
 * downwards. Scrolling the panel into view puts the confirmation where the
 * form the customer was just looking at used to be.
 */
export function useScrollIntoView<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    ref.current.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  }, [active]);

  return ref;
}
