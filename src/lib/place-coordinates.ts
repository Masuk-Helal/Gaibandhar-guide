import upazilas from "@/data/gaibandha-upazilas.json";
import type { GeoBounds, UpazilaFeature, UpazilasGeoJSON } from "@/types/geography";
import { boundsOfGeometry, centerOf } from "@/lib/geo-utils";

export interface PlaceCoordinate {
  latitude: number;
  longitude: number;
}

const COLLECTION = upazilas as unknown as UpazilasGeoJSON;

const FEATURES_BY_NAME = new Map<string, UpazilaFeature>(
  COLLECTION.features.map((feature) => [feature.properties.name, feature])
);

const DISTANCE_BOUNDS: GeoBounds = COLLECTION.features.reduce<GeoBounds>(
  (acc, feature) => {
    const b = boundsOfGeometry(feature.geometry);
    return {
      west: Math.min(acc.west, b.west),
      south: Math.min(acc.south, b.south),
      east: Math.max(acc.east, b.east),
      north: Math.max(acc.north, b.north),
    };
  },
  { west: Infinity, south: Infinity, east: -Infinity, north: -Infinity }
);

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getUpazilaBounds(name: string): GeoBounds | null {
  const feature = FEATURES_BY_NAME.get(name);
  return feature ? boundsOfGeometry(feature.geometry) : null;
}

export function getUpazilaFeature(name: string): UpazilaFeature | null {
  return FEATURES_BY_NAME.get(name) ?? null;
}

/**
 * Derives a stable, plausible coordinate for a place from the actual upazila
 * geometry. Place records do not carry their own latitude/longitude, so we
 * anchor each item near the centre of its real upazila bounds and spread
 * neighbouring records deterministically. The same id always resolves to the
 * same coordinate, keeping the marker, list and routing in sync.
 */
export function getPlaceCoordinate(
  upazila: string,
  index: number,
  id?: string
): PlaceCoordinate {
  const bounds = getUpazilaBounds(upazila) ?? DISTANCE_BOUNDS;
  const center = centerOf(bounds);

  const spanLon = (bounds.east - bounds.west) * 0.16;
  const spanLat = (bounds.north - bounds.south) * 0.16;

  const seed = hashString(`${upazila}|${id ?? index}`);
  const angle = ((seed % 360) * Math.PI) / 180;
  const radius = 0.35 + ((seed >>> 8) % 100) / 100 * 0.65;

  return {
    longitude: center[0] + Math.cos(angle) * spanLon * radius,
    latitude: center[1] + Math.sin(angle) * spanLat * radius,
  };
}
