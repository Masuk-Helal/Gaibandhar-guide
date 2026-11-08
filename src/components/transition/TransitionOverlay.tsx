"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useTransitionStore } from "@/store/transitionStore";

export function TransitionOverlay() {
  const active = useTransitionStore((s) => s.active);
  const origin = useTransitionStore((s) => s.origin);
  const phase = useTransitionStore((s) => s.phase);
  const reset = useTransitionStore((s) => s.reset);
  const setPhase = useTransitionStore((s) => s.setPhase);
  const pathname = usePathname();

  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!active) return;
    if (phase !== "expand") return;
    const t = window.setTimeout(() => setPhase("fade"), 1000);
    return () => window.clearTimeout(t);
  }, [active, phase, setPhase]);

  useEffect(() => {
    if (phase !== "fade") return;
    const t = window.setTimeout(() => {
      setPhase("done");
      reset();
    }, 450);
    return () => window.clearTimeout(t);
  }, [phase, setPhase, reset]);

  useEffect(() => {
    // reset on navigation back to home
    if (pathname === "/") {
      const t = window.setTimeout(() => reset(), 50);
      return () => window.clearTimeout(t);
    }
  }, [pathname, reset]);

  if (!active || !origin) return null;

  const width = Math.max(origin.width, 1);
  const height = Math.max(origin.height, 1);
  const vw = viewport.w || 1920;
  const vh = viewport.h || 1080;
  const farX = Math.max(origin.x, vw - origin.x);
  const farY = Math.max(origin.y, vh - origin.y);
  const radius = Math.hypot(farX, farY);
  const scale = (radius * 2.1) / Math.min(width, height) + 1;

  return (
    <AnimatePresence>
      <motion.div
        className="pointer-events-none fixed inset-0 z-[9999]"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "done" ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="absolute rounded-full"
          style={{
            left: origin.x,
            top: origin.y,
            width,
            height,
            marginLeft: -width / 2,
            marginTop: -height / 2,
            borderRadius: 9999,
            backgroundColor: "#ffffff",
            transformOrigin: "center",
            willChange: "transform",
          }}
          initial={{ scale: 0.2, opacity: 1 }}
          animate={{ scale, opacity: 1 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
