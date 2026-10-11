import type { Locale } from '@i18n/utils';

/** The "Last login" date the session prints, formatted at build time so the hero and the curtain agree. */
export const loginDate = (locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());
