"use client";

import { useCallback } from "react";
import { useMapStore } from "@/store/mapStore";
import { GAIBANDHA_CODE } from "@/types/geography";

interface SelectionHandlers {
  zoomToDistrict: (code: string) => void;
  selectUpazila: (code: string) => void;
}

export function useDistrictSelection({
  zoomToDistrict,
  selectUpazila,
}: SelectionHandlers) {
  const selectDistrict = useMapStore((s) => s.selectDistrict);
  const storeSelectUpazila = useMapStore((s) => s.selectUpazila);
  const setView = useMapStore((s) => s.setView);
  const setHighlight = useMapStore((s) => s.setHighlight);

  const handleDistrictClick = useCallback(
    (code: string) => {
      selectDistrict(code);
      if (code === GAIBANDHA_CODE) {
        setView("gaibandha");
        zoomToDistrict(code);
      }
    },
    [selectDistrict, setView, zoomToDistrict]
  );

  const handleDistrictHover = useCallback(
    (code: string | null) => setHighlight(code),
    [setHighlight]
  );

  const handleUpazilaClick = useCallback(
    (code: string | null) => {
      if (!code) {
        storeSelectUpazila(null);
        return;
      }
      selectUpazila(code);
    },
    [storeSelectUpazila, selectUpazila]
  );

  return { handleDistrictClick, handleDistrictHover, handleUpazilaClick };
}
