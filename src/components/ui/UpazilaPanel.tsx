"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { useMapStore } from "@/store/mapStore";
import { UPAZILA_INFO } from "@/data/upazila-info";
import { useTranslation } from "@/hooks/useTranslation";
import { localizeName } from "@/lib/i18n";

interface UpazilaPanelProps {
  onBack?: () => void;
}

export function UpazilaPanel({ onBack }: UpazilaPanelProps) {
  const { selectedUpazilaCode, gaibandhaUpazilas } = useMapStore();
  const { locale, t } = useTranslation();
  const feature = gaibandhaUpazilas?.features.find(
    (u) => u.id === selectedUpazilaCode
  );
  const name = feature?.properties.name ?? null;
  const info = name ? UPAZILA_INFO[name] : null;
  const displayName = name ? localizeName(name, locale) : null;
  const description =
    info && locale === "bn" ? info.descriptionBn : info?.description;

  return (
    <AnimatePresence mode="wait">
      {name && info && (
        <motion.div
          key={name}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto fixed bottom-24 right-4 z-30 w-[240px] rounded-2xl border border-white/10 bg-white/[0.035] p-3 backdrop-blur-xl sm:bottom-auto sm:right-8 sm:top-24 sm:w-[280px] sm:p-4"
          style={{ boxShadow: "0 24px 60px -24px rgba(0,0,0,0.8)" }}
        >
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-[9px] uppercase tracking-[0.36em] text-amber-200/70">
              {t("upazila.label")}
            </span>
          </div>
          <h3 className="text-lg font-medium uppercase tracking-[0.12em] text-white">
            {displayName}
          </h3>
          <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-cyan-300/60">
            {localizeName("Gaibandha", locale)} · {localizeName("Rangpur", locale)}
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-white/50">
            {description}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat label={t("upazila.area")} value={info.area} />
            <Stat label={t("upazila.population")} value={info.population} />
            <Stat label={t("upazila.unions")} value={String(info.unions)} />
            <Stat label={t("upazila.villages")} value={String(info.villages)} />
          </div>

          <div className="mt-3 flex items-center justify-between">
            {onBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.22em] text-white/35 transition-colors hover:text-white/75"
              >
                <ArrowLeft className="h-3 w-3" />
                {localizeName("Gaibandha", locale)}
              </button>
            ) : (
              <span />
            )}
            <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.22em] text-white/25">
              <ArrowRight className="h-3 w-3" />
              {t("upazila.selectAnother")}
            </span>
          </div>
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

interface UpazilaNavProps {
  onSelect: (code: string) => void;
}

export function UpazilaNav({ onSelect }: UpazilaNavProps) {
  const {
    gaibandhaUpazilas,
    selectedUpazilaCode,
    setView,
    highlightedCode,
    setHighlight,
  } = useMapStore();
  const { locale } = useTranslation();

  const show = gaibandhaUpazilas;
  if (!show) return null;

  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 sm:bottom-6">
      <div className="max-w-full overflow-x-auto">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] p-1.5 backdrop-blur-xl">
          {show.features.map((u, i) => {
            const active =
              selectedUpazilaCode === u.id || highlightedCode === u.id;
            return (
              <button
                key={u.id}
                onClick={() => {
                  setView("upazila");
                  onSelect(u.id);
                }}
                onPointerEnter={() => setHighlight(u.id)}
                onPointerLeave={() => setHighlight(null)}
                className={
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] transition-colors " +
                  (active
                    ? "bg-amber-300/15 text-amber-200"
                    : "text-white/40 hover:text-white/80")
                }
              >
                <span className="mr-1.5 font-mono text-[8px] text-white/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {localizeName(u.properties.name, locale)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
