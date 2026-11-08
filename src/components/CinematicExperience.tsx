"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { LocationPanel } from "@/components/ui/LocationPanel";
import { DistrictTooltip } from "@/components/ui/DistrictTooltip";
import { DestinationHint } from "@/components/ui/DestinationHint";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { IntroOverlay } from "@/components/ui/IntroOverlay";
import { Atmosphere } from "@/components/ui/Atmosphere";
import { UpazilaNav } from "@/components/ui/UpazilaPanel";
import { UpazilaMascot } from "@/components/ui/UpazilaMascot";
import { MapControls } from "@/components/map/MapControls";
import { BangladeshMap, type MapApi } from "@/components/map/BangladeshMap";
import { useMapStore } from "@/store/mapStore";
import { useTranslation } from "@/hooks/useTranslation";

export function CinematicExperience() {
  const bgRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const skipRef = useRef<HTMLButtonElement | null>(null);
  const mapApiRef = useRef<MapApi | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const { t } = useTranslation();

  const dataLoaded = useMapStore((s) => s.dataLoaded);
  const introComplete = useMapStore((s) => s.introComplete);
  const introSkipped = useMapStore((s) => s.introSkipped);
  const view = useMapStore((s) => s.view);
  const selectedUpazilaCode = useMapStore((s) => s.selectedUpazilaCode);
  const boundariesVisible = useMapStore((s) => s.boundariesVisible);
  const toggleBoundaries = useMapStore((s) => s.toggleBoundaries);

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  }, []);

  const overlayVisible = !introComplete && !introSkipped;
  const isGaibandhaView = view !== "bangladesh";

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#02040c]">
      {/* Background atmosphere — animated by the intro timeline */}
      <div ref={bgRef} className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#061a38_0%,#040f24_44%,#02040c_100%)]" />
        <div className="absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(12,74,110,0.16)_0%,transparent_60%)] blur-2xl" />
        <div className="absolute -right-24 top-1/3 h-[46vmin] w-[46vmin] rounded-full bg-[radial-gradient(circle,rgba(252,211,77,0.06)_0%,transparent_65%)] blur-2xl" />
        <Atmosphere />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_50%,transparent_58%,rgba(0,0,0,0.72)_100%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(120,200,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(120,200,255,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(circle at 50% 45%, black 0%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(circle at 50% 45%, black 0%, transparent 72%)",
          }}
        />
      </div>

      <Navbar />

      {/* The map */}
      <BangladeshMap
        ref={mapApiRef}
        introRefs={{
          bg: bgRef,
          heading: headingRef,
          subtitle: subtitleRef,
          skipBtn: skipRef,
        }}
      />

      {/* Backdrop that dims the map while the service bot is on stage */}
      <AnimatePresence>
        {selectedUpazilaCode && view !== "bangladesh" && (
          <motion.div
            key="mascot-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto fixed inset-0 z-20 cursor-default bg-[radial-gradient(120%_120%_at_50%_42%,rgba(2,4,12,0.32)_0%,rgba(2,4,12,0.74)_100%)]"
            aria-hidden
          />
        )}
      </AnimatePresence>

      <IntroOverlay
        headingRef={headingRef}
        subtitleRef={subtitleRef}
        skipRef={skipRef}
        visible={overlayVisible}
      />

      <AnimatePresence>
        {introComplete && !selectedUpazilaCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <LocationPanel />
          </motion.div>
        )}
      </AnimatePresence>

      <UpazilaMascot
        onClose={() => {
          useMapStore.getState().selectUpazila(null);
          useMapStore.getState().setHighlight(null);
          mapApiRef.current?.zoomToGaibandha();
        }}
      />

      {isGaibandhaView && !selectedUpazilaCode && (
        <UpazilaNav
          onSelect={(code) => mapApiRef.current?.selectUpazila(code)}
        />
      )}

      <DistrictTooltip />

      <DestinationHint />

      <MapControls
        onZoomIn={() => mapApiRef.current?.zoomIn()}
        onZoomOut={() => mapApiRef.current?.zoomOut()}
        onReset={() => mapApiRef.current?.resetView()}
        onToggleBoundaries={toggleBoundaries}
        onToggleFullscreen={toggleFullscreen}
        boundariesVisible={boundariesVisible}
        isFullscreen={isFullscreen}
      />

      {/* Bottom cinematic indicator */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-5 z-20 flex justify-center px-4 sm:bottom-7"
        style={{
          opacity: introComplete && !isGaibandhaView ? 1 : 0,
          transition: "opacity 700ms ease",
          transform: "translateZ(0)",
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={view === "bangladesh" ? "bd" : "gb"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-1.5 backdrop-blur-md"
            >
              <span className="font-mono text-[10px] tracking-[0.2em] text-cyan-300/80">
                {view === "bangladesh" ? "01 / 64" : "07 / 07"}
              </span>
              <span className="h-3 w-px bg-white/15" />
              <span className="text-[9px] uppercase tracking-[0.34em] text-white/45">
                {view === "bangladesh"
                  ? t("bottom.districts")
                  : t("bottom.upazilas")}
              </span>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.26em] text-white/25">
            <span className="hidden sm:inline">
              {view === "bangladesh"
                ? t("bottom.hoverHint")
                : t("bottom.selectHint")}
            </span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/15">
              <MoveRight className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
      </div>

      <LoadingScreen visible={!dataLoaded} label={t("loading.initializing")} />
    </main>
  );
}
