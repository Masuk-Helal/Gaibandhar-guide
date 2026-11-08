import type {
  GeoBounds,
  DistrictFeature,
  DistrictsGeoJSON,
} from "@/types/geography";

export function boundsOfGeometry(
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
): GeoBounds {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;

  const rings =
    geometry.type === "MultiPolygon"
      ? geometry.coordinates.flatMap((poly) => poly)
      : [geometry.coordinates[0]];

  for (const ring of rings) {
    for (const [lon, lat] of ring) {
      if (lon < west) west = lon;
      if (lon > east) east = lon;
      if (lat < south) south = lat;
      if (lat > north) north = lat;
    }
  }

  return { west, south, east, north };
}

export function boundsOfFeatures(features: DistrictFeature[]): GeoBounds {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;

  for (const feature of features) {
    const b = boundsOfGeometry(feature.geometry);
    west = Math.min(west, b.west);
    south = Math.min(south, b.south);
    east = Math.max(east, b.east);
    north = Math.max(north, b.north);
  }

  return { west, south, east, north };
}

export function centerOf(bounds: GeoBounds): [number, number] {
  return [(bounds.west + bounds.east) / 2, (bounds.south + bounds.north) / 2];
}

export function findDistrict(
  districts: DistrictsGeoJSON | null,
  code: string
): DistrictFeature | undefined {
  return districts?.features.find((f) => f.id === code);
}

export function districtByName(
  districts: DistrictsGeoJSON | null,
  name: string
): DistrictFeature | undefined {
  return districts?.features.find((f) => f.properties.name === name);
}
