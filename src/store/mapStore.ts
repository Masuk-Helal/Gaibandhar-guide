import { create } from "zustand";
import type { MapStoreState } from "@/types/geography";

const DEFAULT_CAMERA = { scale: 1, x: 0, y: 0 };

export const useMapStore = create<MapStoreState>((set) => ({
  districts: null,
  gaibandhaDistrict: null,
  gaibandhaUpazilas: null,
  dataLoaded: false,
  dataLoading: true,

  view: "bangladesh",
  selectedDistrictCode: null,
  selectedUpazilaCode: null,
  highlightedCode: null,

  camera: { ...DEFAULT_CAMERA },
  animating: false,

  introPlayed: false,
  introSkipped: false,
  introComplete: false,

  boundariesVisible: true,
  toggleBoundaries: () => set((s) => ({ boundariesVisible: !s.boundariesVisible })),

  setDistricts: (d) => set({ districts: d }),
  setGaibandha: (g) => set({ gaibandhaDistrict: g }),
  setGaibandhaUpazilas: (u) => set({ gaibandhaUpazilas: u }),
  setDataLoaded: (v) => set({ dataLoaded: v, dataLoading: !v }),
  setView: (v) => set({ view: v }),
  selectDistrict: (code) => set({ selectedDistrictCode: code }),
  selectUpazila: (code) => set({ selectedUpazilaCode: code }),
  setHighlight: (code) => set({ highlightedCode: code }),
  setCamera: (c) => set((s) => ({ camera: { ...s.camera, ...c } })),
  setAnimating: (v) => set({ animating: v }),
  setIntroPlayed: (v) => set({ introPlayed: v }),
  setIntroSkipped: () => set({ introSkipped: true, introPlayed: true }),
  setIntroComplete: () => set({ introComplete: true, introPlayed: true }),
  resetView: () =>
    set({
      view: "bangladesh",
      selectedDistrictCode: null,
      selectedUpazilaCode: null,
      highlightedCode: null,
      camera: { ...DEFAULT_CAMERA },
      animating: false,
    }),
}));
