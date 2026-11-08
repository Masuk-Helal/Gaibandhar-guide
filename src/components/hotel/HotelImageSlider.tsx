"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/lib/i18n";

interface HotelImageSliderProps {
  images: string[];
  name: string;
  category?: string;
  onOpen: (index: number) => void;
}

export function HotelImageSlider({ images, name, category, onOpen }: HotelImageSliderProps) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  const safeImages = images.filter((src): src is string => Boolean(src));
  const total = safeImages.length;
  const current = total > 0 ? index % total : 0;
  const hasMany = total > 1;

  const galleryLabel = category && t(`categories.${category}.label` as TranslationKey);

  const go = useCallback(
    (step: number) => {
      if (total < 2) return;
      setDirection(step);
      setIndex((value) => (value + step + total) % total);
    },
    [total]
  );

  if (total === 0) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
        <ImageOff className="h-7 w-7" />
        <p className="text-xs font-medium">{t("hotel.photosSoon")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        role="region"
        aria-label={`${name} photo gallery`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            go(1);
          }
        }}
        className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan-600/40 sm:aspect-[16/12]"
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, x: direction > 0 ? 42 : -42 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, x: direction > 0 ? -42 : 42 }
            }
            transition={{ duration: reduce ? 0.2 : 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {failed[current] ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400">
                <ImageOff className="h-7 w-7" />
                <p className="text-xs font-medium">{t("hotel.imageUnavailable")}</p>
              </div>
            ) : (
              <Image
                src={safeImages[current]}
                alt={`${name} photo ${current + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 440px"
                className="object-cover"
                onError={() =>
                  setFailed((state) => ({ ...state, [current]: true }))
                }
              />
            )}
          </motion.div>
        </AnimatePresence>

        <span className="pointer-events-none absolute left-3 top-3 rounded-md border border-white/40 bg-slate-950/45 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
          {galleryLabel ? `${galleryLabel} photos` : t("hotel.roomPhotos")}
        </span>

        <span className="pointer-events-none absolute right-3 top-3 rounded-md border border-slate-200 bg-white/95 px-2 py-1 text-[11px] font-semibold text-slate-700">
          {current + 1} / {total}
        </span>

        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t("detail.previousImage")}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600/40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t("detail.nextImage")}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600/40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onOpen(current)}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-white/30 bg-slate-950/55 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-slate-950/70"
        >
          <Expand className="h-3.5 w-3.5" />
          {t("hotel.viewAllPhotos")} ({total})
        </button>

        {hasMany && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {safeImages.map((src, dot) => (
              <button
                key={`${src}-${dot}`}
                type="button"
                onClick={() => {
                  setDirection(dot > current ? 1 : -1);
                  setIndex(dot);
                }}
                aria-label={t("detail.viewImage", { index: dot + 1 })}
                aria-current={dot === current}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  dot === current
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/55 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {hasMany && (
        <div className="grid grid-cols-5 gap-2">
          {safeImages.map((src, thumb) => (
            <button
              key={`${src}-thumb-${thumb}`}
              type="button"
              onClick={() => {
                setDirection(thumb > current ? 1 : -1);
                setIndex(thumb);
              }}
              aria-label={t("detail.viewImage", { index: thumb + 1 })}
              aria-current={thumb === current}
              className={cn(
                "relative aspect-[16/10] overflow-hidden rounded-lg border bg-slate-100 transition",
                thumb === current
                  ? "border-cyan-700 ring-1 ring-cyan-700/20"
                  : "border-slate-200 opacity-70 hover:opacity-100"
              )}
            >
              {failed[thumb] ? (
                <span className="flex h-full w-full items-center justify-center text-slate-400">
                  <ImageOff className="h-3.5 w-3.5" />
                </span>
              ) : (
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                  onError={() =>
                    setFailed((state) => ({ ...state, [thumb]: true }))
                  }
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
