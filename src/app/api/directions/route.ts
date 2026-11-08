import { isValidCoordinate } from "@/lib/geo-distance";

const ROUTERS = {
  driving: "https://routing.openstreetmap.de/routed-car",
  walking: "https://routing.openstreetmap.de/routed-foot",
  cycling: "https://routing.openstreetmap.de/routed-bike",
} as const;

type Mode = keyof typeof ROUTERS;

function parseCoordinate(value: string | null) {
  if (!value) return null;
  const parts = value.split(",");
  if (parts.length !== 2 || parts.some((part) => !part.trim())) return null;
  const [longitude, latitude] = parts.map(Number);
  const point = { latitude, longitude };
  return isValidCoordinate(point) ? point : null;
}

interface OsrmResponse {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: { type: string; coordinates: [number, number][] };
  }>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = parseCoordinate(searchParams.get("from"));
  const to = parseCoordinate(searchParams.get("to"));
  const mode = searchParams.get("mode");

  if (!from || !to || !mode || !(mode in ROUTERS)) {
    return Response.json({ error: "Invalid route coordinates or mode" }, { status: 400 });
  }

  const base = ROUTERS[mode as Mode];
  const path = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
  const url = `${base}/route/v1/driving/${path}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Routing provider returned ${response.status}`);
    const data = (await response.json()) as OsrmResponse;
    const route = data.code === "Ok" ? data.routes?.[0] : undefined;
    if (
      !route ||
      !Number.isFinite(route.distance) ||
      !Number.isFinite(route.duration) ||
      route.geometry?.type !== "LineString" ||
      !Array.isArray(route.geometry.coordinates) ||
      route.geometry.coordinates.length < 2 ||
      route.geometry.coordinates.some(
        ([longitude, latitude]) => !isValidCoordinate({ longitude, latitude })
      )
    ) {
      return Response.json({ error: "No road route was found" }, { status: 404 });
    }
    return Response.json(
      {
        coordinates: route.geometry.coordinates,
        distanceMeters: route.distance,
        durationSeconds: route.duration,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ error: "Routing service unavailable" }, { status: 502 });
  }
}
