"use client";

import { useCallback } from "react";
import { useLocaleStore } from "@/store/localeStore";
import {
  format,
  translate,
  type Locale,
  type TranslationKey,
} from "@/lib/i18n";

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const toggleLocale = useLocaleStore((s) => s.toggleLocale);

  const t = useCallback(
    (key: TranslationKey, values?: Record<string, string | number>) => {
      const template = translate(locale, key);
      return values ? format(template, values) : template;
    },
    [locale]
  );

  return {
    locale: locale as Locale,
    setLocale,
    toggleLocale,
    t,
  };
}
