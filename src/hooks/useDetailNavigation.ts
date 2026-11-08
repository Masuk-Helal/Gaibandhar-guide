"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDetailTransitionStore } from "@/store/detailTransitionStore";

/**
 * Navigates from a listing (or another detail page) into a detail page using
 * the shared branded loading transition. Falls back to instant navigation
 * when the visitor prefers reduced motion.
 */
export function useDetailNavigation() {
  const router = useRouter();
  const start = useDetailTransitionStore((state) => state.start);

  return useCallback(
    (href: string) => {
      if (typeof window !== "undefined") {
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        if (reduce) {
          router.push(href);
          return;
        }
      }

      const source =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "";

      if (!start(href, source)) {
        router.push(href);
        return;
      }
      router.prefetch(href);
      router.push(href);
    },
    [router, start]
  );
}
