"use client";

import { useCallback, useEffect, useRef } from "react";
import type { GeoPath } from "d3-geo";
import { useMapStore } from "@/store/mapStore";
import {
  animateCamera,
  applyCamera,
  cameraForProjectedBBox,
} from "@/components/animation/MapTransitions";
import { GAIBANDHA_CODE, type CameraState } from "@/types/geography";

interface Options {
  mapGroupRef: React.RefObject<SVGGElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  pathRef: React.RefObject<GeoPath | null>;
}

export interface MapCameraApi {
  cameraRef: React.RefObject<CameraState>;
  zoomToDistrict: (code: string) => void;
  selectUpazila: (code: string) => void;
  zoomThroughUpazila: (code: string) => void;
  refitToDistrict: (code: string) => void;
  refitToUpazila: (code: string) => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export function useMapAnimation({ mapGroupRef, containerRef, pathRef }: Options): MapCameraApi {
  const cameraRef = useRef<CameraState>({ scale: 1, x: 0, y: 0 });

  // Load geodata once
  useEffect(() => {
    const state = useMapStore.getState();
    if (state.dataLoaded) return;
    let cancelled = false;
    useMapStore.setState({ dataLoading: true });

    Promise.all([
      fetch("/data/bangladesh-districts.json").then((r) => r.json()),
      fetch("/data/gaibandha-district.json").then((r) => r.json()),
      fetch("/data/gaibandha-upazilas.json").then((r) => r.json()),
    ])
      .then(([districts, gaibandha, upazilas]) => {
        if (cancelled) return;
        const st = useMapStore.getState();
        st.setDistricts(districts);
        st.setGaibandha(gaibandha);
        st.setGaibandhaUpazilas(upazilas);
        st.setDataLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load geographical data", err);
        if (!cancelled) useMapStore.getState().setDataLoaded(true);
      });

    return () => { cancelled = true; };
  }, []);

  const zoomToDistrict = useCallback(
    (code: string) => {
      const state = useMapStore.getState();
      const feature = state.districts?.features.find((f) => f.id === code);
      const path = pathRef.current;
      const el = containerRef.current;
      if (!feature || !path || !el) return;

      const [[x0, y0], [x1, y1]] = path.bounds(feature as never);
      const pad = Math.round(Math.min(96, Math.min(el.clientWidth, el.clientHeight) * 0.12));
      const target = cameraForProjectedBBox({ x0, y0, x1, y1 }, el.clientWidth, el.clientHeight, pad);

      state.setAnimating(true);
      animateCamera(
        mapGroupRef.current,
        cameraRef.current,
        target,
        2.4,
        (c) => {
          cameraRef.current = c;
          useMapStore.getState().setCamera(c);
        },
        () => {
          cameraRef.current = target;
          const st = useMapStore.getState();
          st.setAnimating(false);
          st.setView("gaibandha");
        }
      );
    },
    [containerRef, mapGroupRef, pathRef]
  );

  const selectUpazila = useCallback((code: string) => {
    const state = useMapStore.getState();
    const feature = state.gaibandhaUpazilas?.features.find((f) => f.id === code);
    if (!feature) return;

    state.selectUpazila(code);
    state.setView("gaibandha");
  }, []);

  const zoomThroughUpazila = useCallback(
    (code: string) => {
      const state = useMapStore.getState();
      const feature = state.gaibandhaUpazilas?.features.find(
        (f) => f.id === code
      );
      const path = pathRef.current;
      const el = containerRef.current;
      if (!feature || !path || !el) return;

      const [[x0, y0], [x1, y1]] = path.bounds(feature as never);
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const halfW = Math.max((x1 - x0) * 0.28, 1);
      const halfH = Math.max((y1 - y0) * 0.28, 1);
      const target = cameraForProjectedBBox(
        {
          x0: cx - halfW,
          y0: cy - halfH,
          x1: cx + halfW,
          y1: cy + halfH,
        },
        el.clientWidth,
        el.clientHeight,
        16,
        120
      );

      animateCamera(
        mapGroupRef.current,
        cameraRef.current,
        target,
        1.15,
        (c) => {
          cameraRef.current = c;
          useMapStore.getState().setCamera(c);
        }
      );
    },
    [containerRef, mapGroupRef, pathRef]
  );

  const refitToDistrict = useCallback(
    (code: string) => {
      const feature = useMapStore
        .getState()
        .districts?.features.find((f) => f.id === code);
      const path = pathRef.current;
      const el = containerRef.current;
      if (!feature || !path || !el) return;
      const [[x0, y0], [x1, y1]] = path.bounds(feature as never);
      const pad = Math.round(
        Math.min(96, Math.min(el.clientWidth, el.clientHeight) * 0.12)
      );
      const target = cameraForProjectedBBox(
        { x0, y0, x1, y1 },
        el.clientWidth,
        el.clientHeight,
        pad
      );
      cameraRef.current = target;
      applyCamera(mapGroupRef.current, target);
      useMapStore.getState().setCamera(target);
    },
    [containerRef, mapGroupRef, pathRef]
  );

  const refitToUpazila = useCallback(
    (code: string) => {
      const feature = useMapStore
        .getState()
        .gaibandhaUpazilas?.features.find((f) => f.id === code);
      const path = pathRef.current;
      const el = containerRef.current;
      if (!feature || !path || !el) return;
      const [[x0, y0], [x1, y1]] = path.bounds(feature as never);
      const pad = Math.round(
        Math.min(120, Math.min(el.clientWidth, el.clientHeight) * 0.15)
      );
      const target = cameraForProjectedBBox(
        { x0, y0, x1, y1 },
        el.clientWidth,
        el.clientHeight,
        pad,
        42
      );
      cameraRef.current = target;
      applyCamera(mapGroupRef.current, target);
      useMapStore.getState().setCamera(target);
    },
    [containerRef, mapGroupRef, pathRef]
  );

  const resetView = useCallback(() => {
    useMapStore.getState().setAnimating(true);
    animateCamera(
      mapGroupRef.current,
      cameraRef.current,
      { scale: 1, x: 0, y: 0 },
      1.6,
      (c) => { cameraRef.current = c; },
      () => {
        cameraRef.current = { scale: 1, x: 0, y: 0 };
        const st = useMapStore.getState();
        st.resetView();
        st.setAnimating(false);
      }
    );
  }, [mapGroupRef]);

  const zoomBy = useCallback(
    (factor: number) => {
      const el = containerRef.current;
      if (!el) return;
      const c = cameraRef.current;
      const next = Math.max(1, Math.min(c.scale * factor, 18));
      const cx = el.clientWidth / 2;
      const cy = el.clientHeight / 2;
      const x = cx - (next / c.scale) * (cx - c.x);
      const y = cy - (next / c.scale) * (cy - c.y);
      animateCamera(mapGroupRef.current, c, { scale: next, x, y }, 0.55, (cc) => {
        cameraRef.current = cc;
        useMapStore.getState().setCamera(cc);
      });
      if (next <= 1.02) {
        useMapStore.getState().setView("bangladesh");
      }
    },
    [containerRef, mapGroupRef]
  );

  return {
    cameraRef,
    zoomToDistrict,
    selectUpazila,
    zoomThroughUpazila,
    refitToDistrict,
    refitToUpazila,
    resetView,
    zoomIn: () => zoomBy(1.55),
    zoomOut: () => zoomBy(1 / 1.55),
  };
}

export { GAIBANDHA_CODE };
