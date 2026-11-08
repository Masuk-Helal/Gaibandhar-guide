import { gsap } from "gsap";
import type { MapView } from "@/types/geography";

export interface IntroRefs {
  container: HTMLElement | null;
  bg: HTMLElement | null;
  heading: HTMLElement | null;
  subtitle: HTMLElement | null;
  skipBtn: HTMLElement | null;
  districtPaths: SVGPathElement[];
  gaibandhaPath: SVGPathElement | null;
  label: Element | null;
  marker: Element | null;
}

export interface IntroCallbacks {
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * Scenes 01–02: background fade, country reveal, district border draw,
 * Gaibandha highlight. Then hands off to the camera zoom (Scene 03).
 */
export function createIntroTimeline(refs: IntroRefs, cb: IntroCallbacks) {
  const {
    bg,
    heading,
    subtitle,
    skipBtn,
    districtPaths,
    gaibandhaPath,
    label,
    marker,
  } = refs;

  const tl = gsap.timeline({
    paused: true,
    onComplete: () => cb.onComplete(),
  });

  const cleanups: Array<() => void> = [];

  if (skipBtn) {
    const handler = () => {
      tl.kill();
      cb.onSkip();
    };
    skipBtn.addEventListener("click", handler);
    cleanups.push(() => skipBtn.removeEventListener("click", handler));
  }

  districtPaths.forEach((p) => {
    let len = 1000;
    try {
      len = p.getTotalLength();
    } catch {
      /* ignore */
    }
    p.style.strokeDasharray = String(len);
    p.style.strokeDashoffset = String(len);
  });
  if (gaibandhaPath) {
    let len = 1000;
    try {
      len = gaibandhaPath.getTotalLength();
    } catch {
      /* ignore */
    }
    gaibandhaPath.style.strokeDasharray = String(len);
    gaibandhaPath.style.strokeDashoffset = String(len);
  }

  // Phase 1 — background fade
  tl.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: "power2.inOut" }, 0);

  // Phase 2 — heading / subtitle
  tl.fromTo(
    [heading, subtitle].filter(Boolean) as Element[],
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 1, stagger: 0.18, ease: "power2.out" },
    0.35
  );

  // Phase 3 — district boundaries draw in
  if (districtPaths.length) {
    tl.to(
      districtPaths,
      {
        strokeDashoffset: 0,
        duration: 2.4,
        ease: "power2.inOut",
        stagger: { each: 0.012, from: "random" },
      },
      0.6
    );
  }

  // Phase 4 — Gaibandha golden boundary
  if (gaibandhaPath) {
    tl.to(gaibandhaPath, { strokeDashoffset: 0, duration: 1.1, ease: "power2.out" }, 1.5);
  }

  // Phase 5 — floating label + marker
  tl.to(
    [label, marker].filter(Boolean) as Element[],
    { opacity: 1, duration: 0.7, stagger: 0.18, ease: "power2.out" },
    1.9
  );

  // Fade hero text out as we prepare to move into the district
  tl.to(
    [heading, subtitle].filter(Boolean) as Element[],
    { opacity: 0, y: -18, duration: 0.6, ease: "power2.in" },
    2.6
  );

  tl.to({}, { duration: 0.4 }, 3.1);

  (tl as unknown as { __cleanups?: Array<() => void> }).__cleanups = cleanups;
  return tl;
}

export function destroyIntroTimeline(tl: gsap.core.Timeline | null) {
  if (!tl) return;
  const cleanups = (tl as unknown as { __cleanups?: Array<() => void> }).__cleanups;
  cleanups?.forEach((fn) => fn());
  tl.kill();
}

export const VIEW_MAP: Record<MapView, string> = {
  bangladesh: "BANGLADESH",
  gaibandha: "GAIBANDHA",
  upazila: "GAIBANDHA — UPAZILAS",
};
