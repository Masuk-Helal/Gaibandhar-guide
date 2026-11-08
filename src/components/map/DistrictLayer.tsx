"use client";

import { memo } from "react";
import type { GeoPath } from "d3-geo";
import type { DistrictsGeoJSON } from "@/types/geography";

interface DistrictLayerProps {
  districts: DistrictsGeoJSON;
  path: GeoPath;
  visible: boolean;
  dimOthers: boolean;
  highlightCode: string | null;
  selectedCode: string | null;
  onHover: (code: string | null) => void;
  onClick: (code: string) => void;
}

function DistrictLayerInner({
  districts,
  path,
  visible,
  dimOthers,
  highlightCode,
  selectedCode,
  onHover,
  onClick,
}: DistrictLayerProps) {
  return (
    <g className="district-layer" style={{ pointerEvents: visible ? "visiblePainted" : "none" }}>
      {districts.features.map((f) => {
        const d = path(f as never) || "";
        const isHot = highlightCode === f.id || selectedCode === f.id;
        return (
          <path
            key={f.id}
            className="district"
            d={d}
            fill={isHot ? "rgba(34,211,238,0.16)" : "rgba(18,42,84,0.30)"}
            stroke={isHot ? "rgba(34,211,238,0.95)" : "rgba(94,196,255,0.42)"}
            strokeWidth={isHot ? 1.1 : 0.55}
            strokeLinejoin="round"
            style={{
              opacity: dimOthers && !isHot ? 0.32 : 1,
              transition: "fill 260ms ease, stroke 260ms ease, opacity 400ms ease",
              cursor: "pointer",
              vectorEffect: "non-scaling-stroke",
            }}
            onPointerEnter={() => onHover(f.id)}
            onPointerLeave={() => onHover(null)}
            onClick={() => onClick(f.id)}
            data-name={f.properties.name}
          />
        );
      })}
    </g>
  );
}

export const DistrictLayer = memo(DistrictLayerInner);
