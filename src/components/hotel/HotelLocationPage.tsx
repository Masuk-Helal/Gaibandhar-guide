"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Compass,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Star,
} from "lucide-react";
import {
  CATEGORY_ORDER,
  getCategoryMeta,
  getExplorePlaces,
} from "@/data/explore-places";
import type { PlaceCategory } from "@/data/upazila-places";
import { UPAZILA_INFO } from "@/data/upazila-info";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDistance, haversineKm, isValidCoordinate } from "@/lib/geo-distance";
import { localizeName } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { PlaceLocationMap } from "@/components/hotel/HotelLocationMap";

export function PlaceLocationPage() {
  const params = useParams<{ category: string; placeId: string }>();
  const searchParams = useSearchParams();
  const { locale, t } = useTranslation();
  const { status, position, error, request } = useGeolocation(true);

  const rawCategory = params?.category;
  const isKnownCategory = CATEGORY_ORDER.includes(rawCategory as PlaceCategory);
  const category = (isKnownCategory ? rawCategory : "hotels") as PlaceCategory;
  const placeId = params?.placeId;
  const requestedUpazila = searchParams.get("upazila");

  const found = (() => {
    if (!placeId) return null;
    const names = Object.keys(UPAZILA_INFO);
    const preferred =
      requestedUpazila && UPAZILA_INFO[requestedUpazila] ? requestedUpazila : null;
    const order = preferred ? [preferred, ...names.filter((n) => n !== preferred)] : names;

    for (const upazila of order) {
      const place = getExplorePlaces(category, upazila).find(
        (item) => item.id === placeId
      );
      if (place) return { place, upazila };
    }
    return null;
  })();

  if (!found) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#050c18] px-6 text-center text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold">{t("explore.notFoundTitle")}</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/50">
          {t("explore.notFoundDesc")}
        </p>
        <Link
          href={`/explore/${category}`}
          className="mt-6 rounded-lg border border-white/15 bg-white/[0.04] px-5 py-2.5 text-[13px] font-medium text-white/80 transition hover:border-cyan-300/50 hover:text-cyan-200"
        >
          {t("explore.backToMap")}
        </Link>
      </div>
    );
  }

  const { place, upazila } = found;
  const categoryMeta = getCategoryMeta(category, locale);
  const placeCoordinate = { latitude: place.latitude, longitude: place.longitude };
  const hasPlaceCoordinate = isValidCoordinate(placeCoordinate);
  const distanceKm =
    position && hasPlaceCoordinate ? haversineKm(position, placeCoordinate) : null;
  const distanceLabel = formatDistance(distanceKm);

  const placeHref = `/explore/${category}/${encodeURIComponent(
    place.id
  )}?upazila=${encodeURIComponent(upazila)}`;

  return (
    <div className="min-h-[100dvh] bg-[#050c18] text-white">
      <header className="relative z-40 border-b border-white/10 bg-[#050c18]/95">
        <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-5">
          <Link
            href={placeHref}
            className="group inline-flex items-center gap-2 text-[13px] text-white/60 transition hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 transition group-hover:border-cyan-300/40 group-hover:text-cyan-200">
              <ArrowLeft className="h-4 w-4" />
            </span>
            <span className="hidden font-medium sm:inline">{t("map.backToDetails")}</span>
          </Link>

          <div className="min-w-0 text-center">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              {t("map.exploreMap")} · {localizeName(upazila, locale)}
            </p>
            <h1 className="mx-auto max-w-[42vw] truncate text-[12px] font-semibold text-white/90">
              {place.name}
            </h1>
          </div>

          <LanguageToggle variant="dark" className="hidden sm:flex" />
        </div>
      </header>

      <main className="relative">
        <div className="relative h-[calc(100dvh-56px)] min-h-[540px] w-full overflow-hidden">
          <PlaceLocationMap
            key={place.id}
            placeId={place.id}
            placeName={place.name}
            address={`${place.detail}, ${localizeName(upazila, locale)}`}
            upazila={upazila}
            latitude={place.latitude}
            longitude={place.longitude}
            rating={place.rating}
            meta={place.meta}
            user={position}
            status={status}
            onRetryLocation={request}
          />

          {/* Place summary card */}
          <div className="absolute left-3 top-3 z-30 w-[min(360px,calc(100%-1.5rem))] overflow-hidden rounded-2xl border border-white/12 bg-[#071120]/92 shadow-[0_24px_60px_rgba(2,6,16,0.55)] backdrop-blur-md">
            <div className="flex items-start gap-3 p-3.5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10">
                <Image
                  src={place.image}
                  alt={place.name}
                  fill
                  priority
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                  <Compass className="h-3 w-3" />
                  {categoryMeta.label}
                </p>
                <h1 className="mt-0.5 truncate text-[15px] font-semibold leading-tight text-white">
                  {place.name}
                </h1>
                <p className="mt-1 flex items-start gap-1 text-[11px] leading-snug text-white/50">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-cyan-300/70" />
                  <span className="line-clamp-2">
                    {place.detail} · {localizeName(upazila, locale)}
                  </span>
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-white/60">
                  <span className="flex items-center gap-1 font-semibold text-white/85">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {place.rating}
                  </span>
                  <span className="text-white/40">·</span>
                  <span>{place.meta}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 px-3.5 py-3">
              {status === "requesting" ? (
                <p className="flex items-center gap-2 text-[12px] text-white/60">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-300" />
                  {t("map.locating")}
                </p>
              ) : status === "granted" && distanceLabel ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[18px] font-bold leading-none text-white">
                      {distanceLabel}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-white/45">
                      <Navigation className="h-3 w-3 text-cyan-300" />
                      {t("map.straightLineDistance")}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/10 text-[12px] font-black text-cyan-200">
                    A
                  </span>
                </div>
              ) : status === "granted" && !distanceLabel ? (
                <p className="text-[11px] leading-relaxed text-white/50">
                  {t(hasPlaceCoordinate ? "map.noDistance" : "map.noCoords")}
                </p>
              ) : status === "denied" || status === "unavailable" ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] leading-relaxed text-white/50">
                    {error ?? t("map.locationUnavailable")}
                  </p>
                  <button
                    type="button"
                    onClick={request}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-2.5 py-1.5 text-[10px] font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                  >
                    <LocateFixed className="h-3 w-3" />
                    {t("map.useLocation")}
                  </button>
                </div>
              ) : status === "unsupported" ? (
                <p className="text-[11px] leading-relaxed text-white/50">
                  {t("map.unsupported")}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={request}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-[11px] font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                  {t("map.useLocation")}
                </button>
              )}
            </div>

            <div className="border-t border-white/10 p-3.5 pt-3">
              <Link
                href={placeHref}
                className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-[12px] font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                {t("map.details")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export const HotelLocationPage = PlaceLocationPage;
