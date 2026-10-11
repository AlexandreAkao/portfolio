import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import { email } from '@data/social';
import ErrorBoundary from '@components/ui/ErrorBoundary';

type Status = 'idle' | 'copied' | 'selected';

/** The address in plain sight, for pasting into an ATS or a mail client, with a copy button. */
function EmailCopyInner({ showAddress = true, className = '' }: { showAddress?: boolean; className?: string }) {
  const locale = useLocale();
  const [status, setStatus] = useState<Status>('idle');
  const addressRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setStatus('copied');
    } catch {
      // No clipboard access: select the address so the visitor can copy it themselves.
      const selection = window.getSelection();
      if (addressRef.current && selection) {
        const range = document.createRange();
        range.selectNodeContents(addressRef.current);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setStatus('selected');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus('idle'), 2500);
  };

  const label =
    status === 'copied' ? t('contact.copied', locale) : status === 'selected' ? t('contact.selected', locale) : t('contact.copy', locale);

  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-3">
      <span ref={addressRef} className={showAddress ? 'select-all text-text' : 'sr-only'}>
        {email}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={t('contact.copyLabel', locale)}
        className={className || 'rounded-btn border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent'}
      >
        {label}
      </button>
      <span role="status" className="sr-only">
        {status === 'idle' ? '' : label}
      </span>
    </span>
  );
}

export default function EmailCopy(props: { showAddress?: boolean; className?: string }) {
  return (
    <ErrorBoundary fallback={<span className="select-all text-text">{email}</span>}>
      <EmailCopyInner {...props} />
    </ErrorBoundary>
  );
}
