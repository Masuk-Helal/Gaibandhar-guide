"use client";

import { create } from "zustand";

interface Origin {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TransitionState {
  active: boolean;
  origin: Origin | null;
  color: string;
  phase: "idle" | "expand" | "fade" | "done";
  start: (origin: Origin, color: string) => void;
  setPhase: (phase: TransitionState["phase"]) => void;
  reset: () => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
  active: false,
  origin: null,
  color: "#22d3ee",
  phase: "idle",
  start: (origin, color) => set({ active: true, origin, color, phase: "expand" }),
  setPhase: (phase) => set({ phase }),
  reset: () => set({ active: false, origin: null, phase: "idle" }),
}));
