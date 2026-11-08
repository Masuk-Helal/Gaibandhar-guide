"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Bus,
  ChevronDown,
  Hospital,
  Hotel,
  MapPin,
  Mountain,
  Search,
  Star,
  TrainFront,
  UtensilsCrossed,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  CATEGORY_ORDER,
  getCategoryMeta,
  getExplorePlaces,
  type ExplorePlace,
} from "@/data/explore-places";
import type { PlaceCategory } from "@/data/upazila-places";
import { UPAZILA_INFO } from "@/data/upazila-info";
import { useTranslation } from "@/hooks/useTranslation";
import { localizeName } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ServiceBot } from "@/components/ui/ServiceBot";
import { useDetailNavigation } from "@/hooks/useDetailNavigation";

const CATEGORY_ICONS: Record<PlaceCategory, LucideIcon> = {
  hotels: Hotel,
  restaurants: UtensilsCrossed,
  tourism: Mountain,
  hospital: Hospital,
  train: TrainFront,
  bus: Bus,
};

export function CategoryExplorer() {
  const params = useParams<{ category: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const goToDetail = useDetailNavigation();
  const { locale, t } = useTranslation();

  const rawCategory = params?.category;
  const isKnownCategory = CATEGORY_ORDER.includes(
    rawCategory as PlaceCategory
  );
  const category = (
    isKnownCategory ? rawCategory : "hotels"
  ) as PlaceCategory;
  const meta = getCategoryMeta(category, locale);
  const Icon = CATEGORY_ICONS[category];

  const initialUpazila = searchParams.get("upazila");
  const [upazila, setUpazila] = useState(() =>
    initialUpazila && UPAZILA_INFO[initialUpazila]
      ? initialUpazila
      : "Gaibandha Sadar"
  );
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"featured" | "rating" | "reviews">(
    "featured"
  );
  const [lastCategory, setLastCategory] = useState(category);

  if (category !== lastCategory) {
    setLastCategory(category);
    setQuery("");
    setSort("featured");
  }

  const places = useMemo(
    () => getExplorePlaces(category, upazila),
    [category, upazila]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = places.filter((place) => {
      if (!q) return true;
      return [place.name, place.detail, place.meta, place.tag, ...place.features]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    const result = [...matched];
    if (sort === "rating") {
      result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sort === "reviews") {
      result.sort((a, b) => b.reviews - a.reviews);
    }
    return result;
  }, [places, query, sort]);

  const openDetails = (place: ExplorePlace) => {
    const href = `/explore/${category}/${encodeURIComponent(place.id)}?upazila=${encodeURIComponent(upazila)}`;
    goToDetail(href);
  };

  const changeUpazila = (next: string) => {
    setUpazila(next);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("upazila", next);
    router.replace(`/explore/${category}?${nextParams.toString()}`, {
      scroll: false,
    });
  };

  if (!isKnownCategory) return <UnknownCategory />;

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-3 sm:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-[13px] text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-700" />
              <span className="hidden font-medium sm:inline">
                {t("explore.backToMap")}
              </span>
            </Link>

            <div className="hidden items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
              {t("explore.brand")}
            </div>

            <div className="flex items-center gap-2">
              <LanguageToggle variant="light" />
              <div className="relative">
              <select
                value={upazila}
                onChange={(event) => changeUpazila(event.target.value)}
                aria-label={t("explore.selectUpazila")}
                className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-[13px] text-slate-700 outline-none transition hover:border-slate-300 focus:border-cyan-600"
              >
                {Object.keys(UPAZILA_INFO).map((item) => (
                  <option key={item} value={item} className="bg-white text-slate-900">
                    {localizeName(item, locale)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="group relative mx-auto max-w-2xl">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-cyan-700" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={meta.searchPlaceholder}
                aria-label={meta.searchPlaceholder}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={t("explore.clearSearch")}
                  className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-36 pt-10 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: meta.accent }}
              />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                {meta.tagline}
              </span>
            </div>
            <h1 className="mt-3 text-[28px] font-medium leading-tight tracking-tight text-slate-900 sm:text-3xl">
              {t("explore.categoryHeading", {
                label: meta.label,
                upazila: localizeName(upazila, locale),
              })}
            </h1>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-slate-500">
              {meta.description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-cyan-700">
              <Icon className="h-4 w-4" strokeWidth={1.7} />
            </span>
            <div className="leading-tight">
              <p className="text-base font-semibold text-slate-900">
                {filtered.length}
              </p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                {t("explore.listings")}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-9 border-y border-slate-200 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
              {query
                ? t("explore.resultsForQuery", {
                    count: filtered.length,
                    query,
                  })
                : t("explore.listingSummary", {
                    count: places.length,
                    label: meta.label,
                    upazila: localizeName(upazila, locale),
                  })}
            </p>

            <label className="flex shrink-0 items-center gap-2 text-[12px] text-slate-500">
              <span>{t("explore.sort")}</span>
              <span className="relative">
                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as typeof sort)
                  }
                  aria-label={t("explore.sort")}
                  className="h-8 appearance-none rounded-lg border border-slate-200 bg-white pl-2.5 pr-8 text-[12px] text-slate-700 outline-none transition hover:border-slate-300 focus:border-cyan-600"
                >
                  <option value="featured">
                    {t("explore.sortFeatured")}
                  </option>
                  <option value="rating">{t("explore.sortRating")}</option>
                  <option value="reviews">
                    {t("explore.sortReviews")}
                  </option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </span>
            </label>
          </div>
        </section>

        <div className="mt-7">
          {filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((place, index) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  index={index}
                  accent={meta.accent}
                  category={category}
                  upazila={upazila}
                  onSelect={openDetails}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-16 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                <Search className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                {t("explore.noResultsTitle", { item: meta.label })}
              </h3>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
                {t("explore.noResultsDesc")}
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[12px] font-medium text-cyan-700 transition hover:border-cyan-600 hover:text-cyan-800"
              >
                {t("explore.clearSearch")}
              </button>
            </div>
          )}
        </div>
      </main>

      <ServiceBot upazila={upazila} />
    </div>
  );
}

function PlaceCard({
  place,
  index,
  accent,
  category,
  upazila,
  onSelect,
}: {
  place: ExplorePlace;
  index: number;
  accent: string;
  category: PlaceCategory;
  upazila: string;
  onSelect: (place: ExplorePlace) => void;
}) {
  const Icon = CATEGORY_ICONS[category];
  const { t } = useTranslation();

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
      <Link
        href={`/explore/${category}/${encodeURIComponent(place.id)}?upazila=${encodeURIComponent(upazila)}`}
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          onSelect(place);
        }}
        aria-label={`${t("explore.viewDetails")}: ${place.name}`}
        className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-600/40"
      >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={place.image}
          alt={place.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={index < 3}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md border border-slate-200 bg-white/95 px-2 py-1 text-[11px] font-medium text-slate-600">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: accent }}
          />
          {place.tag}
        </div>

        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md border border-slate-200 bg-white/95 px-2 py-1 text-[11px] font-semibold text-slate-800">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {place.rating}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-[15px] font-semibold text-slate-900">
            {place.name}
          </h3>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition group-hover:border-cyan-600/30 group-hover:text-cyan-700"
          >
            <Icon className="h-4 w-4" strokeWidth={1.7} />
          </span>
        </div>

        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{place.detail}</span>
        </p>

        <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-slate-400">
          {t("explore.reviews", { count: place.reviews })}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="truncate text-[13px] font-semibold text-slate-900">
            {place.meta}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-cyan-700">
            {t("explore.viewDetails")}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
          {place.features.map((feature) => (
            <span
              key={feature}
              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
      </Link>
    </article>
  );
}

function UnknownCategory() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-white px-6 text-center">
      <p className="text-[9px] uppercase tracking-[0.4em] text-cyan-600/60">
        404
      </p>
      <h1 className="mt-3 text-2xl font-light text-slate-900">
        {t("explore.notFoundTitle")}
      </h1>
      <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-slate-500">
        {t("explore.notFoundDesc")}
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-[9px] uppercase tracking-[0.28em] text-cyan-700 transition hover:bg-cyan-500/20"
      >
        {t("explore.backToMap")}
      </Link>
    </div>
  );
}
