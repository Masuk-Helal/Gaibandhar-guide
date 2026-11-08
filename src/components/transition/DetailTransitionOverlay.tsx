"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useDetailTransitionStore } from "@/store/detailTransitionStore";

const LOADING_MS = 4000;
const REVEAL_MS = 2000;
const LOADING_TIMEOUT_MS = 10000;
const EASE = [0.22, 1, 0.36, 1] as const;

export function DetailTransitionOverlay() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const phase = useDetailTransitionStore((state) => state.phase);
  const target = useDetailTransitionStore((state) => state.target);
  const source = useDetailTransitionStore((state) => state.source);
  const startedAt = useDetailTransitionStore((state) => state.startedAt);
  const ready = useDetailTransitionStore((state) => state.ready);
  const error = useDetailTransitionStore((state) => state.error);
  const reveal = useDetailTransitionStore((state) => state.reveal);
  const fail = useDetailTransitionStore((state) => state.fail);
  const reset = useDetailTransitionStore((state) => state.reset);

  const arrivedRef = useRef(false);

  // Hold the branded loading scene for the full duration, but never longer
  // than necessary once the destination route has mounted its data.
  useEffect(() => {
    if (phase !== "loading" || !ready) return;
    const targetPath = target?.split("?")[0];
    if (!targetPath || pathname !== targetPath) return;

    const remaining = reduce
      ? 0
      : Math.max(0, LOADING_MS - (Date.now() - startedAt));
    const timer = window.setTimeout(reveal, remaining);
    return () => window.clearTimeout(timer);
  }, [phase, ready, pathname, target, startedAt, reveal, reduce]);

  // Fade the scene out into the destination page, then release the store.
  useEffect(() => {
    if (phase !== "reveal") return;
    const timer = window.setTimeout(reset, reduce ? 200 : REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [phase, reset, reduce]);

  // Never trap the visitor if the destination never becomes ready.
  useEffect(() => {
    if (phase !== "loading") return;
    const timer = window.setTimeout(() => fail(), LOADING_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [phase, fail]);

  // Handle browser back / forward and stray navigation during a transition.
  useEffect(() => {
    if (phase === "idle") {
      arrivedRef.current = false;
      return;
    }

    const targetPath = target?.split("?")[0];
    if (pathname === targetPath) {
      arrivedRef.current = true;
      return;
    }

    if (arrivedRef.current) {
      reset();
      return;
    }

    const sourcePath = source?.split("?")[0];
    if (pathname !== sourcePath) reset();
  }, [phase, pathname, source, target, reset]);

  const isError = phase === "error";
  const isReveal = phase === "reveal";

  const goBack = () => {
    const destination = source || "/";
    reset();
    router.push(destination);
  };

  return (
    <AnimatePresence>
      {phase !== "idle" && (
        <motion.div
          key="detail-transition"
          role="status"
          aria-live="polite"
          aria-label={
            isError ? t("transition.errorTitle") : t("transition.loading")
          }
          className={`fixed inset-0 z-[10000] overflow-hidden ${
            isReveal ? "pointer-events-none" : "pointer-events-auto"
          }`}
          initial={{ opacity: 1 }}
          animate={
            isReveal
              ? { opacity: 0, scale: reduce ? 1 : 1.035 }
              : { opacity: 1, scale: 1 }
          }
          exit={{ opacity: 0 }}
          transition={{
            duration: isReveal ? (reduce ? 0.15 : 0.7) : 0.4,
            ease: EASE,
          }}
          style={{ transformOrigin: "50% 45%" }}
        >
          {/* Branded backdrop */}
          <div className="absolute inset-0 bg-[#030a16]" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_32%,#0a2748_0%,#061427_46%,#02040c_100%)]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(120,200,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(120,200,255,0.6) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage:
                "radial-gradient(circle at 50% 45%, black 0%, transparent 70%)",
              WebkitMaskImage:
                "radial-gradient(circle at 50% 45%, black 0%, transparent 70%)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_100%_at_50%_50%,transparent_55%,rgba(0,0,0,0.72)_100%)]" />

          {/* Expanding light bloom that dissolves the scene on reveal */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[62vmin] w-[62vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.2)_0%,rgba(52,211,153,0.08)_45%,transparent_70%)] blur-2xl"
            initial={false}
            animate={
              isReveal
                ? { scale: reduce ? 1 : 2.4, opacity: 0 }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: reduce ? 0.15 : 0.7, ease: EASE }}
          />

          <motion.div
            className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center"
            initial={{ opacity: 0, y: 14 }}
            animate={
              isReveal
                ? { opacity: 0, y: -14 }
                : { opacity: 1, y: 0 }
            }
            transition={{
              duration: isReveal ? (reduce ? 0.15 : 0.5) : 0.7,
              ease: EASE,
            }}
          >
            {isError ? (
              <ErrorScene
                message={error}
                title={t("transition.errorTitle")}
                description={t("transition.errorDesc")}
                actionLabel={t("transition.backToListing")}
                onBack={goBack}
                reduce={Boolean(reduce)}
              />
            ) : (
              <LoadingScene
                brand={t("explore.brand")}
                loading={t("transition.loading")}
                preparing={t("transition.preparing")}
                reduce={Boolean(reduce)}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoadingScene({
  brand,
  loading,
  preparing,
  reduce,
}: {
  brand: string;
  loading: string;
  preparing: string;
  reduce: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <motion.p
        className="mb-6 text-[10px] font-semibold uppercase tracking-[0.4em] text-cyan-200/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
      >
        {brand}
      </motion.p>

      <div className="relative flex items-center justify-center">
        <motion.span
          aria-hidden
          className="absolute h-[clamp(210px,30vw,320px)] w-[clamp(210px,30vw,320px)] rounded-full border border-cyan-300/15"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        />
        <motion.span
          aria-hidden
          className="absolute h-[clamp(170px,24vw,260px)] w-[clamp(170px,24vw,260px)] rounded-full border border-emerald-300/10"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.86, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, -10, 0, 5, 0] }}
            transition={{
              duration: 4.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Image
              src="/mascot.svg"
              alt=""
              width={320}
              height={320}
              priority
              className="w-[clamp(170px,24vw,260px)] select-none drop-shadow-[0_28px_46px_rgba(2,12,28,0.55)]"
            />
          </motion.div>
        </motion.div>
      </div>

      <motion.h2
        className="mt-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
      >
        {loading}
      </motion.h2>

      <div className="relative mt-7 h-[2px] w-[min(240px,56vw)] overflow-hidden rounded-full bg-white/10">
        <motion.span
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-300 shadow-[0_0_18px_rgba(34,211,238,0.65)]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: reduce ? 0.2 : LOADING_MS / 1000,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </div>

      <motion.p
        className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/35"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.7 }}
      >
        {preparing}
      </motion.p>
    </div>
  );
}

function ErrorScene({
  message,
  title,
  description,
  actionLabel,
  onBack,
  reduce,
}: {
  message: string | null;
  title: string;
  description: string;
  actionLabel: string;
  onBack: () => void;
  reduce: boolean;
}) {
  return (
    <motion.div
      className="flex w-full max-w-md flex-col items-center"
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduce ? 0.15 : 0.55, ease: EASE }}
    >
      <div className="relative">
        <Image
          src="/mascot.svg"
          alt=""
          width={240}
          height={240}
          priority
          className="w-[clamp(130px,20vw,190px)] select-none opacity-60 grayscale"
        />
        <span className="absolute -right-1 bottom-2 flex h-11 w-11 items-center justify-center rounded-full border border-rose-300/30 bg-rose-500/20 text-rose-200 backdrop-blur">
          <AlertTriangle className="h-5 w-5" />
        </span>
      </div>

      <h2 className="mt-6 text-xl font-semibold text-white sm:text-2xl">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/55">
        {message || description}
      </p>

      <button
        type="button"
        onClick={onBack}
        className="mt-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {actionLabel}
      </button>
    </motion.div>
  );
}
