"use client";

import { useMemo } from "react";
import {
  CATEGORY_ORDER,
  getExplorePlaces,
  type ExplorePlace,
} from "@/data/explore-places";
import type { PlaceCategory } from "@/data/upazila-places";
import type { GeoPosition, GeoStatus } from "@/hooks/useGeolocation";
import {
  ExploreDarkMap,
  type DarkMapMarker,
} from "@/components/map/ExploreDarkMap";

interface PlaceLocationMapProps {
  placeId?: string;
  placeName: string;
  address: string;
  upazila: string;
  latitude: number;
  longitude: number;
  rating: string;
  meta: string;
  user: GeoPosition | null;
  status: GeoStatus;
  onRetryLocation: () => void;
}

const MARKER_LIMIT: Record<PlaceCategory, number> = {
  hotels: 4,
  restaurants: 3,
  tourism: 3,
  hospital: 3,
  train: 2,
  bus: 2,
};

function buildMarkers(
  upazila: string,
  placeId: string | undefined
): DarkMapMarker[] {
  const markers: DarkMapMarker[] = [];

  for (const category of CATEGORY_ORDER) {
    const places = getExplorePlaces(category, upazila).slice(
      0,
      MARKER_LIMIT[category]
    );
    for (const place of places as ExplorePlace[]) {
      if (place.id === placeId) continue;
      markers.push({
        id: place.id,
        name: place.name,
        category,
        latitude: place.latitude,
        longitude: place.longitude,
        rating: place.rating,
        detail: place.detail,
        href: `/explore/${category}/${encodeURIComponent(place.id)}?upazila=${encodeURIComponent(upazila)}`,
      });
    }
  }

  return markers;
}

export function PlaceLocationMap({
  placeId,
  placeName,
  address,
  upazila,
  latitude,
  longitude,
  rating,
  meta,
  user,
  status,
  onRetryLocation,
}: PlaceLocationMapProps) {
  const markers = useMemo(
    () => buildMarkers(upazila, placeId),
    [upazila, placeId]
  );

  return (
    <ExploreDarkMap
      upazila={upazila}
      markers={markers}
      destination={{
        id: placeId,
        name: placeName,
        address,
        latitude,
        longitude,
        rating,
        meta,
      }}
      origin={status === "granted" ? user : null}
      onRequestLocation={onRetryLocation}
    />
  );
}

export const HotelLocationMap = PlaceLocationMap;
