"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en } from "./locales/en";
import { hi } from "./locales/hi";

type Language = "en" | "hi";

interface I18nContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  playTTS: (text: string) => void;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = { en, hi };

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("railniyojak_lang") as Language;
    if (saved && (saved === "en" || saved === "hi")) {
      setLang(saved);
    }
  }, []);

  const changeLang = (l: Language) => {
    setLang(l);
    localStorage.setItem("railniyojak_lang", l);
  };

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  const playTTS = (text: string) => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!mounted) return <>{children}</>;

  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t, playTTS }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    // Return a dummy translation function to avoid errors during initial unmounted render
    return { lang: "en", setLang: () => {}, t: (key: string) => key, playTTS: () => {} };
  }
  return context;
};
