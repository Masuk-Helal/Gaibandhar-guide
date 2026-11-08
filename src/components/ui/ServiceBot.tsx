"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bus,
  Hospital,
  Hotel,
  Mountain,
  TrainFront,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/lib/i18n";
import { useDetailTransitionStore } from "@/store/detailTransitionStore";

const CENTER = { x: 86, y: 74 };
const RADIUS = 78;

interface Service {
  key: string;
  labelKey: TranslationKey;
  Icon: LucideIcon;
  ink: string;
  accent: string;
  angle: number;
}

const SERVICES: Service[] = [
  { key: "hotels", labelKey: "categories.hotels.label", Icon: Hotel, ink: "#d97706", accent: "#fbbf24", angle: 270 },
  { key: "bus", labelKey: "categories.bus.label", Icon: Bus, ink: "#7c3aed", accent: "#a78bfa", angle: 250 },
  { key: "train", labelKey: "categories.train.label", Icon: TrainFront, ink: "#0891b2", accent: "#22d3ee", angle: 230 },
  { key: "restaurants", labelKey: "categories.restaurants.label", Icon: UtensilsCrossed, ink: "#ea580c", accent: "#fb923c", angle: 210 },
  { key: "tourism", labelKey: "categories.tourism.label", Icon: Mountain, ink: "#059669", accent: "#34d399", angle: 190 },
  { key: "hospital", labelKey: "categories.hospital.label", Icon: Hospital, ink: "#dc2626", accent: "#f87171", angle: 170 },
];

function polar(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: CENTER.x + RADIUS * Math.cos(rad),
    y: CENTER.y + RADIUS * Math.sin(rad),
  };
}

export function ServiceBot({ upazila }: { upazila?: string | null }) {
  const { t } = useTranslation();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const detailPhase = useDetailTransitionStore((state) => state.phase);

  const go = (key: string) => {
    const query = upazila ? `?upazila=${encodeURIComponent(upazila)}` : "";
    router.push(`/explore/${key}${query}`);
  };

  if (detailPhase !== "idle") return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-6 z-50 h-[220px] w-[225px] sm:bottom-8 sm:right-10 sm:h-[300px] sm:w-[320px]">
      {/* Connection lines */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        {SERVICES.map((service, i) => {
          const p = polar(service.angle);
          return (
            <motion.line
              key={service.key}
              x1={CENTER.x}
              y1={CENTER.y}
              x2={p.x}
              y2={p.y}
              stroke="rgba(8,145,178,0.3)"
              strokeWidth="0.22"
              strokeDasharray="0.8 1.8"
              initial={false}
              animate={{ opacity: open ? 1 : 0 }}
              transition={{ duration: 0.3, delay: open ? 0.12 + i * 0.05 : 0 }}
            />
          );
        })}
      </svg>

      {/* Ground glow */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(34,211,238,0.3)_0%,rgba(52,211,153,0.14)_48%,transparent_72%)] blur-lg"
        style={{
          left: `${CENTER.x - 4}%`,
          top: `${CENTER.y + 14}%`,
          width: "52%",
          height: "18%",
        }}
        aria-hidden
      />

      {/* Bot */}
      <div
        className="pointer-events-auto absolute z-20 w-[32%] sm:w-[34%]"
        style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%`, transform: "translate(-50%, -58%)" }}
      >
        <motion.button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Hide services" : "Show services"}
          aria-expanded={open}
          className="block w-full cursor-pointer transition-transform duration-300 hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, -7, 0, 5, 0], rotate: [0, 1.2, 0, -0.9, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/mascot.svg"
              alt="Gaibandha assistant"
              width={280}
              height={280}
              priority
              className="w-full scale-[1.4] select-none drop-shadow-[0_16px_26px_rgba(2,4,12,0.28)]"
            />
          </motion.div>
        </motion.button>
      </div>

      {/* Service nodes — fan on the left side of the bot */}
      {SERVICES.map((service, i) => {
        const p = polar(service.angle);
        const Icon = service.Icon;
        return (
          <div
            key={service.key}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <motion.div
              initial={false}
              animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.2 }}
              transition={{
                duration: 0.32,
                delay: open ? 0.06 + i * 0.055 : 0,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className={open ? "pointer-events-auto" : "pointer-events-none"}
            >
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => go(service.key)}
                  aria-label={t(service.labelKey)}
                   className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200/80 bg-white shadow-[0_12px_28px_-10px_rgba(2,4,12,0.45)] transition-transform duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 sm:h-12 sm:w-12"
                  style={{ color: service.ink }}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.7} />
                </button>
                <span className="hidden whitespace-nowrap rounded bg-white/75 px-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:block">
                  {t(service.labelKey)}
                </span>
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
