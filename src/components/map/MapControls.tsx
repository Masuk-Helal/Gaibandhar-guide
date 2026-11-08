"use client";

import {
  Plus,
  Minus,
  RotateCcw,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleBoundaries: () => void;
  onToggleFullscreen: () => void;
  boundariesVisible: boolean;
  isFullscreen: boolean;
}

function ControlButton({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "group flex h-10 w-10 items-center justify-center rounded-xl text-white/55 transition-all duration-200",
        "hover:bg-white/[0.06] hover:text-cyan-200 active:scale-95",
        active && "text-cyan-300"
      )}
    >
      {children}
    </button>
  );
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleBoundaries,
  onToggleFullscreen,
  boundariesVisible,
  isFullscreen,
}: MapControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="pointer-events-auto fixed bottom-24 right-5 z-30 sm:bottom-8 sm:right-8">
      <div className="flex flex-col items-center gap-0.5 rounded-2xl border border-white/10 bg-white/[0.035] p-1.5 backdrop-blur-xl">
        <ControlButton label={t("controls.zoomIn")} onClick={onZoomIn}>
          <Plus className="h-4 w-4" />
        </ControlButton>
        <ControlButton label={t("controls.zoomOut")} onClick={onZoomOut}>
          <Minus className="h-4 w-4" />
        </ControlButton>
        <div className="my-0.5 h-px w-6 bg-white/10" />
        <ControlButton label={t("controls.resetView")} onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
        </ControlButton>
        <ControlButton
          label={
            boundariesVisible
              ? t("controls.hideBoundaries")
              : t("controls.showBoundaries")
          }
          onClick={onToggleBoundaries}
          active={boundariesVisible}
        >
          {boundariesVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </ControlButton>
        <ControlButton
          label={t("controls.fullscreen")}
          onClick={onToggleFullscreen}
          active={isFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </ControlButton>
      </div>
    </div>
  );
}
