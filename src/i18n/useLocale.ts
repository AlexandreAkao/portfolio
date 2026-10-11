import { createContext, useContext, useSyncExternalStore } from 'react';
import type { Locale } from './utils';

/**
 * The language a page was rendered in: 'pt' on /pt/ and on Portuguese posts,
 * 'en' everywhere else. Islands receive it as a prop (see withServerLocale) so
 * they render in that language on the server, without JavaScript too.
 */
export const ServerLocaleContext = createContext<Locale>('en');

/**
 * The active locale, read from <html data-lang>.
 *
 * Islands are server-rendered in the page's language and may hydrate at any
 * time, including after the visitor has switched languages. useSyncExternalStore
 * hydrates with the server snapshot (the page's language) and re-renders with
 * the live value right after, so a page never reports a hydration text mismatch.
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

export function useLocale(): Locale {
  const serverLocale = useContext(ServerLocaleContext);
  return useSyncExternalStore(subscribe, read, () => serverLocale);
}
