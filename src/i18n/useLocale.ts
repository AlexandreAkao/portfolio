import { useSyncExternalStore } from 'react';
import type { Locale } from './utils';

/**
 * The active locale, read from <html data-lang>.
 *
 * Islands are server-rendered in English and may hydrate at any time, including
 * after the visitor has switched to Portuguese. useSyncExternalStore hydrates
 * with the server snapshot (English) and re-renders with the live value right
 * after, so a Portuguese page never reports a hydration text mismatch.
 */
const read = (): Locale => {
  const lang = document.documentElement.dataset.lang;
  return lang === 'pt' ? 'pt' : 'en';
};

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
  return () => observer.disconnect();
};

const getServerSnapshot = (): Locale => 'en';

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, read, getServerSnapshot);
}
