import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { CategoryExplorer } from "@/components/explore/CategoryExplorer";
import { CATEGORY_META, CATEGORY_ORDER } from "@/data/explore-places";
import type { PlaceCategory } from "@/data/upazila-places";

export function generateStaticParams() {
  return CATEGORY_ORDER.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const meta = CATEGORY_META[category as PlaceCategory];
  if (!meta) return { title: "Explore Gaibandha" };
  return {
    title: `${meta.label} in Gaibandha — Explore`,
    description: meta.description,
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

export default function ExploreCategoryPage() {
  return (
    <>
      <DynamicMarker />
      <Suspense fallback={<ExploreFallback />}>
        <CategoryExplorer />
      </Suspense>
    </>
  );
}

function ExploreFallback() {
  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="border-b border-black/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
          <div className="h-9 w-40 animate-pulse rounded-full bg-black/[0.04]" />
          <div className="mt-3 h-12 w-full animate-pulse rounded-2xl bg-black/[0.035] sm:h-14" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="h-4 w-32 animate-pulse rounded-full bg-black/[0.04]" />
        <div className="mt-4 h-10 w-2/3 animate-pulse rounded-xl bg-black/[0.04]" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[330px] animate-pulse rounded-2xl border border-black/[0.04] bg-black/[0.025]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
