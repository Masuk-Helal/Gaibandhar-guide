"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface LanguageToggleProps {
  variant?: "dark" | "light";
  className?: string;
}

export function LanguageToggle({
  variant = "dark",
  className,
}: LanguageToggleProps) {
  const { locale, toggleLocale, t } = useTranslation();
  const isBangla = locale === "bn";

  const shell =
    variant === "dark"
      ? "border-white/10 bg-white/[0.04] text-white/55 backdrop-blur-md"
      : "border-black/10 bg-black/[0.03] text-slate-500";
  const thumb =
    variant === "dark"
      ? "bg-cyan-400/15 ring-1 ring-inset ring-cyan-300/40"
      : "bg-cyan-500/10 ring-1 ring-inset ring-cyan-500/30";
  const activeText = variant === "dark" ? "text-cyan-200" : "text-cyan-700";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isBangla}
      aria-label={t("language.switch")}
      title={t("language.switch")}
      onClick={toggleLocale}
      className={cn(
        "group relative flex h-9 w-[92px] items-center rounded-full border p-1 transition-colors",
        shell,
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-1 top-1 h-7 w-[42px] rounded-full transition-transform duration-300 ease-out",
          thumb,
          isBangla ? "translate-x-[42px]" : "translate-x-0"
        )}
      />
      <span
        className={cn(
          "relative z-10 flex w-[42px] items-center justify-center text-[9px] font-semibold uppercase tracking-[0.16em] transition-colors",
          !isBangla && activeText
        )}
      >
        {t("language.english")}
      </span>
      <span
        className={cn(
          "relative z-10 flex w-[42px] items-center justify-center text-[10px] font-semibold transition-colors",
          isBangla && activeText
        )}
      >
        {t("language.bangla")}
      </span>
    </button>
  );
}
