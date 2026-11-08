import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { PlaceDetailPage } from "@/components/explore/PlaceDetailPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Hotel Details — Gaibandha Explore",
    description:
      "View hotel photos, rooms, pricing, reviews, facilities and policies on Gaibandha Explore.",
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

export default function HotelDetailsRoute() {
  return (
    <>
      <DynamicMarker />
      <Suspense fallback={<HotelDetailsFallback />}>
        <PlaceDetailPage />
      </Suspense>
    </>
  );
}

function HotelDetailsFallback() {
  return (
    <div className="min-h-[100dvh] bg-[#f8fafc]">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-5 grid gap-2 md:grid-cols-[minmax(0,1fr)_360px]">
          <div className="aspect-[16/10] animate-pulse rounded-xl bg-slate-200 md:aspect-auto md:h-[420px]" />
          <div className="grid gap-2">
            <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
        <div className="mt-5 h-24 animate-pulse rounded-xl bg-slate-200" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-40 animate-pulse rounded-xl bg-slate-200" />
          </div>
          <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
