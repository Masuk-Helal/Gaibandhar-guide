"use client";

import { SkipForward } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface IntroOverlayProps {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  subtitleRef: React.RefObject<HTMLParagraphElement | null>;
  skipRef: React.RefObject<HTMLButtonElement | null>;
  visible: boolean;
}

export function IntroOverlay({
  headingRef,
  subtitleRef,
  skipRef,
  visible,
}: IntroOverlayProps) {
  const { t } = useTranslation();

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 700ms ease",
        }}
      >
        <h1
          ref={headingRef}
          className="max-w-4xl text-balance text-[13vw] font-light leading-[0.88] tracking-[-0.03em] text-white/95 sm:text-[9vw] md:text-[7.4vw] lg:text-[86px]"
        >
          <span className="block">{t("intro.explore")}</span>
          <span className="block bg-gradient-to-b from-white via-cyan-100 to-cyan-300/60 bg-clip-text font-medium text-transparent">
            {t("intro.bangladesh")}
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="mt-6 max-w-md text-[11px] uppercase leading-relaxed tracking-[0.34em] text-white/45 sm:text-xs"
        >
          {t("intro.subtitle")}
        </p>
      </div>

      <button
        ref={skipRef}
        type="button"
        className="pointer-events-auto fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[9px] uppercase tracking-[0.34em] text-white/40 backdrop-blur-md transition hover:border-cyan-400/40 hover:text-cyan-200 sm:bottom-8"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 500ms ease",
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        <SkipForward className="h-3 w-3" />
        {t("intro.skip")}
      </button>
    </>
  );
}
