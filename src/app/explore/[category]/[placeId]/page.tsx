import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { PlaceDetailPage } from "@/components/explore/PlaceDetailPage";
import { CATEGORY_META, getCategoryMeta } from "@/data/explore-places";
import { getExplorePlaces } from "@/data/explore-places";
import { UPAZILA_INFO } from "@/data/upazila-info";
import type { PlaceCategory } from "@/data/upazila-places";

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
  const meta = CATEGORY_META[category as PlaceCategory];
  if (!meta) return { title: "Explore Gaibandha" };

  let placeName: string | null = null;
  if (query.upazila && UPAZILA_INFO[query.upazila]) {
    const place = getExplorePlaces(
      category as PlaceCategory,
      query.upazila
    ).find((item) => item.id === placeId);
    if (place) placeName = place.name;
  }

  if (!placeName) {
    for (const upazila of Object.keys(UPAZILA_INFO)) {
      const place = getExplorePlaces(
        category as PlaceCategory,
        upazila
      ).find((item) => item.id === placeId);
      if (place) {
        placeName = place.name;
        break;
      }
    }
  }

  const categoryMeta = getCategoryMeta(category as PlaceCategory, "en");
  return {
    title: placeName
      ? `${placeName} — ${categoryMeta.label} in Gaibandha`
      : `${categoryMeta.label} in Gaibandha — Explore`,
    description: categoryMeta.description,
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

export default function ExplorePlaceDetailPage() {
  return (
    <>
      <DynamicMarker />
      <Suspense fallback={<DetailFallback />}>
        <PlaceDetailPage />
      </Suspense>
    </>
  );
}

function DetailFallback() {
  return (
    <div className="min-h-[100dvh] bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-8 aspect-[16/8] animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div>
            <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-44 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
