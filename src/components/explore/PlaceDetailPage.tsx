"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  CATEGORY_ORDER,
  getCategoryMeta,
  getExplorePlaces,
} from "@/data/explore-places";
import type { PlaceCategory } from "@/data/upazila-places";
import { UPAZILA_INFO } from "@/data/upazila-info";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ServiceDetails } from "@/components/explore/ServiceDetails";
import { HotelDetails } from "@/components/hotel/HotelDetails";
import { useDetailTransitionStore } from "@/store/detailTransitionStore";

export function PlaceDetailPage() {
  const params = useParams<{ category: string; placeId: string }>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const markReady = useDetailTransitionStore((state) => state.markReady);
  const detailPhase = useDetailTransitionStore((state) => state.phase);
  const failTransition = useDetailTransitionStore((state) => state.fail);
  const { locale, t } = useTranslation();

  const isHotelRoute = params === null || params === undefined || (params as Record<string, unknown>)?.category === undefined;
  const rawCategory = isHotelRoute ? "hotels" : params?.category;
  const placeId = isHotelRoute
    ? (searchParams.get("hotelId") ?? searchParams.get("placeId") ?? searchParams.get("id"))
    : params?.placeId;
  const isKnownCategory = CATEGORY_ORDER.includes(
    rawCategory as PlaceCategory
  );
  const category = (isKnownCategory ? rawCategory : "hotels") as PlaceCategory;
  const requestedUpazila = searchParams.get("upazila");

  const found = (() => {
    if (!isKnownCategory || !placeId) return null;
    const upazilas = Object.keys(UPAZILA_INFO);
    const preferred =
      requestedUpazila && UPAZILA_INFO[requestedUpazila]
        ? requestedUpazila
        : null;
    const order = preferred
      ? [preferred, ...upazilas.filter((name) => name !== preferred)]
      : upazilas;

    for (const upazila of order) {
      const place = getExplorePlaces(category, upazila).find(
        (item) => item.id === placeId
      );
      if (place) return { place, upazila };
    }
    return null;
  })();

  const foundPlaceId = found?.place.id;
  useEffect(() => {
    if (detailPhase !== "loading") return;
    if (foundPlaceId) markReady(pathname);
    else failTransition();
  }, [detailPhase, foundPlaceId, pathname, markReady, failTransition]);

  if (!isKnownCategory || !found) {
    return (
      <DetailShell backHref="/">
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-700">
            404
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">
            {t("explore.notFoundTitle")}
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            {t("explore.notFoundDesc")}
          </p>
          <Link
            href="/"
            className="mt-6 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-medium text-slate-700 transition hover:border-cyan-600 hover:text-cyan-700"
          >
            {t("explore.backToMap")}
          </Link>
        </div>
      </DetailShell>
    );
  }

  const { place, upazila } = found;
  if (category === "hotels") {
    return (
      <div className="min-h-[100dvh] bg-[#f8fafc] text-slate-900">
        <main>
          <HotelDetails place={place} upazila={upazila} />
        </main>
      </div>
    );
  }
  const meta = getCategoryMeta(category, locale);
  return (
    <ServiceDetails
      place={place}
      meta={meta}
      category={category}
      upazila={upazila}
      accent={meta.accent}
    />
  );
}
function DetailShell({
  backHref,
  children,
}: {
  backHref: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Link
            href={backHref}
            className="group inline-flex items-center gap-2 text-[13px] text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-700" />
            <span className="hidden font-medium sm:inline">
              {t("detail.backToResults")}
            </span>
          </Link>

          <div className="hidden items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
            Gaibandha Explore
          </div>

          <LanguageToggle variant="light" />
        </div>
      </header>
      {children}
    </div>
  );
}
