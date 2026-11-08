"use client";

import { useEffect, useRef, useState } from "react";
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
import { useMapStore } from "@/store/mapStore";
import { useTransitionStore } from "@/store/transitionStore";
import type { PlaceCategory } from "@/data/upazila-places";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/lib/i18n";

const RADIUS = 35;

const ROBOT_DELAY = 0;
const ROBOT_DURATION = 0.55;
const NODE_DELAY = 0.32;
const NODE_STAGGER = 0.055;
const NODE_DURATION = 0.34;

interface Category {
  key: PlaceCategory;
  labelKey: TranslationKey;
  angle: number;
  ink: string;
  accent: string;
  Icon: LucideIcon;
}

const CATEGORIES: Category[] = [
  {
    key: "hotels",
    labelKey: "categories.hotels.label",
    angle: -90,
    ink: "#d97706",
    accent: "#fbbf24",
    Icon: Hotel,
  },
  {
    key: "restaurants",
    labelKey: "categories.restaurants.label",
    angle: -30,
    ink: "#ea580c",
    accent: "#fb923c",
    Icon: UtensilsCrossed,
  },
  {
    key: "tourism",
    labelKey: "categories.tourism.label",
    angle: 30,
    ink: "#059669",
    accent: "#34d399",
    Icon: Mountain,
  },
  {
    key: "hospital",
    labelKey: "categories.hospital.label",
    angle: 90,
    ink: "#dc2626",
    accent: "#f87171",
    Icon: Hospital,
  },
  {
    key: "train",
    labelKey: "categories.train.label",
    angle: 150,
    ink: "#0891b2",
    accent: "#22d3ee",
    Icon: TrainFront,
  },
  {
    key: "bus",
    labelKey: "categories.bus.label",
    angle: 210,
    ink: "#7c3aed",
    accent: "#a78bfa",
    Icon: Bus,
  },
];

function polar(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: 50 + RADIUS * Math.cos(rad),
    y: 50 + RADIUS * Math.sin(rad),
  };
}

interface UpazilaRobotStageProps {
  centroid: [number, number];
  name: string;
  upazilaCode: string;
}

export function UpazilaRobotStage({
  centroid,
  name,
  upazilaCode,
}: UpazilaRobotStageProps) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { t } = useTranslation();
  const camera = useMapStore((s) => s.camera);
  const [launching, setLaunching] = useState<PlaceCategory | null>(null);
  const launchTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (launchTimer.current) window.clearTimeout(launchTimer.current);
    };
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setLaunching(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [upazilaCode]);

  const launch = (category: Category, btn: HTMLButtonElement | null) => {
    if (launching) return;

    const href = `/explore/${category.key}?upazila=${encodeURIComponent(name)}`;
    if (reduce) {
      router.push(href);
      return;
    }

    setLaunching(category.key);

    if (btn) {
      const rect = btn.getBoundingClientRect();
      window.setTimeout(() => {
        useTransitionStore.getState().start(
          {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height,
          },
          category.accent
        );
      }, 60);
    }

    launchTimer.current = window.setTimeout(() => {
      router.push(href);
    }, 900);
  };

  const left = camera.x + centroid[0] * camera.scale;
  const top = camera.y + centroid[1] * camera.scale;

  return (
    <motion.div
      className="pointer-events-none absolute z-30 aspect-square"
      style={{
        left,
        top,
        width: "min(94vw, 70vh, 620px)",
        x: "-50%",
        y: "-50%",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.82, transition: { duration: 0.22 } }}
      transition={{ duration: 0.2 }}
    >
      {/* Connection lines */}
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        {CATEGORIES.map((cat, i) => {
          const p = polar(cat.angle);
          return (
            <motion.line
              key={cat.key}
              x1="50"
              y1="50"
              x2={p.x}
              y2={p.y}
              stroke="rgba(125,211,252,0.16)"
              strokeWidth="0.18"
              strokeDasharray="0.7 1.6"
              className="mascot-line"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: NODE_DELAY + i * NODE_STAGGER,
                duration: 0.3,
              }}
            />
          );
        })}
      </svg>

      {/* Outer orbit */}
      <motion.svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ transformOrigin: "50% 50%" }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1, rotate: reduce ? 0 : 360 }}
        transition={{
          opacity: { delay: 0.3, duration: 0.55 },
          scale: { delay: 0.3, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
        }}
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="rgba(125,211,252,0.24)"
          strokeWidth="0.22"
          strokeDasharray="0.9 2.4"
        />
        <circle cx="85" cy="50" r="0.7" fill="#22d3ee" opacity="0.75" />
        <circle cx="50" cy="15" r="0.5" fill="#fcd34d" opacity="0.6" />
        <circle
          cx="25.25"
          cy="74.75"
          r="0.45"
          fill="#34d399"
          opacity="0.55"
        />
      </motion.svg>

      {/* Inner orbit */}
      <motion.svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ transformOrigin: "50% 50%" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, rotate: reduce ? 0 : -360 }}
        transition={{
          opacity: { delay: 0.4, duration: 0.55 },
          rotate: { duration: 85, repeat: Infinity, ease: "linear" },
        }}
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r="27"
          fill="none"
          stroke="rgba(125,211,252,0.1)"
          strokeWidth="0.16"
          strokeDasharray="0.4 3"
        />
        <circle cx="77" cy="50" r="0.4" fill="#a7f3d0" opacity="0.5" />
      </motion.svg>

      {/* Ground glow */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[75%] h-[9%] w-[46%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(34,211,238,0.22)_0%,rgba(52,211,153,0.1)_45%,transparent_72%)] blur-lg"
        initial={{ opacity: 0, scale: 0.45 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: ROBOT_DELAY + 0.25,
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
      />

      {/* Mascot — emerges up from the selected upazila centre */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 w-[64%] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          initial={{
            opacity: 0,
            y: "22%",
            scale: 0.6,
            rotate: -6,
            filter: "blur(8px)",
          }}
          animate={{
            opacity: 1,
            y: "0%",
            scale: 1,
            rotate: 0,
            filter: "blur(0px)",
          }}
          transition={{
            delay: ROBOT_DELAY,
            duration: ROBOT_DURATION,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <motion.img
            src="/mascot.svg"
            alt=""
            draggable={false}
            animate={
              reduce
                ? undefined
                : {
                    y: [0, -6, 0, 4, 0],
                    rotate: [0, 1.2, 0, -0.9, 0],
                  }
            }
            transition={{
              delay: ROBOT_DELAY + ROBOT_DURATION,
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full select-none"
          />
        </motion.div>
      </div>

      {/* Category nodes — fly out from the robot body */}
      {CATEGORIES.map((cat, i) => {
        const p = polar(cat.angle);
        const Icon = cat.Icon;
        const isActive = launching === cat.key;
        const enterDelay = NODE_DELAY + i * NODE_STAGGER;
        return (
          <motion.div
            key={cat.key}
            className="absolute z-10"
            initial={{
              left: "50%",
              top: "50%",
              opacity: 0,
              scale: 0,
            }}
            animate={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: enterDelay,
              duration: NODE_DURATION,
              ease: [0.22, 1, 0.36, 1],
              left: { delay: enterDelay, duration: NODE_DURATION },
              top: { delay: enterDelay, duration: NODE_DURATION },
              opacity: { delay: enterDelay + 0.04, duration: 0.3 },
              scale: {
                delay: enterDelay,
                duration: NODE_DURATION,
                ease: [0.34, 1.56, 0.64, 1],
              },
            }}
            style={{ x: "-50%", y: "-50%" }}
          >
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div
                className={reduce ? undefined : "mascot-node-float"}
                style={{
                  animationDelay: `${enterDelay + NODE_DURATION + i * 0.4}s`,
                }}
              >
                <button
                  type="button"
                  aria-label={`${t(cat.labelKey)} · ${name}`}
                  aria-pressed={isActive}
                  disabled={!!launching}
                  onClick={(e) => launch(cat, e.currentTarget)}
                  className="group pointer-events-auto relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/60 bg-white/[0.95] shadow-[0_14px_36px_-12px_rgba(0,0,0,0.9)] transition-transform duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:hover:scale-100 sm:h-16 sm:w-16"
                  style={{ color: cat.ink }}
                >
                  <Icon
                    className="relative h-4 w-4 sm:h-5 sm:w-5"
                    strokeWidth={1.7}
                  />
                </button>
              </div>
              <span
                className={`whitespace-nowrap text-[8px] uppercase tracking-[0.18em] transition-colors sm:text-[9px] ${
                  isActive ? "text-white" : "text-white/65"
                }`}
                style={isActive ? { color: cat.accent } : undefined}
              >
                {t(cat.labelKey)}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
