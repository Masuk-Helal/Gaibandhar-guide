"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Layers, Compass } from "lucide-react";
import { useMapStore } from "@/store/mapStore";
import { useTranslation } from "@/hooks/useTranslation";
import { localizeName } from "@/lib/i18n";

function Row({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 text-cyan-300/70">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">{label}</p>
        <p
          className={
            accent
              ? "mt-0.5 truncate text-sm font-semibold uppercase tracking-[0.14em] text-amber-300"
              : "mt-0.5 truncate text-sm font-medium uppercase tracking-[0.14em] text-white/85"
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function LocationPanel() {
  const { view, selectedDistrictCode } = useMapStore();
  const { locale, t } = useTranslation();
  const isGaibandha = view !== "bangladesh";

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key={isGaibandha ? "gaibandha" : "bangladesh"}
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto fixed left-4 top-20 z-30 w-[200px] rounded-2xl border border-white/10 bg-white/[0.035] p-3 backdrop-blur-xl sm:left-8 sm:top-24 sm:w-[248px] sm:p-4"
        style={{ boxShadow: "0 24px 60px -24px rgba(0,0,0,0.8)" }}
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-cyan-400" />
          <span className="text-[9px] uppercase tracking-[0.4em] text-cyan-300/70">
            {isGaibandha
              ? t("panel.districtProfile")
              : t("panel.location")}
          </span>
        </div>

        {!isGaibandha ? (
          <>
            <Row
              icon={<MapPin className="h-4 w-4" />}
              label={t("panel.currentLocation")}
              value={localizeName("Bangladesh", locale)}
            />
            <Row
              icon={<Layers className="h-4 w-4" />}
              label={t("panel.totalDistricts")}
              value="64"
            />
            <Row
              icon={<MapPin className="h-4 w-4" />}
              label={t("panel.selectedDistrict")}
              value={localizeName("Gaibandha", locale)}
              accent
            />
            <Row
              icon={<Compass className="h-4 w-4" />}
              label={t("panel.division")}
              value={localizeName("Rangpur", locale)}
            />
          </>
        ) : (
          <>
            <Row
              icon={<MapPin className="h-4 w-4" />}
              label={t("panel.district")}
              value={localizeName("Gaibandha", locale)}
              accent
            />
            <Row
              icon={<Compass className="h-4 w-4" />}
              label={t("panel.division")}
              value={localizeName("Rangpur", locale)}
            />
            <Row
              icon={<Layers className="h-4 w-4" />}
              label={t("panel.totalUpazilas")}
              value="7"
            />
            <div className="mt-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
              <p className="text-[9px] uppercase tracking-[0.28em] text-white/30">
                {t("panel.coordinates")}
              </p>
              <p className="mt-1 font-mono text-[11px] text-cyan-300/80">25.30° N · 89.53° E</p>
            </div>
          </>
        )}

        {selectedDistrictCode && !isGaibandha && (
          <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-white/25">
            {t("panel.selectedCode")} · {selectedDistrictCode}
          </p>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}
