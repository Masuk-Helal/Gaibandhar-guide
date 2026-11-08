"use client";

import { memo } from "react";
import type { GeoPath } from "d3-geo";
import type { DistrictFeature } from "@/types/geography";

interface GaibandhaLayerProps {
  feature: DistrictFeature;
  path: GeoPath;
  active: boolean;
}

function GaibandhaLayerInner({ feature, path, active }: GaibandhaLayerProps) {
  const d = path(feature as never) || "";
  return (
    <g className="gaibandha-layer" style={{ pointerEvents: "none" }}>
      {/* soft outer halo — non-scaling so it stays subtle at any zoom */}
      <path
        className="gaibandha-halo"
        d={d}
        fill="none"
        stroke="rgba(252,211,77,0.16)"
        strokeWidth={9}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{
          opacity: active ? 1 : 0.55,
          animation: active ? "gaibandhaPulse 3.6s ease-in-out infinite" : undefined,
          transition: "opacity 500ms ease",
        }}
      />
      <path
        className="gaibandha-glow"
        d={d}
        fill="none"
        stroke="rgba(252,211,77,0.45)"
        strokeWidth={3}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        className="gaibandha"
        d={d}
        fill="rgba(252,211,77,0.055)"
        stroke="rgba(253,224,120,0.96)"
        strokeWidth={1.6}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

export const GaibandhaLayer = memo(GaibandhaLayerInner);
