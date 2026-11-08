"use client";

import { create } from "zustand";

type Phase = "idle" | "loading" | "reveal" | "error";

interface DetailTransitionState {
  phase: Phase;
  target: string | null;
  source: string | null;
  startedAt: number;
  ready: boolean;
  error: string | null;
  start: (target: string, source: string) => boolean;
  markReady: (pathname: string) => void;
  reveal: () => void;
  fail: (message?: string) => void;
  reset: () => void;
}

const initial = {
  phase: "idle" as Phase,
  target: null,
  source: null,
  startedAt: 0,
  ready: false,
  error: null,
};

export const useDetailTransitionStore = create<DetailTransitionState>(
  (set, get) => ({
    ...initial,
    start: (target, source) => {
      const current = get().phase;
      if (current === "loading" || current === "reveal") return false;
      set({
        phase: "loading",
        target,
        source,
        startedAt: Date.now(),
        ready: false,
        error: null,
      });
      return true;
    },
    markReady: (pathname) => {
      if (
        get().phase === "loading" &&
        get().target?.split("?")[0] === pathname
      ) {
        set({ ready: true });
      }
    },
    reveal: () =>
      set((state) => (state.phase === "loading" ? { phase: "reveal" } : {})),
    fail: (message) =>
      set((state) =>
        state.phase === "loading" || state.phase === "reveal"
          ? { phase: "error", error: message ?? null }
          : {}
      ),
    reset: () => set(initial),
  })
);
