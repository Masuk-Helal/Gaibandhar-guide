import { geoMercator, geoPath } from "d3-geo";
import type { GeoPath } from "d3-geo";
import type { GeoBounds } from "@/types/geography";
import { boundsOfGeometry } from "@/lib/geo-utils";

const BANGLADESH_BBOX: GeoBounds = {
  west: 88.0,
  south: 20.5,
  east: 92.7,
  north: 26.7,
};

export function bboxToFeature(bounds: GeoBounds): GeoJSON.Feature {
  const { west, south, east, north } = bounds;
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [west, south],
          [east, south],
          [east, north],
          [west, north],
          [west, south],
        ],
      ],
    },
  };
}

/**
 * Build a fitted d3-geo path generator for a FeatureCollection.
 * Keeps the map centered and padded inside the viewport.
 */
export function createFittedPath(
  features: GeoJSON.FeatureCollection,
  width: number,
  height: number,
  padding = 48
): GeoPath {
  const safeW = Math.max(width, padding * 2 + 1);
  const safeH = Math.max(height, padding * 2 + 1);
  const projection = geoMercator().fitExtent(
    [
      [padding, padding],
      [safeW - padding, safeH - padding],
    ],
    features
  );
  return geoPath(projection);
}

export function createProjectionForBounds(
  bounds: GeoBounds,
  width: number,
  height: number,
  padding = 48
): GeoPath {
  const featureCollection: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [bboxToFeature(bounds)],
  };
  return createFittedPath(featureCollection, width, height, padding);
}

export function projectPoint(
  lon: number,
  lat: number,
  width: number,
  height: number
): [number, number] {
  const features: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [bboxToFeature(BANGLADESH_BBOX)],
  };
  const projection = geoMercator().fitExtent(
    [
      [48, 48],
      [Math.max(width - 48, 49), Math.max(height - 48, 49)],
    ],
    features
  );
  return projection([lon, lat]) ?? [width / 2, height / 2];
}

export { boundsOfGeometry, BANGLADESH_BBOX };
