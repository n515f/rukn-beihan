import React, { createContext, useContext, useEffect, useState } from 'react';
import enTranslations from '../i18n/en.json';
import arTranslations from '../i18n/ar.json';

type Language = 'en' | 'ar';

interface LangContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

const translations = {
  en: enTranslations,
  ar: arTranslations,
};

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored as Language) || 'en';
  });

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('language', lang);
  }, [lang]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[lang];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) throw new Error('useLang must be used within LangProvider');
  return context;
};
