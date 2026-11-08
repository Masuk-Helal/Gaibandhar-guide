"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/store/localeStore";

export function LocaleSync() {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    useLocaleStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
