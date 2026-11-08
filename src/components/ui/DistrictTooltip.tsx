"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMapStore } from "@/store/mapStore";
import { useTranslation } from "@/hooks/useTranslation";
import { localizeName } from "@/lib/i18n";

export function DistrictTooltip() {
  const { locale, t } = useTranslation();
  const highlightedCode = useMapStore((s) => s.highlightedCode);
  const districts = useMapStore((s) => s.districts);
  const selectedUpazilaCode = useMapStore((s) => s.selectedUpazilaCode);
  const gaibandhaUpazilas = useMapStore((s) => s.gaibandhaUpazilas);
  const view = useMapStore((s) => s.view);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  let label: string | null = null;
  let sub: string | null = null;

  if (view !== "bangladesh" && !selectedUpazilaCode) {
    const upazila = gaibandhaUpazilas?.features.find(
      (u) => u.id === highlightedCode
    );
    if (upazila) {
      label = localizeName(upazila.properties.name, locale);
      sub = t("tooltip.upazila");
    }
  } else if (view === "bangladesh") {
    const district = districts?.features.find((f) => f.id === highlightedCode);
    if (district) {
      label = localizeName(district.properties.name, locale);
      sub = localizeName(district.properties.division, locale);
    }
  }

  return (
    <AnimatePresence>
      {label && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.16 }}
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[135%]"
          style={{ left: pos.x, top: pos.y }}
        >
          <div className="whitespace-nowrap rounded-lg border border-cyan-400/30 bg-[#030817]/90 px-3 py-1.5 shadow-[0_10px_40px_-10px_rgba(34,211,238,0.4)] backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
              {label}
            </p>
            <p className="text-[8px] uppercase tracking-[0.3em] text-cyan-300/60">
              {sub}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
