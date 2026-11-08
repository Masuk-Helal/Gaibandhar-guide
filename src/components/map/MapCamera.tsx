"use client";

import { forwardRef } from "react";

interface MapCameraProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * The camera layer. Everything inside this <g> is transformed by GSAP
 * (translate + scale) to create the cinematic zoom. Keeping geometry in
 * fixed projected space and moving the group keeps boundaries crisp at
 * every zoom level.
 */
export const MapCamera = forwardRef<SVGGElement, MapCameraProps>(
  function MapCamera({ children, className }, ref) {
    return (
      <g ref={ref} className={className} style={{ willChange: "transform" }}>
        {children}
      </g>
    );
  }
);
