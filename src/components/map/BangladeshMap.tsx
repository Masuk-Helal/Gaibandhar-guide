"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { geoIdentity, geoPath } from "d3-geo";
import { gsap } from "gsap";
import { AnimatePresence } from "framer-motion";
import { useMapStore } from "@/store/mapStore";
import { useMapAnimation } from "@/hooks/useMapAnimation";
import { useDistrictSelection } from "@/hooks/useDistrictSelection";
import { createIntroTimeline, destroyIntroTimeline } from "@/components/animation/IntroTimeline";
import { GAIBANDHA_CODE } from "@/types/geography";
import { useTranslation } from "@/hooks/useTranslation";
import { MapCamera } from "./MapCamera";
import { DistrictLayer } from "./DistrictLayer";
import { GaibandhaLayer } from "./GaibandhaLayer";
import { UpazilaLayer } from "./UpazilaLayer";
import { UpazilaRobotStage } from "./UpazilaRobotStage";

export interface MapApi {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  zoomToGaibandha: () => void;
  selectUpazila: (code: string) => void;
  zoomThroughUpazila: (code: string) => void;
}

export interface IntroDomRefs {
  bg: React.RefObject<HTMLDivElement | null>;
  heading: React.RefObject<HTMLHeadingElement | null>;
  subtitle: React.RefObject<HTMLParagraphElement | null>;
  skipBtn: React.RefObject<HTMLButtonElement | null>;
}

interface BangladeshMapProps {
  introRefs: IntroDomRefs;
}

export const BangladeshMap = forwardRef<MapApi, BangladeshMapProps>(
  function BangladeshMap({ introRefs }, ref) {
    const { locale, t } = useTranslation();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapGroupRef = useRef<SVGGElement | null>(null);
    const pathRef = useRef<ReturnType<typeof geoPath> | null>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const introStarted = useRef(false);
    const upazilaReveal = useRef(false);

    const [size, setSize] = useState({ w: 1200, h: 800 });

    const districts = useMapStore((s) => s.districts);
    const gaibandhaDistrict = useMapStore((s) => s.gaibandhaDistrict);
    const upazilas = useMapStore((s) => s.gaibandhaUpazilas);
    const view = useMapStore((s) => s.view);
    const highlightedCode = useMapStore((s) => s.highlightedCode);
    const selectedDistrictCode = useMapStore((s) => s.selectedDistrictCode);
    const selectedUpazilaCode = useMapStore((s) => s.selectedUpazilaCode);
    const boundariesVisible = useMapStore((s) => s.boundariesVisible);
    const dataLoaded = useMapStore((s) => s.dataLoaded);
    const animating = useMapStore((s) => s.animating);

    const camera = useMapAnimation({ mapGroupRef, containerRef, pathRef });
    const { handleDistrictClick, handleDistrictHover, handleUpazilaClick } =
      useDistrictSelection({
        zoomToDistrict: camera.zoomToDistrict,
        selectUpazila: camera.selectUpazila,
      });

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const ro = new ResizeObserver((entries) => {
        const cr = entries[0].contentRect;
        if (cr.width > 0 && cr.height > 0) {
          setSize({ w: Math.round(cr.width), h: Math.round(cr.height) });
        }
      });
      ro.observe(el);
      setSize({ w: el.clientWidth || 1200, h: el.clientHeight || 800 });
      return () => ro.disconnect();
    }, []);

    const geoPathGen = useMemo(() => {
      if (!districts) return null;
      const padX = Math.min(64, size.w * 0.08);
      const padTop = Math.min(96, size.h * 0.12);
      const padBottom = Math.min(96, size.h * 0.12);
      // Planar fitted projection: avoids spherical winding ambiguities between
      // datasets (geoBoundaries vs GADM) while staying accurate at this scale.
      const projection = geoIdentity()
        .reflectY(true)
        .fitExtent(
          [
            [padX, padTop],
            [
              Math.max(size.w - padX, padX + 1),
              Math.max(size.h - padBottom, padTop + 1),
            ],
          ],
          districts as unknown as GeoJSON.FeatureCollection
        );
      return geoPath(projection);
    }, [districts, size.w, size.h]);

    useEffect(() => {
      pathRef.current = geoPathGen;
    }, [geoPathGen]);

    const gaibandhaFeature =
      districts?.features.find((f) => f.id === GAIBANDHA_CODE) ?? null;

    const selectedUpazilaFeature = useMemo(
      () =>
        upazilas?.features.find((f) => f.id === selectedUpazilaCode) ?? null,
      [upazilas, selectedUpazilaCode]
    );

    const selectedUpazilaCentroid = useMemo(() => {
      if (!geoPathGen || !selectedUpazilaFeature) return null;
      const c = geoPathGen.centroid(selectedUpazilaFeature as never);
      if (!Number.isFinite(c[0]) || !Number.isFinite(c[1])) return null;
      return [c[0], c[1]] as [number, number];
    }, [geoPathGen, selectedUpazilaFeature]);

    const centroid = useMemo(() => {
      if (!geoPathGen || !gaibandhaFeature) return null;
      const c = geoPathGen.centroid(gaibandhaFeature as never);
      return Number.isFinite(c[0]) ? c : null;
    }, [geoPathGen, gaibandhaFeature]);

    useEffect(() => {
      if (!districts || !gaibandhaDistrict || !geoPathGen || !containerRef.current)
        return;
      if (introStarted.current) return;

      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reducedMotion) {
        useMapStore.getState().setIntroComplete();
        return;
      }

      const raf = requestAnimationFrame(() => {
        if (introStarted.current) return;
        introStarted.current = true;
        const mapGroup = mapGroupRef.current;
        const districtPaths = Array.from(
          mapGroup?.querySelectorAll<SVGPathElement>("path.district") ?? []
        );
        const gaibandhaPath =
          mapGroup?.querySelector<SVGPathElement>("path.gaibandha") ?? null;
        const label = mapGroup?.querySelector<Element>(".gaibandha-label") ?? null;
        const marker =
          mapGroup?.querySelector<Element>(".gaibandha-marker") ?? null;

        if (districtPaths.length === 0) {
          useMapStore.getState().setIntroComplete();
          return;
        }

        const tl = createIntroTimeline(
          {
            container: containerRef.current,
            bg: introRefs.bg.current,
            heading: introRefs.heading.current,
            subtitle: introRefs.subtitle.current,
            skipBtn: introRefs.skipBtn.current,
            districtPaths,
            gaibandhaPath,
            label,
            marker,
          },
          {
            onComplete: () => {
              useMapStore.getState().setIntroComplete();
              camera.zoomToDistrict(GAIBANDHA_CODE);
            },
            onSkip: () => {
              districtPaths.forEach((p) => {
                p.style.strokeDasharray = "none";
                p.style.strokeDashoffset = "0";
                p.style.opacity = "1";
              });
              if (gaibandhaPath) {
                gaibandhaPath.style.strokeDasharray = "none";
                gaibandhaPath.style.strokeDashoffset = "0";
                gaibandhaPath.style.opacity = "1";
              }
              const st = useMapStore.getState();
              st.setIntroSkipped();
              st.setIntroComplete();
              st.setView("bangladesh");
            },
          }
        );
        tlRef.current = tl;
        tl.play();
        useMapStore.getState().setIntroPlayed(true);
      });

      return () => cancelAnimationFrame(raf);
      // Intentionally runs once per loaded dataset; refs and camera are stable at mount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [districts, gaibandhaDistrict, geoPathGen]);

    useEffect(() => {
      if (view === "bangladesh" || !upazilas || upazilaReveal.current) return;
      upazilaReveal.current = true;
      const raf = requestAnimationFrame(() => {
        const fills = Array.from(
          mapGroupRef.current?.querySelectorAll<SVGPathElement>(
            "path.upazila-fill"
          ) ?? []
        );
        const borders = Array.from(
          mapGroupRef.current?.querySelectorAll<SVGPathElement>(
            "path.upazila-border"
          ) ?? []
        );
        const labels = Array.from(
          mapGroupRef.current?.querySelectorAll<SVGGElement>(
            "g.upazila-label"
          ) ?? []
        );

        fills.forEach((p) => (p.style.opacity = "0"));
        labels.forEach((g) => (g.style.opacity = "0"));
        borders.forEach((p) => {
          let len = 1000;
          try {
            len = p.getTotalLength();
          } catch {
            /* ignore */
          }
          p.style.strokeDasharray = String(len);
          p.style.strokeDashoffset = String(len);
        });

        gsap.to(fills, {
          opacity: 1,
          duration: 1.1,
          stagger: 0.06,
          ease: "power2.out",
          delay: 0.1,
        });
        gsap.to(borders, {
          strokeDashoffset: 0,
          duration: 1.5,
          stagger: 0.06,
          ease: "power2.out",
          delay: 0.15,
        });
        gsap.to(labels, {
          opacity: 1,
          duration: 0.8,
          stagger: 0.06,
          ease: "power2.out",
          delay: 0.55,
        });
      });
      return () => cancelAnimationFrame(raf);
    }, [view, upazilas]);

    // Instantly re-fit the camera after a viewport resize so the map never
    // drifts off-screen (e.g. when rotating a phone or resizing a window).
    useEffect(() => {
      if (view === "gaibandha") {
        const t = setTimeout(() => camera.refitToDistrict(GAIBANDHA_CODE), 30);
        return () => clearTimeout(t);
      }
      if (view === "upazila" && selectedUpazilaCode) {
        const t = setTimeout(
          () => camera.refitToUpazila(selectedUpazilaCode),
          30
        );
        return () => clearTimeout(t);
      }
      // Only re-fit on viewport change; reading view/camera here is intentional.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size.w, size.h]);

    useEffect(() => {
      return () => destroyIntroTimeline(tlRef.current);
    }, []);

  useImperativeHandle(ref, () => ({
    zoomIn: camera.zoomIn,
    zoomOut: camera.zoomOut,
    resetView: camera.resetView,
    zoomToGaibandha: () => camera.zoomToDistrict(GAIBANDHA_CODE),
    selectUpazila: camera.selectUpazila,
    zoomThroughUpazila: camera.zoomThroughUpazila,
  }));

    const dimOthers = view !== "bangladesh";
    const showUpazilas = view !== "bangladesh" && !!upazilas;

    return (
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full"
        aria-label={t("map.aria")}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${size.w} ${size.h}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full select-none"
          role="img"
        >
          <defs>
            <radialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(252,211,77,0.9)" />
              <stop offset="100%" stopColor="rgba(252,211,77,0)" />
            </radialGradient>
          </defs>

          <MapCamera ref={mapGroupRef}>
            {geoPathGen && districts && boundariesVisible && (
              <DistrictLayer
                districts={districts}
                path={geoPathGen}
                visible={boundariesVisible}
                dimOthers={dimOthers}
                highlightCode={highlightedCode}
                selectedCode={selectedDistrictCode}
                onHover={handleDistrictHover}
                onClick={handleDistrictClick}
              />
            )}

            {geoPathGen && upazilas && (
              <UpazilaLayer
                upazilas={upazilas}
                path={geoPathGen}
                visible={showUpazilas}
                highlightCode={highlightedCode}
                selectedCode={selectedUpazilaCode}
                onHover={handleDistrictHover}
                onClick={handleUpazilaClick}
                locale={locale}
              />
            )}

            {geoPathGen && gaibandhaFeature && (
              <GaibandhaLayer
                feature={gaibandhaFeature}
                path={geoPathGen}
                active={view !== "bangladesh"}
              />
            )}

            {centroid && (
              <g
                className="gaibandha-marker"
                transform={`translate(${centroid[0]},${centroid[1]})`}
                style={{
                  opacity: view === "bangladesh" ? 1 : 0,
                  transition: "opacity 500ms ease",
                  pointerEvents: "none",
                }}
                aria-hidden
              >
                <circle r="26" fill="url(#markerGlow)" opacity="0.5" />
                <circle
                  r="6.5"
                  fill="none"
                  stroke="rgba(252,211,77,0.9)"
                  strokeWidth="1"
                />
                <circle r="1.8" fill="#fcd34d" />
              </g>
            )}

            {centroid && (
              <g
                className="gaibandha-label"
                transform={`translate(${centroid[0]},${centroid[1]})`}
                style={{
                  opacity: view === "bangladesh" ? 1 : 0,
                  transition: "opacity 500ms ease",
                  pointerEvents: "none",
                }}
                aria-hidden
              >
                <line
                  x1="0"
                  y1="-12"
                  x2="0"
                  y2="-30"
                  stroke="rgba(252,211,77,0.5)"
                  strokeWidth="0.8"
                />
                <text
                  x="0"
                  y="-40"
                  textAnchor="middle"
                  fill="#fde68a"
                  fontSize="10"
                  fontWeight="600"
                  letterSpacing="3.2"
                >
                   {t("map.gaibandha")}
                </text>
                <text
                  x="0"
                  y="-28"
                  textAnchor="middle"
                  fill="rgba(148,196,255,0.7)"
                  fontSize="5.5"
                  letterSpacing="1.6"
                >
                  {t("map.rangpurDivision")}
                </text>
              </g>
            )}
          </MapCamera>
        </svg>

        <AnimatePresence>
          {selectedUpazilaFeature &&
            selectedUpazilaCentroid &&
            !animating &&
            view !== "bangladesh" && (
              <UpazilaRobotStage
                key={selectedUpazilaFeature.id}
                centroid={selectedUpazilaCentroid}
                name={selectedUpazilaFeature.properties.name}
                upazilaCode={selectedUpazilaFeature.id}
              />
            )}
        </AnimatePresence>

        {!dataLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/30">
              {t("loading.boundaries")}
            </span>
          </div>
        )}
      </div>
    );
  }
);
