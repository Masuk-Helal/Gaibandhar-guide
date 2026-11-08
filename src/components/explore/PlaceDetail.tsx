"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { localizeName } from "@/lib/i18n";
import type { CategoryMeta, ExplorePlace } from "@/data/explore-places";
import type { PlaceCategory } from "@/data/upazila-places";

interface PlaceDetailProps {
  place: ExplorePlace;
  meta: CategoryMeta;
  upazila: string;
  accent: string;
  category?: PlaceCategory;
  onClose: () => void;
}

export function PlaceDetail({
  place,
  meta,
  upazila,
  accent,
  category,
  onClose,
}: PlaceDetailProps) {
  const { locale, t } = useTranslation();
  const [activeImage, setActiveImage] = useState(0);

  const images = place.images?.length ? place.images : [place.image];
  const current = activeImage % images.length;
  const rating = Number(place.rating) || 0;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onClose();
    };
    window.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const step = (direction: number) => {
    setActiveImage((index) => (index + direction + images.length) % images.length);
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={place.name}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain"
    >
      <button
        type="button"
        aria-label={t("detail.close")}
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-slate-950/40"
      />

      <div
        className="relative flex min-h-full items-start justify-center px-3 py-6 sm:items-center sm:px-6"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.99 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.14)]"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={t("detail.close")}
            className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="grid lg:grid-cols-[1.02fr_1fr]">
            <div className="border-b border-slate-100 bg-slate-50 lg:border-b-0 lg:border-r">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={images[current]}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={images[current]}
                      alt={`${place.name} ${t("detail.viewImage", {
                        index: current + 1,
                      })}`}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 52vw"
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md border border-slate-200 bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  {place.tag}
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label={t("detail.previousImage")}
                      className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-700 transition hover:bg-white hover:text-slate-900"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label={t("detail.nextImage")}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-700 transition hover:bg-white hover:text-slate-900"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      aria-label={t("detail.viewImage", { index: index + 1 })}
                      aria-current={index === current}
                      className={
                        "h-1.5 rounded-full transition-all " +
                        (index === current
                          ? "w-5 bg-white"
                          : "w-1.5 bg-white/45 hover:bg-white/75")
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 p-3">
                {images.map((image, index) => (
                  <button
                    key={`thumb-${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={t("detail.viewImage", { index: index + 1 })}
                    className={
                      "relative aspect-square overflow-hidden rounded-lg border transition " +
                      (index === current
                        ? "border-cyan-700"
                        : "border-slate-200 opacity-70 hover:opacity-100")
                    }
                  >
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col p-5 sm:p-7">
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  {meta.label}
                </span>
              </div>

              <div className="mt-2 flex items-start justify-between gap-3">
                <h2 className="text-[22px] font-semibold leading-tight text-slate-900 sm:text-2xl">
                  {place.name}
                </h2>
                {category && (
                  <Link
                    href={`/explore/${category}/${encodeURIComponent(
                      place.id
                    )}/location?upazila=${encodeURIComponent(upazila)}`}
                    aria-label={t("detail.showMap")}
                    title={t("detail.showMap")}
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-cyan-700 transition hover:border-cyan-600/40 hover:text-cyan-800"
                  >
                    <MapPin className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={
                        "h-3.5 w-3.5 " +
                        (index < Math.round(rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300")
                      }
                    />
                  ))}
                </span>
                <span className="text-[11px] font-medium text-slate-700">
                  {place.rating}
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                  {t("explore.reviews", { count: place.reviews })}
                </span>
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                <MapPin
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: accent }}
                />
                {place.detail}
              </p>

              <p className="mt-5 border-y border-slate-100 py-3 text-base font-semibold text-slate-900">
                {place.meta}
              </p>

              <div className="mt-4">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-700" />
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    {t("detail.overview")}
                  </h3>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                  {t("detail.overviewText", {
                    name: place.name,
                    upazila: localizeName(upazila, locale),
                    description: meta.description,
                  })}
                </p>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  {t("detail.amenities")}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {place.features.map((feature) => (
                    <span
                      key={feature}
                      className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                    >
                      <Check className="h-3 w-3 text-cyan-700" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
