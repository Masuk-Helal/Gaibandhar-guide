"use client";

import { Search, Menu } from "lucide-react";
import { useMapStore } from "@/store/mapStore";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export function Navbar() {
  const { view, setView } = useMapStore();
  const { t } = useTranslation();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="pointer-events-auto mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          <div className="leading-none">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.42em] text-white/90">
              {t("nav.brandTop")}
            </span>
            <span className="mt-1 block text-[9px] uppercase tracking-[0.5em] text-cyan-300/60">
              {t("nav.brandBottom")}
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            { label: t("nav.explore"), action: () => setView("bangladesh") },
            { label: t("nav.districts"), action: () => setView("bangladesh") },
            { label: t("nav.about"), action: () => {} },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="group relative text-[11px] uppercase tracking-[0.28em] text-white/45 transition-colors hover:text-white"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-cyan-400/70 transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button
            aria-label={t("nav.searchDistricts")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 backdrop-blur-md transition hover:border-cyan-400/40 hover:text-cyan-300"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label={t("nav.menu")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 backdrop-blur-md transition hover:border-cyan-400/40 hover:text-cyan-300 md:hidden"
          >
            <Menu className="h-3.5 w-3.5" />
          </button>
          <span className="ml-2 hidden text-[10px] uppercase tracking-[0.3em] text-white/30 sm:block">
            {view === "bangladesh"
              ? t("nav.nationalView")
              : view === "gaibandha"
                ? t("nav.gaibandha")
                : t("nav.upazilas")}
          </span>
        </div>
      </div>
    </header>
  );
}
