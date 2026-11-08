"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { useMapStore } from "@/store/mapStore";
import { UPAZILA_INFO } from "@/data/upazila-info";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { localizeName } from "@/lib/i18n";

interface UpazilaMascotProps {
  onClose: () => void;
}

export function UpazilaMascot({ onClose }: UpazilaMascotProps) {
  const { locale, t } = useTranslation();

  const selectedUpazilaCode = useMapStore((s) => s.selectedUpazilaCode);
  const upazilas = useMapStore((s) => s.gaibandhaUpazilas);

  const feature = upazilas?.features.find((f) => f.id === selectedUpazilaCode);
  const name = feature?.properties.name ?? null;
  const displayName = name ? localizeName(name, locale) : null;
  const info = name ? UPAZILA_INFO[name] : null;
  const description =
    info && locale === "bn" ? info.descriptionBn : info?.description;

  useEffect(() => {
    if (!name) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [name, onClose]);

  return (
    <AnimatePresence>
      {name && (
        <motion.div
          key={selectedUpazilaCode}
          role="region"
          aria-label={`${displayName} ${t("upazila.guide")}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
        >
          {/* Soft edge fades keep the HUD readable without hiding the map */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#02040c]/85 via-[#02040c]/45 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#02040c]/75 to-transparent" />

          {/* Header */}
          <div className="absolute inset-x-0 top-0 z-20 px-4 pt-4 sm:px-8 sm:pt-6">
            <div className="flex items-start justify-between">
              <button
                type="button"
                onClick={onClose}
                className="pointer-events-auto flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[9px] uppercase tracking-[0.24em] text-white/55 backdrop-blur-md transition-colors hover:border-cyan-300/40 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {localizeName("Gaibandha", locale)}
                </span>
              </button>

              <div className="pointer-events-auto flex items-center gap-2">
                <LanguageToggle className="hidden sm:flex" />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t("upazila.close")}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 backdrop-blur-md transition-colors hover:border-cyan-300/40 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.12,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="pointer-events-none absolute left-1/2 top-4 w-[58%] -translate-x-1/2 text-center sm:top-6"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="h-1 w-1 rounded-full bg-cyan-300" />
                <span className="text-[8px] uppercase tracking-[0.42em] text-cyan-200/60 sm:text-[9px]">
                  {t("upazila.guide")}
                </span>
              </div>
              <h2 className="mt-1 truncate text-lg font-medium uppercase tracking-[0.14em] text-white sm:text-2xl">
                {displayName}
              </h2>
              <p className="mt-1 hidden text-[10px] uppercase tracking-[0.3em] text-white/35 sm:block">
                {localizeName("Gaibandha", locale)} ·{" "}
                {localizeName("Rangpur", locale)}
              </p>
            </motion.div>
          </div>

          {/* Loading hint while the robot and icons are emerging */}
          <div className="pointer-events-none absolute inset-x-0 bottom-5 flex flex-col items-center">
            <p className="text-center text-[10px] uppercase tracking-[0.3em] text-white/45">
              {t("upazila.tapHint")}
            </p>
            {info && (
              <p className="mt-1.5 hidden text-[9px] uppercase tracking-[0.24em] text-white/25 sm:block">
                {info.area} · {info.population} {t("upazila.people")} ·{" "}
                {info.unions} {t("upazila.unions")} · {info.villages}{" "}
                {t("upazila.villages")}
              </p>
            )}
          </div>

          {/* About card (wide screens) */}
          {info && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="pointer-events-none absolute left-8 top-1/2 hidden w-[260px] -translate-y-1/2 rounded-2xl border border-white/10 bg-[#040f24]/70 p-4 backdrop-blur-xl xl:block"
              style={{ boxShadow: "0 24px 60px -24px rgba(0,0,0,0.8)" }}
            >
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-amber-300" />
                <span className="text-[9px] uppercase tracking-[0.36em] text-amber-200/70">
                  {t("upazila.about")}
                </span>
              </div>
              <h3 className="mt-2 text-base font-medium uppercase tracking-[0.12em] text-white">
                {displayName}
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-white/50">
                {description}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Stat label={t("upazila.area")} value={info.area} />
                <Stat label={t("upazila.population")} value={info.population} />
                <Stat label={t("upazila.unions")} value={String(info.unions)} />
                <Stat
                  label={t("upazila.villages")}
                  value={String(info.villages)}
                />
              </div>
            </motion.aside>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1.5">
      <div className="text-[7px] uppercase tracking-[0.22em] text-white/30">
        {label}
      </div>
      <div className="mt-0.5 text-[11px] font-medium text-white/80">{value}</div>
    </div>
  );
}
