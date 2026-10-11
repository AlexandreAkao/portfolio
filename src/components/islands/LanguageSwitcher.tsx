import { navigate } from 'astro:transitions/client';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import { safeSetItem } from '@/lib/storage';
import ErrorBoundary from '@components/ui/ErrorBoundary';

const isHome = (pathname: string) => pathname === '/' || /^\/pt\/?$/.test(pathname);

function LanguageSwitcherInner() {
  const locale = useLocale();

  const toggle = () => {
    const next = locale === 'en' ? 'pt' : 'en';
    safeSetItem('lang', next);
    const { pathname } = window.location;

    // A post and its translation are separate pages: open the other one when it exists.
    const alternate = document.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${next === 'pt' ? 'pt-BR' : 'en'}"]`,
    );
    const alternatePath = alternate ? new URL(alternate.href).pathname : null;
    if (!isHome(pathname) && alternatePath && alternatePath !== pathname) {
      navigate(alternatePath);
      return;
    }

    // Everything else renders both languages: switch in place and keep the address in step.
    document.documentElement.dataset.lang = next;
    document.documentElement.lang = next;
    const url = new URL(window.location.href);
    url.searchParams.delete('lang');
    if (isHome(pathname)) {
      url.pathname = next === 'pt' ? '/pt/' : '/';
    } else if (next === 'pt') {
      url.searchParams.set('lang', next);
    }
    window.history.replaceState(window.history.state, '', url);
  };

  return (
    <button
      onClick={toggle}
      className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:text-accent md:h-auto md:min-w-0"
      aria-label={`${locale === 'en' ? 'PT' : 'EN'}: ${t('lang.switch', locale)}`}
    >
      {locale === 'en' ? 'PT' : 'EN'}
    </button>
  );
}

export default function LanguageSwitcher() {
  return (
    <ErrorBoundary>
      <LanguageSwitcherInner />
    </ErrorBoundary>
  );
}
