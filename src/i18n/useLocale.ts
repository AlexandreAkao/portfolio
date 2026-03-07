import { useState, useEffect } from 'react';
import type { Locale } from './utils';

export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof document !== 'undefined') {
      return (document.documentElement.dataset.lang as Locale) || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const lang = document.documentElement.dataset.lang as Locale;
      if (lang && lang !== locale) setLocale(lang);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-lang'],
    });
    return () => observer.disconnect();
  }, [locale]);

  return locale;
}
