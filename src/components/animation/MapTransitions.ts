import { gsap } from "gsap";
import type { CameraState } from "@/types/geography";

export interface ProjectedBBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export function cameraForProjectedBBox(
  bbox: ProjectedBBox,
  width: number,
  height: number,
  padding = 70,
  maxScale = 18
): CameraState {
  const bw = Math.max(bbox.x1 - bbox.x0, 1);
  const bh = Math.max(bbox.y1 - bbox.y0, 1);
  const cx = (bbox.x0 + bbox.x1) / 2;
  const cy = (bbox.y0 + bbox.y1) / 2;

  let scale = Math.min((width - padding * 2) / bw, (height - padding * 2) / bh);
  scale = Math.max(1, Math.min(scale, maxScale));

  return {
    scale,
    x: width / 2 - scale * cx,
    y: height / 2 - scale * cy,
  };
}

export function applyCamera(mapGroup: SVGElement | null, cam: CameraState) {
  if (!mapGroup) return;
  mapGroup.setAttribute(
    "transform",
    `translate(${cam.x.toFixed(3)},${cam.y.toFixed(3)}) scale(${cam.scale.toFixed(5)})`
  );
}

const activeTweens = new WeakMap<SVGElement, gsap.core.Tween>();

export function animateCamera(
  mapGroup: SVGElement | null,
  from: CameraState,
  to: CameraState,
  duration = 2,
  onUpdate?: (cam: CameraState) => void,
  onComplete?: () => void
) {
  if (mapGroup) {
    activeTweens.get(mapGroup)?.kill();
  }

  const cam = { ...from };
  const tween = gsap.to(cam, {
    scale: to.scale,
    x: to.x,
    y: to.y,
    duration,
    ease: "power2.inOut",
    onUpdate: () => {
      applyCamera(mapGroup, cam);
      onUpdate?.({ ...cam });
    },
    onComplete: () => {
      if (mapGroup) activeTweens.delete(mapGroup);
      applyCamera(mapGroup, to);
      onUpdate?.(to);
      onComplete?.();
    },
  });

  if (mapGroup) activeTweens.set(mapGroup, tween);
  return tween;
}

export function resetCamera(
  mapGroup: SVGElement | null,
  from: CameraState,
  duration = 1.5,
  onUpdate?: (cam: CameraState) => void,
  onComplete?: () => void
) {
  return animateCamera(mapGroup, from, { scale: 1, x: 0, y: 0 }, duration, onUpdate, onComplete);
}
