"use client";

import Link from "next/link";
import { ExternalLink, MapPin, Navigation2 } from "lucide-react";
import type { ExplorePlace } from "@/data/explore-places";
import type { PlaceCategory } from "@/data/upazila-places";
import { localizeName } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { useTranslation } from "@/hooks/useTranslation";

interface HotelLocationCardProps {
  place: ExplorePlace;
  upazila: string;
  category?: PlaceCategory;
}

export function HotelLocationCard({ place, upazila, category = "hotels" }: HotelLocationCardProps) {
  const { locale, t } = useTranslation();

  const locationHref = `/explore/${category}/${encodeURIComponent(
    place.id
  )}/location?upazila=${encodeURIComponent(upazila)}`;
  const address = [place.name, place.detail, upazila, "Gaibandha", "Bangladesh"].join(", ");
  const externalDirectionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.22)] sm:p-5">
      <div className="flex items-start gap-3">
        <Link
          href={locationHref}
          aria-label={t("hotel.directionAria", { name: place.name })}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-100/70"
        >
          <MapPin className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {t(`${category}.locationLabel` as TranslationKey)}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
            {place.detail}
          </p>
          <p className="truncate text-xs text-slate-500">
            {localizeName(upazila, locale)}, {localizeName("Gaibandha", locale)}
          </p>
        </div>
      </div>

      <Link
        href={locationHref}
        className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(8,145,178,0.7)] transition hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
      >
        <Navigation2 className="h-4 w-4" />
        {category === "hotels" ? t("hotel.getDirections") : t("hotel.direction")}
      </Link>
      {category === "hotels" && (
        <a
          href={externalDirectionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
        >
          {t("hotel.openExternalDirections")}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </section>
  );
}
