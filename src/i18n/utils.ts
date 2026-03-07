import en from './en.json';
import pt from './pt.json';

const translations: Record<string, Record<string, string>> = { en, pt };

export type Locale = 'en' | 'pt';

export function t(key: string, locale: Locale = 'en'): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (lang === 'pt') return 'pt';
  return 'en';
}

export function getLocalizedPath(path: string, locale: Locale): string {
  if (locale === 'en') return path;
  return `/pt${path}`;
}
