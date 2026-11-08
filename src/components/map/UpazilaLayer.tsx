"use client";

import { memo } from "react";
import type { GeoPath } from "d3-geo";
import type { UpazilasGeoJSON } from "@/types/geography";
import { localizeName, type Locale } from "@/lib/i18n";

interface UpazilaLayerProps {
  upazilas: UpazilasGeoJSON;
  path: GeoPath;
  visible: boolean;
  highlightCode: string | null;
  selectedCode: string | null;
  onHover: (code: string | null) => void;
  onClick: (code: string) => void;
  locale?: Locale;
}

const FILLS = [
  "rgba(22,76,124,0.66)",
  "rgba(18,62,110,0.66)",
  "rgba(28,88,138,0.64)",
  "rgba(15,54,100,0.68)",
  "rgba(24,82,132,0.64)",
  "rgba(13,48,92,0.68)",
  "rgba(26,86,136,0.66)",
];

const LINE_HEIGHT = 1.55;

function labelLines(name: string) {
  return name.toUpperCase().split(" ").filter(Boolean);
}

function UpazilaLayerInner({
  upazilas,
  path,
  visible,
  highlightCode,
  selectedCode,
  onHover,
  onClick,
  locale = "en",
}: UpazilaLayerProps) {
  if (!visible) return null;

  const isHot = (id: string) =>
    highlightCode === id || selectedCode === id;

  return (
    <g className="upazila-layer">
      {/* Pass 1 — fills + interaction */}
      <g style={{ pointerEvents: "visiblePainted" }}>
        {upazilas.features.map((f, i) => {
          const d = path(f as never) || "";
          return (
            <path
              key={f.id}
              className="upazila-fill"
              d={d}
              fill={
                isHot(f.id) ? "rgba(34,211,238,0.46)" : FILLS[i % FILLS.length]
              }
              stroke="none"
              style={{
                transition: "fill 220ms ease",
                cursor: "pointer",
              }}
              onPointerEnter={() => onHover(f.id)}
              onPointerLeave={() => onHover(null)}
              onClick={() => onClick(f.id)}
              data-name={f.properties.name}
            />
          );
        })}
      </g>

      {/* Selected halo — animated cyan glow around the active upazila */}
      <g style={{ pointerEvents: "none" }}>
        {upazilas.features.map((f) => {
          if (f.id !== selectedCode) return null;
          const d = path(f as never) || "";
          return (
            <g key={"glow-" + f.id}>
              <path
                d={d}
                fill="rgba(34,211,238,0.08)"
                stroke="rgba(34,211,238,0.5)"
                strokeWidth={7}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{ animation: "gaibandhaPulse 3.4s ease-in-out infinite" }}
              />
              <path
                d={d}
                fill="none"
                stroke="rgba(125,235,255,0.9)"
                strokeWidth={2}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}
      </g>

      {/* Pass 2 — borders on top so shared edges stay crisp */}
      <g style={{ pointerEvents: "none" }}>
        {upazilas.features.map((f) => {
          const d = path(f as never) || "";
          const hot = isHot(f.id);
          return (
            <path
              key={"b-" + f.id}
              className="upazila upazila-border"
              d={d}
              fill="none"
              stroke={hot ? "rgba(253,224,120,0.98)" : "rgba(150,230,255,0.9)"}
              strokeWidth={hot ? 1.9 : 1.2}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </g>

      {/* Pass 3 — always-visible name labels */}
      <g className="upazila-labels">
        {upazilas.features.map((f) => {
          const [cx, cy] = path.centroid(f as never);
          if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;

          const lines = labelLines(localizeName(f.properties.name, locale));
          const hot = isHot(f.id);

          return (
            <g
              key={"label-" + f.id}
              className="upazila-label"
              transform={`translate(${cx},${cy})`}
              style={{ pointerEvents: "none" }}
            >
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="1.35"
                fontWeight={600}
                letterSpacing="0.12"
                fill={hot ? "#fde68a" : "rgba(226,244,255,0.92)"}
                stroke="#02040c"
                strokeWidth={0.22}
                strokeLinejoin="round"
                paintOrder="stroke"
                style={{
                  transition: "fill 200ms ease",
                  userSelect: "none",
                  textTransform: "uppercase",
                }}
              >
                {lines.map((line, i) => (
                  <tspan
                    key={line}
                    x="0"
                    y={(i - (lines.length - 1) / 2) * LINE_HEIGHT}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </g>
    </g>
  );
}

export const UpazilaLayer = memo(UpazilaLayerInner);
