import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { PlaceLocationPage } from "@/components/hotel/HotelLocationPage";
import { getExplorePlaces } from "@/data/explore-places";
import { UPAZILA_INFO } from "@/data/upazila-info";

export const instant = false;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; placeId: string }>;
  searchParams: Promise<{ upazila?: string }>;
}): Promise<Metadata> {
  const { category, placeId } = await params;
  const query = await searchParams;

  let placeName: string | null = null;
  if (query.upazila && UPAZILA_INFO[query.upazila]) {
    const place = getExplorePlaces(
      category as Parameters<typeof getExplorePlaces>[0],
      query.upazila
    ).find((item) => item.id === placeId);
    if (place) placeName = place.name;
  }

  if (!placeName) {
    for (const upazila of Object.keys(UPAZILA_INFO)) {
      const place = getExplorePlaces(
        category as Parameters<typeof getExplorePlaces>[0],
        upazila
      ).find((item) => item.id === placeId);
      if (place) {
        placeName = place.name;
        break;
      }
    }
  }

  return {
    title: placeName
      ? `${placeName} Location — Gaibandha Explore`
      : "Place Location — Gaibandha Explore",
    description:
      "See the place location on the Gaibandha map and calculate the distance from your current position.",
  };
}

const Connection = async () => {
  await connection();
  return null;
};

async function DynamicMarker() {
  return (
    <Suspense>
      <Connection />
    </Suspense>
  );
}

export default function PlaceLocationRoute() {
  return (
    <>
      <DynamicMarker />
      <Suspense fallback={<PlaceLocationFallback />}>
        <PlaceLocationPage />
      </Suspense>
    </>
  );
}

function PlaceLocationFallback() {
  return (
    <div className="min-h-[100dvh] bg-[#f8fafc]">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-9 w-64 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="h-[440px] animate-pulse rounded-xl bg-slate-200" />
          <div className="space-y-4">
            <div className="h-56 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
