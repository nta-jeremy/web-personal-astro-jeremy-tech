import { useState, useEffect } from 'react';
import en from './en.json';
import vi from './vi.json';

const translationsMap = {
  en,
  vi,
} as const;

export type Locale = 'en' | 'vi';

export function getTranslations(locale: Locale) {
  return translationsMap[locale] || translationsMap.en;
}

export function t(translations: Record<string, unknown>, key: string): string {
  const parts = key.split('.');
  let current: unknown = translations;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }

  if (typeof current === 'string') {
    return current;
  }

  return key;
}

export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/vi/') || path === '/vi') {
      setLocale('vi');
    } else {
      setLocale('en');
    }
  }, []);

  return locale;
}
