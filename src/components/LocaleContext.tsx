"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../../public/locales/en.json";
import hi from "../../public/locales/hi.json";
import ar from "../../public/locales/ar.json";
import fr from "../../public/locales/fr.json";
import es from "../../public/locales/es.json";

type Locale = "en" | "hi" | "ar" | "fr" | "es";

const translations: Record<Locale, Record<string, string>> = {
  en,
  hi,
  ar,
  fr,
  es,
};

interface LocaleContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("flowforge_locale", newLocale);
  };

  useEffect(() => {
    const savedLocale = localStorage.getItem("flowforge_locale") as Locale;
    if (savedLocale && translations[savedLocale]) {
      setLocaleState(savedLocale);
    }
  }, []);

  useEffect(() => {
    // Set html tag dir attribute for RTL support (Arabic)
    const direction = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key: string): string => {
    const dict = translations[locale] || translations["en"];
    return dict[key] || translations["en"][key] || key;
  };

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
