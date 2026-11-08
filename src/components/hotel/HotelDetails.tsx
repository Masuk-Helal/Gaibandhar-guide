"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Share2,
  Shield,
  Star,
  X,
} from "lucide-react";
import { getExplorePlaces, type ExplorePlace } from "@/data/explore-places";
import { UPAZILA_INFO } from "@/data/upazila-info";
import { localizeName } from "@/lib/i18n";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ServiceBot } from "@/components/ui/ServiceBot";
import { Reveal } from "@/components/ui/Reveal";
import { getHotelDetails } from "@/data/hotel-details";
import { HotelImageSlider } from "@/components/hotel/HotelImageSlider";
import { HotelLocationCard } from "@/components/hotel/HotelLocationCard";
import { cn } from "@/lib/utils";
import { useDetailTransitionStore } from "@/store/detailTransitionStore";

function SectionHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="scroll-mt-28 text-lg font-semibold tracking-tight text-slate-900">
      {children}
    </h2>
  );
}

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "green" | "amber" | "slate" }) {
  const styles =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-50 text-slate-600";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium", styles)}>
      {children}
    </span>
  );
}

interface GalleryLightboxProps {
  images: string[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  hotelName: string;
}

function GalleryLightbox({ images, index, onIndex, onClose, hotelName }: GalleryLightboxProps) {
  const prev = () => onIndex((index - 1 + images.length) % images.length);
  const next = () => onIndex((index + 1) % images.length);
  void prev;
  void next;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndex((index - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, images.length, onClose, onIndex]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={hotelName}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex flex-col bg-slate-950/95"
    >
      <div className="flex items-center justify-between px-5 py-4 text-white">
        <span className="text-sm text-white/80">
          {index + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="relative flex-1 px-4 sm:px-16">
        <div className="relative mx-auto h-full max-w-5xl overflow-hidden rounded-lg">
          <Image src={images[index]} alt={hotelName} fill sizes="90vw" className="object-contain" priority />
        </div>
        <button
          type="button"
          onClick={prev}
          aria-label="Previous"
          className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next"
          className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => onIndex(i)}
            aria-label={`View image ${i + 1}`}
            className={cn(
              "relative h-14 w-20 shrink-0 overflow-hidden rounded-md border transition",
              i === index ? "border-white" : "border-white/20 opacity-60 hover:opacity-100"
            )}
          >
            <Image src={src} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function HotelDetails({ place, upazila }: { place: ExplorePlace; upazila: string }) {
  const { locale, t } = useTranslation();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [policyOpen, setPolicyOpen] = useState<number | null>(0);
  const detailPhase = useDetailTransitionStore((state) => state.phase);
  const revealActive = detailPhase !== "loading";

  const categoryPlaces = useMemo(() => {
    if (UPAZILA_INFO[upazila]) return getExplorePlaces("hotels", upazila);
    return [place];
  }, [place, upazila]);

  const details = useMemo(() => getHotelDetails(place, upazila, categoryPlaces), [place, upazila, categoryPlaces]);
  const images = place.images?.length ? place.images : [place.image];
  const rating = details.rating;
  const backHref = `/explore/hotels?upazila=${encodeURIComponent(upazila)}`;

  const onShared = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div data-detail-enter={detailPhase} className="min-h-dvh bg-[#f8fafc] text-slate-900">
      <header className="detail-reveal detail-reveal--nav sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">Gaibandha Explore</p>
              <p className="hidden text-[11px] text-slate-400 sm:block">Hotels · {place.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle variant="light" className="hidden sm:flex" />
            <button
              type="button"
              onClick={onShared}
              aria-label="Share"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              aria-label={saved ? "Saved" : "Save"}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border transition",
                saved ? "border-rose-200 bg-rose-50 text-rose-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              <Heart className={cn("h-4 w-4", saved && "fill-rose-500 text-rose-500")} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-36 sm:px-6">
        <div className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,47%)_minmax(0,1fr)] lg:items-start lg:gap-10">
          {/* Left column — gallery, about, and location */}
          <div className="order-2 min-w-0 space-y-4 lg:order-1 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
            <div className="detail-reveal detail-reveal--gallery">
              <HotelImageSlider
                images={images}
                name={place.name}
                onOpen={(index) => setLightbox(index)}
              />
            </div>

            <Reveal active={revealActive}>
              <section id="overview" className="scroll-mt-32">
                <SectionHeading id="rooms-heading">{t("hotel.description")}</SectionHeading>
                <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-slate-600">{details.description}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {details.propertyInfo.map((info, index) => (
                    <div
                      key={info.label}
                      className="reveal-child rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                      style={{ "--reveal-child-delay": `${index * 45}ms` } as React.CSSProperties}
                    >
                      <p className="text-[11px] text-slate-400">{info.label}</p>
                      <p className="mt-0.5 text-sm font-semibold">{info.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            <div className="detail-reveal detail-reveal--location">
              <HotelLocationCard place={place} upazila={upazila} />
            </div>
          </div>

          {/* Right column — title and rating */}
          <div className="order-1 min-w-0 lg:order-2 lg:col-start-2 lg:row-start-1">
            <section>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5" aria-label={`${details.starRating} star hotel`}>
                      {Array.from({ length: details.starRating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </span>
                    <Badge>Gaibandha</Badge>
                  </div>
                   <h1 className="detail-reveal detail-reveal--title mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">{place.name}</h1>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    {place.detail} · {localizeName(upazila, locale)}, Gaibandha District
                  </p>
                   <div className="detail-reveal detail-reveal--rating mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <span className="flex items-center gap-0.5 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
                        <Star className="h-3 w-3 fill-white text-white" />
                        {rating.toFixed(1)}
                      </span>
                      {t(details.ratingLabelKey)}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>{place.reviews.toLocaleString("en-IN")} reviews</span>
                    <span className="text-slate-300">|</span>
                    <span>{details.starRating}-star hotel</span>
                  </div>
                </div>
              </div>

               <div className="detail-reveal detail-reveal--body mt-4 flex flex-wrap gap-2">
                {details.facilitiesByCategory[0]?.items.slice(0, 4).map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600"
                  >
                    <Check className="h-3 w-3 text-emerald-600" />
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Right column — hotel information */}
          <div className="order-3 min-w-0 lg:col-start-2 lg:row-start-2">
            <div className="mt-1 min-w-0 space-y-10 lg:mt-0">
            <Reveal active={revealActive}>
              <section id="reviews" className="scroll-mt-32">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <SectionHeading>{t("hotel.reviews")}</SectionHeading>
                  <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-2.5 py-1 text-sm font-bold text-white">
                    {rating.toFixed(1)}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {details.reviewCategories.map((c, index) => (
                    <div
                      key={c.label}
                      className="reveal-child rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                      style={{ "--reveal-child-delay": `${index * 45}ms` } as React.CSSProperties}
                    >
                      <p className="text-[11px] text-slate-400">{c.label}</p>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(c.value / 5) * 100}%` }} />
                      </div>
                      <p className="mt-1 text-xs font-semibold">{c.value.toFixed(1)} / 5</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-3">
                  {details.reviews.map((review, index) => (
                    <article
                      key={review.id}
                      className="reveal-child rounded-xl border border-slate-200 bg-white p-4"
                      style={{ "--reveal-child-delay": `${index * 70}ms` } as React.CSSProperties}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                            {review.name.slice(0, 1)}
                          </span>
                          <div>
                            <p className="text-sm font-semibold">{review.name}</p>
                            <p className="text-[11px] text-slate-400">
                              {new Date(review.date).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-md bg-emerald-500 px-2 py-1 text-xs font-bold text-white">{review.score}/10</span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.text}</p>
                      <button
                        type="button"
                        className="mt-3 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50"
                      >
                        👍 {t("hotel.helpful")}
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            </Reveal>

            <Reveal active={revealActive} delay={40}>
              <section id="nearby" className="scroll-mt-32">
                <SectionHeading>{t("hotel.nearby")}</SectionHeading>
                <ul className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {details.nearbyPlaces.map((item, index) => (
                    <li
                      key={item.id}
                      className="reveal-child flex items-center justify-between gap-3 px-4 py-3"
                      style={{ "--reveal-child-delay": `${index * 55}ms` } as React.CSSProperties}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{item.name}</p>
                          <p className="truncate text-xs text-slate-500">
                            {item.category}
                            {item.meta ? ` · ${item.meta}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-slate-600">
                        {t("hotel.distance", { km: item.distanceKm })}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>

            <Reveal active={revealActive} delay={40}>
              <section id="facilities" className="scroll-mt-32">
                <SectionHeading>{t("hotel.facilities")}</SectionHeading>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {details.facilitiesByCategory.map((group, index) => (
                    <div
                      key={group.label}
                      className="reveal-child rounded-xl border border-slate-200 bg-white p-4"
                      style={{ "--reveal-child-delay": `${index * 70}ms` } as React.CSSProperties}
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <Shield className="h-4 w-4 text-slate-400" />
                        {group.label}
                      </h3>
                      <ul className="mt-3 space-y-2">
                        {group.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            <Reveal active={revealActive} delay={40}>
              <section id="policy" className="scroll-mt-32">
                <SectionHeading>{t("hotel.policy")}</SectionHeading>
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {details.policies.map((policy, index) => {
                    const open = policyOpen === index;
                    return (
                      <div key={policy.title} className="border-b border-slate-100 last:border-0">
                        <button
                          type="button"
                          onClick={() => setPolicyOpen(open ? null : index)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                          aria-expanded={open}
                        >
                          <span className="flex items-center gap-2.5 text-sm font-semibold">
                            <Clock className="h-4 w-4 text-slate-400" />
                            {policy.title}
                          </span>
                          <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
                        </button>
                        {open && <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600">{policy.body}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            </Reveal>

            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:px-6">
          <p>© Gaibandha Explore — Tourism & travel discovery platform</p>
          <p>Gaibandha, Bangladesh</p>
        </div>
      </footer>

      <AnimatePresence>
        {lightbox !== null && (
          <GalleryLightbox
            images={images}
            index={lightbox}
            onIndex={setLightbox}
            onClose={() => setLightbox(null)}
            hotelName={place.name}
          />
        )}
      </AnimatePresence>

      <ServiceBot upazila={upazila} />
    </div>
  );
}
