"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { geoIdentity, geoPath } from "d3-geo";
import {
  Bike,
  AlertCircle,
  Bus,
  Car,
  ChevronRight,
  Clock,
  Footprints,
  Hospital,
  Hotel,
  LocateFixed,
  MapPin,
  Minus,
  Mountain,
  Navigation,
  Plus,
  RotateCcw,
  Route,
  Star,
  TrainFront,
  UtensilsCrossed,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import upazilasJson from "@/data/gaibandha-upazilas.json";
import type { UpazilasGeoJSON } from "@/types/geography";
import type { PlaceCategory } from "@/data/upazila-places";
import { CATEGORY_META } from "@/data/explore-places";
import { formatDistance, isValidCoordinate } from "@/lib/geo-distance";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import type { GeoPosition } from "@/hooks/useGeolocation";

const COLLECTION = upazilasJson as unknown as UpazilasGeoJSON;

export const CATEGORY_ICONS: Record<PlaceCategory, LucideIcon> = {
  hotels: Hotel,
  restaurants: UtensilsCrossed,
  tourism: Mountain,
  hospital: Hospital,
  train: TrainFront,
  bus: Bus,
};

export interface DarkMapMarker {
  id: string;
  name: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  rating?: string;
  detail?: string;
  href: string;
}

export interface DarkMapDestination {
  id?: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  rating?: string;
  meta?: string;
  href?: string;
}

interface ExploreDarkMapProps {
  upazila: string;
  markers: DarkMapMarker[];
  destination: DarkMapDestination;
  origin?: GeoPosition | null;
  onRequestLocation?: () => void;
  className?: string;
}

type Camera = { scale: number; x: number; y: number };
type Point = [number, number];
type TravelMode = "driving" | "walking" | "cycling";
interface RoadRoute {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
}

interface RouteResult {
  key: string;
  route: RoadRoute | null;
  error: boolean;
}

const MIN_SCALE = 0.05;
const MAX_SCALE = 9;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildRoutePathFromPoints(points: Point[]): string | null {
  if (points.length < 2) return null;
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point[0].toFixed(2)} ${point[1].toFixed(2)}`)
    .join(" ");
}

function buildZigzagPath(from: Point, to: Point, amplitude = 14, segments = 9): string | null {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);
  if (length < 24) return null;

  const nx = -dy / length;
  const ny = dx / length;
  const points: Point[] = [from];

  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const taper = Math.sin(Math.PI * t);
    const offset = (i % 2 === 0 ? 1 : -1) * amplitude * taper;
    points.push([from[0] + dx * t + nx * offset, from[1] + dy * t + ny * offset]);
  }

  points.push(to);
  return buildRoutePathFromPoints(points);
}

function formatRouteDuration(
  durationSeconds: number,
  t: (key: "route.minutesOnly" | "route.hoursMinutes") => string
) {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  if (minutes < 60) return t("route.minutesOnly").replace("{m}", String(minutes));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return t("route.hoursMinutes")
    .replace("{h}", String(hours))
    .replace("{m}", String(rest));
}

export function ExploreDarkMap({
  upazila,
  markers,
  destination,
  origin,
  onRequestLocation,
  className,
}: ExploreDarkMapProps) {
  const { t } = useTranslation();
  const uid = useId().replace(/[:]/g, "");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    cameraX: number;
    cameraY: number;
  } | null>(null);

  const [size, setSize] = useState({ w: 1000, h: 640 });
  const [view, setView] = useState<Camera>({ scale: 1, x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [retry, setRetry] = useState(0);

  const originLatitude = origin?.latitude;
  const originLongitude = origin?.longitude;
  const destinationLatitude = destination.latitude;
  const destinationLongitude = destination.longitude;
  const routeKey = `${originLatitude},${originLongitude}|${destinationLatitude},${destinationLongitude}|${travelMode}|${retry}`;
  const activeResult = routeResult?.key === routeKey ? routeResult : null;
  const roadRoute = activeResult?.route ?? null;

  useEffect(() => {
    if (
      !isValidCoordinate(origin) ||
      !isValidCoordinate({ latitude: destinationLatitude, longitude: destinationLongitude })
    ) return;

    const controller = new AbortController();
    const params = new URLSearchParams({
      from: `${originLongitude},${originLatitude}`,
      to: `${destinationLongitude},${destinationLatitude}`,
      mode: travelMode,
    });
    fetch(`/api/directions?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("No route available");
        return (await response.json()) as RoadRoute;
      })
      .then((route) => {
        if (!controller.signal.aborted) setRouteResult({ key: routeKey, route, error: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setRouteResult({ key: routeKey, route: null, error: true });
      });
    return () => controller.abort();
  }, [origin, originLatitude, originLongitude, destinationLatitude, destinationLongitude, travelMode, routeKey]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const model = useMemo(() => {
    const pad = Math.min(56, Math.min(size.w, size.h) * 0.08);
    const projection = geoIdentity()
      .reflectY(true)
      .fitExtent(
        [
          [pad, pad],
          [Math.max(size.w - pad, pad + 1), Math.max(size.h - pad, pad + 1)],
        ],
        COLLECTION as unknown as GeoJSON.FeatureCollection
      );
    const path = geoPath(projection);

    const shapes = COLLECTION.features.map((feature) => ({
      id: feature.id,
      name: feature.properties.name,
      d: path(feature as never) ?? "",
    }));

    const selectedFeature =
      COLLECTION.features.find((feature) => feature.properties.name === upazila) ?? null;
    const selectedShape = shapes.find((shape) => shape.name === upazila) ?? null;
    const selectedCentroid = selectedFeature ? path.centroid(selectedFeature as never) : null;

    const project = (latitude: number, longitude: number): Point | null => {
      const projected = projection([longitude, latitude]);
      if (!projected || !Number.isFinite(projected[0]) || !Number.isFinite(projected[1])) {
        return null;
      }
      return [projected[0], projected[1]];
    };

    const destinationPoint = project(destination.latitude, destination.longitude);
    const originPoint = isValidCoordinate(origin) ? project(origin!.latitude, origin!.longitude) : null;

    return {
      shapes,
      selectedShape,
      selectedCentroid,
      destinationPoint,
      originPoint,
      project,
    };
  }, [size, upazila, destination.latitude, destination.longitude, origin]);

  const fit = useMemo<Camera>(() => {
    const { destinationPoint, originPoint } = model;
    if (!destinationPoint) return { scale: 1, x: 0, y: 0 };

    const roadPoints = roadRoute?.coordinates
      .map(([longitude, latitude]) => model.project(latitude, longitude))
      .filter((point): point is Point => point !== null) ?? [];
    const points = roadPoints.length
      ? [...roadPoints, destinationPoint, ...(originPoint ? [originPoint] : [])]
      : originPoint ? [destinationPoint, originPoint] : [destinationPoint];
    const xs = points.map((point) => point[0]);
    const ys = points.map((point) => point[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = Math.max(maxX - minX, 1);
    const height = Math.max(maxY - minY, 1);
    const padding = Math.min(190, Math.min(size.w, size.h) * 0.22);
    const rawScale = Math.min(
      (size.w - padding * 2) / width,
      (size.h - padding * 2) / height
    );
    const scale = clamp(originPoint ? rawScale : 3.4, MIN_SCALE, 6.5);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return {
      scale,
      x: size.w / 2 - scale * centerX,
      y: size.h * (size.w < 640 ? 0.43 : 0.5) - scale * centerY,
    };
  }, [model, roadRoute, size.w, size.h]);

  // The fitted camera is composed with the user's pan/zoom so a resize or a
  // newly resolved location reframes the map without discarding interaction.
  const camera = useMemo<Camera>(
    () => ({
      scale: fit.scale * view.scale,
      x: view.scale * fit.x + view.x,
      y: view.scale * fit.y + view.y,
    }),
    [fit, view]
  );

  const zoomAt = useCallback(
    (px: number, py: number, factor: number) => {
      setView((current) => {
        const currentScale = fit.scale * current.scale;
        const currentX = current.scale * fit.x + current.x;
        const currentY = current.scale * fit.y + current.y;
        const nextScale = clamp(currentScale * factor, MIN_SCALE, MAX_SCALE);
        const ratio = nextScale / currentScale;
        const scale = nextScale / fit.scale;
        return {
          scale,
          x: px - ratio * (px - currentX) - scale * fit.x,
          y: py - ratio * (py - currentY) - scale * fit.y,
        };
      });
    },
    [fit]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(
        event.clientX - rect.left,
        event.clientY - rect.top,
        event.deltaY < 0 ? 1.18 : 0.85
      );
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [zoomAt]);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-map-control]")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      cameraX: view.x,
      cameraY: view.y,
    };
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setView((current) => ({
      ...current,
      x: drag.cameraX + (event.clientX - drag.startX),
      y: drag.cameraY + (event.clientY - drag.startY),
    }));
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const toScreen = (point: Point): Point => [
    camera.x + camera.scale * point[0],
    camera.y + camera.scale * point[1],
  ];

  const destinationScreen = model.destinationPoint ? toScreen(model.destinationPoint) : null;
  const originScreen = model.originPoint ? toScreen(model.originPoint) : null;
  const zigzagPath =
    originScreen && destinationScreen ? buildZigzagPath(originScreen, destinationScreen) : null;
  const routePoints = roadRoute?.coordinates
    .map(([longitude, latitude]) => model.project(latitude, longitude))
    .filter((point): point is Point => point !== null) ?? [];
  const routePath = buildRoutePathFromPoints(routePoints);
  const chevronIndex = Math.floor(routePoints.length * 0.58);
  const routeChevron = routePoints.length > 4
    ? {
        point: toScreen(routePoints[chevronIndex]),
        angle: Math.atan2(
          routePoints[chevronIndex + 1][1] - routePoints[chevronIndex - 1][1],
          routePoints[chevronIndex + 1][0] - routePoints[chevronIndex - 1][0]
        ) * (180 / Math.PI),
      }
    : null;
  const routeDistanceLabel = formatDistance(roadRoute ? roadRoute.distanceMeters / 1000 : null);
  const routeEtaLabel = roadRoute ? formatRouteDuration(roadRoute.durationSeconds, t) : null;

  const visibleMarkers = markers.filter(
    (marker) => marker.id !== destination.id
  );

  const selectedMarker = markers.find((marker) => marker.id === selectedId) ?? null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full touch-none select-none overflow-hidden bg-[#050c18]",
        className
      )}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      role="application"
      aria-label={`Interactive map of ${upazila}, Gaibandha`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#0b2036_0%,#071120_46%,#040912_100%)]" />

      <svg
        viewBox={`0 0 ${size.w} ${size.h}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <pattern id={`grid-${uid}`} width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="rgba(94,234,255,0.055)"
              strokeWidth="1"
            />
          </pattern>
          <pattern id={`blocks-${uid}`} width="64" height="64" patternUnits="userSpaceOnUse">
            <rect x="6" y="6" width="20" height="14" rx="2" fill="rgba(56,189,248,0.05)" />
            <rect x="34" y="10" width="24" height="20" rx="3" fill="rgba(56,189,248,0.035)" />
            <rect x="10" y="30" width="16" height="24" rx="2" fill="rgba(56,189,248,0.03)" />
            <rect x="38" y="40" width="18" height="14" rx="2" fill="rgba(56,189,248,0.045)" />
            <path
              d="M0 26 H64 M30 0 V64"
              stroke="rgba(56,189,248,0.05)"
              strokeWidth="1.2"
            />
          </pattern>
          <clipPath id={`clip-${uid}`}>
            {model.selectedShape && <path d={model.selectedShape.d} />}
          </clipPath>
        </defs>

        <rect width={size.w} height={size.h} fill={`url(#grid-${uid})`} />

        <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.scale})`}>
          {model.shapes.map((shape) => {
            const selected = shape.name === upazila;
            return (
              <path
                key={shape.id}
                d={shape.d}
                fill={selected ? "rgba(10,41,64,0.92)" : "rgba(8,20,36,0.86)"}
                stroke={selected ? "rgba(34,211,238,0.55)" : "rgba(71,115,155,0.32)"}
                strokeWidth={selected ? 1.6 : 0.8}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          <rect
            width={size.w}
            height={size.h}
            fill={`url(#blocks-${uid})`}
            opacity={0.45}
          />

          {model.selectedShape && (
            <g clipPath={`url(#clip-${uid})`}>
              <rect width={size.w} height={size.h} fill={`url(#blocks-${uid})`} />
              <path
                d={model.selectedShape.d}
                fill="none"
                stroke="rgba(34,211,238,0.9)"
                strokeWidth={2}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )}

          {routePath && (
            <g>
              <path
                d={routePath}
                fill="none"
                stroke="rgba(1,11,26,0.8)"
                strokeWidth={14}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={routePath}
                fill="none"
                stroke="#2de8ff"
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                className="map-route-flow"
                d={routePath}
                fill="none"
                stroke="rgba(232,251,255,0.8)"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="3 24"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )}

          {model.selectedCentroid &&
            Number.isFinite(model.selectedCentroid[0]) &&
            Number.isFinite(model.selectedCentroid[1]) && (
              <text
                x={model.selectedCentroid[0]}
                y={model.selectedCentroid[1]}
                textAnchor="middle"
                fill="rgba(148,197,255,0.35)"
                fontSize={16 / camera.scale}
                fontWeight={700}
                letterSpacing={1.4 / camera.scale}
                style={{ textTransform: "uppercase" }}
              >
                {upazila}
              </text>
            )}
        </g>
      </svg>

      {zigzagPath && (
        <svg
          viewBox={`0 0 ${size.w} ${size.h}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          <path
            d={zigzagPath}
            fill="none"
            stroke="rgba(251,191,36,0.16)"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            className="map-route-flow"
            d={zigzagPath}
            fill="none"
            stroke="rgba(251,191,36,0.85)"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="7 8"
          />
        </svg>
      )}

      {routeChevron && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-[5] flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#06101f] bg-cyan-300 text-slate-950 shadow-[0_5px_13px_rgba(0,0,0,0.5)]"
          style={{ left: routeChevron.point[0], top: routeChevron.point[1], rotate: `${routeChevron.angle}deg` }}
        >
          <ChevronRight className="h-5 w-5" strokeWidth={3} />
        </span>
      )}

      {/* Nearby place markers */}
      {visibleMarkers.map((marker) => {
        const projected = model.project(marker.latitude, marker.longitude);
        if (!projected) return null;
        const [x, y] = toScreen(projected);
        if (x < -40 || y < -40 || x > size.w + 40 || y > size.h + 40) return null;
        const accent = CATEGORY_META[marker.category].accent;
        const Icon = CATEGORY_ICONS[marker.category];
        const selected = marker.id === selectedId;
        return (
          <button
            key={marker.id}
            type="button"
            data-map-control
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setSelectedId(selected ? null : marker.id)}
            aria-label={`${marker.name} — ${CATEGORY_META[marker.category].label}`}
            className={cn(
              "absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border p-0 transition-transform duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80",
              selected ? "scale-110" : "hover:scale-110"
            )}
            style={{
              left: x,
              top: y,
              backgroundColor: `${accent}22`,
              borderColor: selected ? accent : `${accent}88`,
              boxShadow: selected
                ? `0 0 0 5px ${accent}22, 0 6px 18px rgba(2,6,16,0.55)`
                : "0 4px 14px rgba(2,6,16,0.55)",
            }}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ color: accent }}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          </button>
        );
      })}

      {/* Origin A */}
      {originScreen && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
          style={{ left: originScreen[0], top: originScreen[1] }}
        >
          <span className="relative flex h-14 w-14 items-center justify-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)] sm:h-16 sm:w-16">
            <MapPin className="absolute inset-0 h-full w-full fill-cyan-500 text-white" strokeWidth={1.8} />
            <span className="relative -translate-y-1.5 text-base font-black text-slate-950">A</span>
          </span>
          <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#071120]/95 px-2 py-1 text-center text-[10px] font-semibold text-cyan-100 shadow-md">
            {t("map.you")}
          </span>
        </div>
      )}

      {/* Destination B */}
      {destinationScreen && (
        <button
          type="button"
          data-map-control
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setSelectedId(null)}
          aria-label={`${destination.name} — ${t("map.destination")}`}
          className="absolute z-20 -translate-x-1/2 -translate-y-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
          style={{ left: destinationScreen[0], top: destinationScreen[1] }}
        >
          <span className="relative flex h-14 w-14 items-center justify-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)] sm:h-16 sm:w-16">
            <MapPin className="absolute inset-0 h-full w-full fill-amber-400 text-white" strokeWidth={1.8} />
            <span className="relative -translate-y-1.5 text-base font-black text-slate-950">B</span>
          </span>
          <span className="absolute left-1/2 top-full mt-1 block max-w-[170px] -translate-x-1/2 truncate rounded-md bg-[#071120]/95 px-2 py-1 text-center text-[10px] font-semibold text-amber-100 shadow-md">
            {destination.name}
          </span>
        </button>
      )}
      {/* Controls */}
      <div
        data-map-control
        onPointerDown={(event) => event.stopPropagation()}
        className="absolute bottom-4 right-3 z-30 flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-[#08111f]/85 p-1.5 shadow-[0_18px_40px_rgba(2,6,16,0.45)] backdrop-blur-md"
      >
        <MapControlButton label={t("controls.zoomIn")} onClick={() => zoomAt(size.w / 2, size.h / 2, 1.35)}>
          <Plus className="h-4 w-4" />
        </MapControlButton>
        <MapControlButton label={t("controls.zoomOut")} onClick={() => zoomAt(size.w / 2, size.h / 2, 1 / 1.35)}>
          <Minus className="h-4 w-4" />
        </MapControlButton>
        <span className="my-0.5 h-px w-6 bg-white/10" />
        <MapControlButton label={t("controls.resetView")} onClick={() => setView({ scale: 1, x: 0, y: 0 })}>
          <RotateCcw className="h-4 w-4" />
        </MapControlButton>
        {onRequestLocation && (
          <MapControlButton label={t("map.useLocation")} onClick={onRequestLocation}>
            <LocateFixed className="h-4 w-4" />
          </MapControlButton>
        )}
      </div>

      {/* Legend / hint */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-[#08111f]/80 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45 backdrop-blur-md sm:flex">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-400" /> {t("map.you")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> {t("map.destination")}
        </span>
        <span className="hidden items-center gap-1.5 lg:flex">
          <Navigation className="h-3 w-3 text-cyan-300" />
          {t("map.hint")}
        </span>
      </div>

      {/* Road route card */}
      {!selectedMarker && (
        <div className="absolute bottom-4 left-3 z-30 w-[min(330px,calc(100%-1.5rem))] rounded-2xl border border-white/12 bg-[#08111f]/95 p-3.5 shadow-[0_18px_40px_rgba(2,6,16,0.5)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                <Route className="h-3.5 w-3.5" />
                {t("route.toPlace")}
              </p>
              <h3 className="mt-1 truncate text-sm font-semibold text-white">
                {destination.name}
              </h3>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/10 text-[12px] font-black text-cyan-100">
              B
            </span>
          </div>

          <div
            data-map-control
            onPointerDown={(event) => event.stopPropagation()}
            className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1"
          >
            {(
              [
                { mode: "driving", label: t("route.driving"), Icon: Car },
                { mode: "walking", label: t("route.walking"), Icon: Footprints },
                { mode: "cycling", label: t("route.cycling"), Icon: Bike },
              ] as const
            ).map(({ mode, label, Icon }) => {
              const active = travelMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTravelMode(mode)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition",
                    active
                      ? "bg-cyan-400 text-slate-950 shadow-[0_8px_20px_rgba(45,232,255,0.28)]"
                      : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
            {!model.originPoint ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] leading-relaxed text-white/55">
                  {t("route.noLocation")}
                </p>
                {onRequestLocation && (
                  <button
                    type="button"
                    onClick={onRequestLocation}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-2.5 py-1.5 text-[10px] font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                  >
                    <LocateFixed className="h-3 w-3" />
                    {t("map.useLocation")}
                  </button>
                )}
              </div>
            ) : activeResult?.error ? (
              <div className="flex items-start gap-2 text-[11px] leading-relaxed text-white/70">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <div>
                  <p>{t("route.failed")}</p>
                  <button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-1 font-semibold text-cyan-200 underline underline-offset-4">
                    {t("route.retry")}
                  </button>
                </div>
              </div>
            ) : routeDistanceLabel && routeEtaLabel ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
                    {t("route.distance")}
                  </p>
                  <p className="mt-0.5 text-base font-bold leading-none text-white">
                    {routeDistanceLabel}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
                    {t("route.eta")}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-base font-bold leading-none text-white">
                    <Clock className="h-3.5 w-3.5 text-cyan-300" />
                    {routeEtaLabel}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-white/60" role="status">{t("route.loading")}</p>
            )}

            <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-[11px] leading-snug">
              <p className="flex min-w-0 items-center gap-1.5 text-white/55">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-[9px] font-black text-slate-950">
                  A
                </span>
                <span className="shrink-0 font-semibold uppercase tracking-[0.12em] text-white/35">
                  {t("route.from")}
                </span>
                <span className="truncate">{model.originPoint ? t("map.yourLocation") : t("route.noLocation")}</span>
              </p>
              <p className="flex min-w-0 items-center gap-1.5 text-white/55">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-slate-950">
                  B
                </span>
                <span className="shrink-0 font-semibold uppercase tracking-[0.12em] text-white/35">
                  {t("route.to")}
                </span>
                <span className="truncate">{destination.name}</span>
              </p>
            </div>
            <p className="mt-2 text-[9px] leading-relaxed text-white/30">
              {t("route.attribution")}
            </p>
            <p className="mt-1 text-[9px] leading-relaxed text-amber-200/70">
              {t("map.approximatePosition")}
            </p>
          </div>
        </div>
      )}

      {/* Selected marker card */}
      {selectedMarker && (
        <div className="absolute bottom-4 left-3 z-30 w-[min(320px,calc(100%-1.5rem))] rounded-xl border border-white/12 bg-[#08111f]/95 p-3.5 shadow-[0_18px_40px_rgba(2,6,16,0.5)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className="text-[9px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: CATEGORY_META[selectedMarker.category].accent }}
              >
                {CATEGORY_META[selectedMarker.category].label}
              </p>
              <h3 className="mt-1 truncate text-sm font-semibold text-white">
                {selectedMarker.name}
              </h3>
              {selectedMarker.detail && (
                <p className="mt-0.5 truncate text-[11px] text-white/45">
                  {selectedMarker.detail}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2 text-[11px] text-white/55">
                {selectedMarker.rating && (
                  <span className="flex items-center gap-1 font-semibold text-white/80">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {selectedMarker.rating}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-cyan-300" />
                  {upazila}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label={t("detail.close")}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 text-white/50 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <a
            href={selectedMarker.href}
            className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-2 text-[11px] font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {t("map.details")}
          </a>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-1 left-3 z-10 text-[9px] font-medium tracking-wide text-white/30">
        © OpenStreetMap contributors · Gaibandha Explore
      </div>

      {/* Route distance chip */}
      {routeDistanceLabel && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-20 hidden -translate-x-1/2 rounded-full border border-cyan-300/25 bg-[#08111f]/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-100/80 shadow-[0_10px_28px_rgba(2,6,16,0.4)] backdrop-blur-md lg:block">
          {routeDistanceLabel} {t("hotel.distanceFromYou")}
        </div>
      )}
    </div>
  );
}

function MapControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl text-white/55 transition hover:bg-white/[0.07] hover:text-cyan-200 active:scale-95"
    >
      {children}
    </button>
  );
}
