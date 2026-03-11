import { useLocale } from '@i18n/useLocale';
import { safeSetItem } from '@/lib/storage';
import ErrorBoundary from '@components/ui/ErrorBoundary';

function LanguageSwitcherInner() {
  const locale = useLocale();

  const toggle = () => {
    const next = locale === 'en' ? 'pt' : 'en';
    document.documentElement.dataset.lang = next;
    safeSetItem('lang', next);
    const url = new URL(window.location.href);
    if (next === 'en') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', next);
    }
    window.history.replaceState({}, '', url);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:text-accent"
      aria-label={locale === 'en' ? 'Switch to Portuguese' : 'Switch to English'}
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
