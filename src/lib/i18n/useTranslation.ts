"use client";

import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { translations, TranslationDictionary } from "./translations";
import { AppLanguage } from "../types/erp";

export function useTranslation() {
  const activeLanguage = useQuantersStore((s) => s.activeLanguage || "en") as AppLanguage;
  const setLanguage = useQuantersStore((s) => s.setLanguage);

  const t: TranslationDictionary =
    (translations[activeLanguage] as unknown as TranslationDictionary) || translations.en;
  const isRtl = activeLanguage === "ar";

  return {
    t,
    lang: activeLanguage,
    setLanguage,
    isRtl,
  };
}
