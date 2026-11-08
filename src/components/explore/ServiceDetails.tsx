"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, MapPin, Star, X } from "lucide-react";
import { getExplorePlaces } from "@/data/explore-places";
import type { CategoryMeta, ExplorePlace } from "@/data/explore-places";
import {
  getTrainRouteSummary,
  getTrainSchedule,
  GAIBANDHA_TO_BOGURA,
  GAIBANDHA_TO_BOGURA_SCHEDULE,
} from "@/data/train-schedule";
import { getBusOperators } from "@/data/bus-operators";
import { getRestaurantMenu } from "@/data/restaurant-menu";
import type { PlaceCategory } from "@/data/upazila-places";
import { useTranslation } from "@/hooks/useTranslation";
import { localizeName } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ServiceBot } from "@/components/ui/ServiceBot";
import { Reveal } from "@/components/ui/Reveal";
import { HotelImageSlider } from "@/components/hotel/HotelImageSlider";
import { HotelLocationCard } from "@/components/hotel/HotelLocationCard";
import { useDetailTransitionStore } from "@/store/detailTransitionStore";
import { useDetailNavigation } from "@/hooks/useDetailNavigation";

interface ServiceDetailsProps {
  place: ExplorePlace;
  meta: CategoryMeta;
  category: PlaceCategory;
  upazila: string;
  accent: string;
}

export function ServiceDetails({
  place,
  meta,
  category,
  upazila,
  accent,
}: ServiceDetailsProps) {
  const { locale, t } = useTranslation();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const detailPhase = useDetailTransitionStore((state) => state.phase);
  const goToDetail = useDetailNavigation();
  const revealActive = detailPhase !== "loading";

  const images = place.images?.length ? place.images : [place.image];
  const rating = Number(place.rating) || 0;
  const nearby = getExplorePlaces(category, upazila)
    .filter((item) => item.id !== place.id)
    .slice(0, 3);
  const backHref = `/explore/${category}?upazila=${encodeURIComponent(upazila)}`;

  const routeText = place.detail.split("·").pop()?.trim() ?? "";
  const routeSummary =
    getTrainRouteSummary(routeText) ?? GAIBANDHA_TO_BOGURA;
  const trainSchedule =
    category === "train" ? (getTrainSchedule(routeText) ?? GAIBANDHA_TO_BOGURA_SCHEDULE) : null;
  const busOperators = category === "bus" ? getBusOperators() : null;

  useEffect(() => {
    if (lightbox === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowLeft") setLightbox((index) => index === null ? null : (index - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setLightbox((index) => index === null ? null : (index + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox, images.length]);

  return (
    <div data-detail-enter={detailPhase} className="min-h-dvh bg-[#f8fafc] text-slate-900">
      <header className="detail-reveal detail-reveal--nav sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
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

      <main className="mx-auto max-w-7xl px-4 pb-36 sm:px-6">
        <div className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,47%)_minmax(0,1fr)] lg:items-start lg:gap-10">
          <div className="order-2 min-w-0 space-y-4 lg:order-1 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-20 lg:self-start">
            <div className="detail-reveal detail-reveal--gallery">
              <HotelImageSlider
                images={images}
                name={place.name}
                category={category}
                onOpen={(index) => setLightbox(index)}
              />
            </div>
            <div className="detail-reveal detail-reveal--location">
              <HotelLocationCard place={place} upazila={upazila} category={category} />
            </div>
          </div>

          <div className="order-1 min-w-0 lg:order-2 lg:col-start-2 lg:row-start-1">
            <section>
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  {meta.label}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                <h1 className="detail-reveal detail-reveal--title max-w-2xl text-[28px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                  {place.name}
                </h1>
                <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2 text-[12px] font-semibold text-slate-800">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {place.rating}
                </span>
              </div>

              <div className="detail-reveal detail-reveal--rating mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={
                        "h-4 w-4 " +
                        (index < Math.round(rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300")
                      }
                    />
                  ))}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {place.rating}
                </span>
                <span className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  {t("explore.reviews", { count: place.reviews })}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {place.detail} · {localizeName(upazila, locale)}
                </span>
              </div>

              {place.features.length > 0 && (
                <div className="detail-reveal detail-reveal--body mt-4 flex flex-wrap gap-2">
                  {place.features.slice(0, 4).map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-600"
                    >
                      <Check className="h-3 w-3 text-emerald-600" />
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="order-3 min-w-0 lg:col-start-2 lg:row-start-2">
            <Reveal active={revealActive} className="mt-2">
              <section>
                <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  {t("detail.overview")}
                </h2>
                <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-slate-600">
                  {t("detail.overviewText", {
                    name: place.name,
                    upazila: localizeName(upazila, locale),
                    description: meta.description,
                  })}
                </p>
              </section>
            </Reveal>

            {category === "train" && (
              <Reveal active={revealActive} className="mt-8">
                <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
                    <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                      Train schedule
                    </h2>
                  </div>
                  <div className="mb-4 space-y-1 text-sm text-slate-600">
                    <p className="flex justify-between">
                      <span>Route</span>
                      <span className="font-medium text-slate-900">{routeSummary.route}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Total trains</span>
                      <span className="font-medium text-slate-900">{routeSummary.totalTrains}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>First departure</span>
                      <span className="font-medium text-slate-900">{routeSummary.firstDeparture}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Last departure</span>
                      <span className="font-medium text-slate-900">{routeSummary.lastDeparture}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Fastest journey</span>
                      <span className="font-medium text-slate-900">{routeSummary.fastestJourney}</span>
                    </p>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-4 py-3 font-medium text-slate-500 uppercase tracking-[0.12em]">Train</th>
                          <th className="px-4 py-3 font-medium text-slate-500 uppercase tracking-[0.12em]">Departs</th>
                          <th className="px-4 py-3 font-medium text-slate-500 uppercase tracking-[0.12em]">Arrives</th>
                          <th className="px-4 py-3 font-medium text-slate-500 uppercase tracking-[0.12em]">Duration</th>
                          <th className="px-4 py-3 font-medium text-slate-500 uppercase tracking-[0.12em]">Off day</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {trainSchedule!.map((train) => (
                          <tr key={train.name} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-900">{train.name}</div>
                              <div className="text-[11px] text-slate-500">{train.nameBn}</div>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {train.departure}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {train.arrival}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{train.duration}</td>
                            <td className="px-4 py-3 text-slate-600">
                              {train.runsDaily ? "Daily" : train.offDay}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-400">
                    Source: {routeSummary.source} · Last updated {routeSummary.lastUpdated}
                  </p>
                </section>
              </Reveal>
            )}

            {category === "bus" && busOperators && busOperators.length > 0 && (
              <Reveal active={revealActive} className="mt-8">
                <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
                    <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                      Bus operators
                    </h2>
                  </div>
                  {busOperators.map((operator) => (
                    <div key={operator.name} className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
                        <div>
                          <h3 className="font-medium text-slate-900">{operator.name}</h3>
                          <p className="text-[11px] text-slate-500">{operator.service}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        <span className="font-medium text-slate-600">Routes:</span>{" "}
                        {operator.routes.join(" · ")}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        <span className="font-medium text-slate-600">Phone:</span>{" "}
                        {operator.phone}
                      </p>
                      <a
                        href={operator.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-700 hover:underline"
                      >
                        <span className="h-3.5 w-3.5 rounded-full bg-cyan-700/10 p-[1px] flex items-center justify-center">
                          <svg className="h-2 w-2 text-cyan-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.658 9.126 8.507 9.878v-6.988h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.244 0-1.63.771-1.63 1.566V12h2.773l-0.453 3h-2.32v6.988C18.342 21.126 22 16.991 22 12z" />
                          </svg>
                        </span>
                        {operator.facebook}
                      </a>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Source: {operator.source}
                      </p>
                    </div>
                  ))}
                </section>
              </Reveal>
            )}

            {category === "restaurants" && (
              <Reveal active={revealActive} className="mt-8">
                <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
                    <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                      Menu
                    </h2>
                  </div>
                  {getRestaurantMenu().map((section) => (
                    <div key={section.title}>
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1 mt-4 first:mt-0">
                        {section.title}
                      </h3>
                      <div className="space-y-1">
                        {section.items.map((item) => (
                          <div
                            key={item.name}
                            className="flex justify-between items-baseline text-sm"
                          >
                            <span className="text-slate-600">{item.name}</span>
                            <span className="font-medium text-slate-900">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              </Reveal>
            )}

            {place.features.length > 0 && (
              <Reveal active={revealActive} delay={60} className="mt-8">
                <section>
                  <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    {t("detail.amenities")}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {place.features.map((feature, index) => (
                      <span
                        key={feature}
                        className="reveal-child flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-600"
                        style={
                          {
                            "--reveal-child-delay": `${index * 45}ms`,
                          } as React.CSSProperties
                        }
                      >
                        <Check className="h-3.5 w-3.5 text-cyan-700" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}

            {nearby.length > 0 && (
              <Reveal active={revealActive} delay={60} className="mt-9">
                <section>
                  <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    {t("detail.moreNearby")}
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {nearby.map((item, index) => {
                      const href = `/explore/${category}/${encodeURIComponent(
                        item.id
                      )}?upazila=${encodeURIComponent(upazila)}`;
                      return (
                        <Link
                          key={item.id}
                          href={href}
                          onClick={(event) => {
                            if (
                              event.button !== 0 ||
                              event.metaKey ||
                              event.ctrlKey ||
                              event.shiftKey ||
                              event.altKey
                            ) {
                              return;
                            }
                            event.preventDefault();
                            goToDetail(href);
                          }}
                          className="reveal-child group overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-slate-300"
                          style={
                            {
                              "--reveal-child-delay": `${index * 90}ms`,
                            } as React.CSSProperties
                          }
                        >
                          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="300px"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          </div>
                          <div className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="min-w-0 truncate text-sm font-semibold text-slate-900">
                                {item.name}
                              </h3>
                              <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-slate-800">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {item.rating}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-[12px] text-slate-500">
                              {item.detail}
                            </p>
                            <p className="mt-2 flex items-center justify-between gap-2 text-[12px]">
                              <span className="font-semibold text-slate-900">
                                {item.meta}
                              </span>
                              <span className="inline-flex items-center gap-1 font-medium text-cyan-700">
                                {t("explore.viewDetails")}
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </span>
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              </Reveal>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:px-6">
          <p>© Gaibandha Explore — Tourism & travel discovery platform</p>
          <p>Gaibandha, Bangladesh</p>
        </div>
      </footer>

      {lightbox !== null && (
        <button
          type="button"
          onClick={() => setLightbox(null)}
          aria-label={t("detail.close")}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 p-4"
        >
          <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white">
            <X className="h-5 w-5" />
          </span>
          <span className="relative h-[70vh] w-[min(860px,100%)] overflow-hidden rounded-xl">
            <Image
              src={images[lightbox % images.length]}
              alt={`${place.name} ${lightbox + 1}`}
              fill
              sizes="860px"
              className="object-contain"
            />
          </span>
        </button>
      )}

      <ServiceBot upazila={upazila} />
    </div>
  );
}
