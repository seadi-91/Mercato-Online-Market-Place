"use client";

import React, { useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { useLanguageStore } from "@/store/language-store";
import { translations } from "@/lib/i18n/translations";

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { language, initLanguage } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initLanguage();
    setMounted(true);
  }, [initLanguage]);

  // Use current language messages, fallback to English if not yet hydrated or missing
  const currentMessages = translations[language] || translations.en;

  return (
    <NextIntlClientProvider
      locale={language}
      messages={currentMessages as any}
      timeZone="Africa/Addis_Ababa"
    >
      {children}
    </NextIntlClientProvider>
  );
}
