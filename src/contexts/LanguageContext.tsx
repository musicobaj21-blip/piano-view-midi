import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Language } from '../types';

const STORAGE_KEY = 'rumie_piano_lang';

const translations: Record<Language, Record<string, string>> = {
  ES: {
    'app.title': 'Rumie Piano View MIDI',
    'header.sustain': 'SUSTAIN',
    'header.midi': 'MIDI',
    'header.panic': 'Cortar notas',
    'midi.unsupported': 'Navegador sin soporte Web MIDI API. El teclado virtual interactivo está 100% disponible.',
    'midi.denied': 'Permiso MIDI denegado en el navegador. El teclado virtual sigue disponible.',
    'midi.retry': 'Reintentar MIDI',
  },
  EN: {
    'app.title': 'Rumie Piano View MIDI',
    'header.sustain': 'SUSTAIN',
    'header.midi': 'MIDI',
    'header.panic': 'All notes off',
    'midi.unsupported': 'Browser without Web MIDI API support. The interactive virtual keyboard is 100% available.',
    'midi.denied': 'MIDI permission denied in browser. The virtual keyboard remains available.',
    'midi.retry': 'Retry MIDI',
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

function getSafeInitialLanguage(): Language {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'ES' || saved === 'EN') {
        return saved;
      }
      const lower = saved?.toLowerCase();
      if (lower === 'es') return 'ES';
      if (lower === 'en') return 'EN';
    }
  } catch {
    // Ignore storage errors in Safari/iOS Private Browsing
  }
  return 'ES';
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'ES',
  setLanguage: () => {},
  t: (key: string) => String(key || ''),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getSafeInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    const validLang: Language = lang === 'EN' ? 'EN' : 'ES';
    setLanguageState(validLang);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, validLang);
      }
    } catch {
      // Ignore storage errors in Safari/iOS Private Browsing
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language === 'EN' ? 'en' : 'es';
      }
    } catch {
      // Ignore DOM access errors
    }
  }, [language]);

  const t = useCallback(
    (key: string): string => {
      if (!key || typeof key !== 'string') return '';
      const langDict = translations[language] || translations.ES;
      const candidate = langDict?.[key] ?? translations.ES?.[key];
      if (typeof candidate === 'string' && candidate.length > 0) {
        return candidate;
      }
      const cleanFallback = key.includes('.') ? key.split('.').pop() || key : key;
      return String(cleanFallback);
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
