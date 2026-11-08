"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MousePointerClick, MoveRight } from "lucide-react";
import { useMapStore } from "@/store/mapStore";
import { useTranslation } from "@/hooks/useTranslation";

export function DestinationHint() {
  const introComplete = useMapStore((s) => s.introComplete);
  const view = useMapStore((s) => s.view);
  const selectedUpazilaCode = useMapStore((s) => s.selectedUpazilaCode);
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  const eligible =
    introComplete && view !== "bangladesh" && !selectedUpazilaCode;

  useEffect(() => {
    if (!eligible) return;

    const showTimer = window.setTimeout(() => setVisible(true), 250);
    const hideTimer = window.setTimeout(
      () => setVisible(false),
      250 + 2000
    );

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [eligible]);

  const show = eligible && visible;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="destination-hint"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center px-4 pb-14"
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, -5, 0] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex items-center gap-3 rounded-2xl border border-cyan-300/25 bg-[#030817]/80 px-4 py-2.5 shadow-[0_16px_50px_-12px_rgba(34,211,238,0.35)] backdrop-blur-md"
          >
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/10 text-cyan-200">
              {!reduce && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-cyan-300/50"
                  animate={{ scale: [1, 1.45], opacity: [0.7, 0] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              )}
              <MousePointerClick className="h-4 w-4" />
            </span>

            <span className="leading-tight">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                {t("hint.clickDestination")}
              </span>
              <span className="mt-0.5 block text-[10px] text-white/55">
                {t("hint.clickDestinationSub")}
              </span>
            </span>

            <motion.span
              aria-hidden
              className="text-cyan-300/80"
              animate={reduce ? undefined : { x: [0, 4, 0] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <MoveRight className="h-4 w-4" />
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
