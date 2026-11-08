"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GeoStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"
  | "unsupported";

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

interface MemoryState {
  position: GeoPosition;
  status: GeoStatus;
}

// Share a resolved position between pages so navigating from the hotel page to
// the location page never triggers a second permission check.
let memory: MemoryState | null = null;

export function useGeolocation(autoRequest = true) {
  const [status, setStatus] = useState<GeoStatus>(
    memory?.status ?? "idle"
  );
  const [position, setPosition] = useState<GeoPosition | null>(
    memory?.position ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const requested = useRef(false);

  const request = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setStatus("requesting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (result) => {
        const next: GeoPosition = {
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
          accuracy: Number.isFinite(result.coords.accuracy)
            ? result.coords.accuracy
            : null,
        };
        memory = { position: next, status: "granted" };
        setPosition(next);
        setStatus("granted");
      },
      (geoError) => {
        const nextStatus: GeoStatus =
          geoError.code === geoError.PERMISSION_DENIED
            ? "denied"
            : "unavailable";
        memory = null;
        setStatus(nextStatus);
        setPosition(null);
        setError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location permission was denied."
            : geoError.code === geoError.TIMEOUT
              ? "Locating took too long. Try again."
              : "Your current location could not be determined."
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    if (!autoRequest || requested.current || memory?.position) return;
    const timer = window.setTimeout(() => {
      requested.current = true;
      request();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [autoRequest, request]);

  return { status, position, error, request };
}
