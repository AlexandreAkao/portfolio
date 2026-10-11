import { Fragment } from 'react';
import { currentCompanies } from '@data/experience';
import { t, type Locale } from '@i18n/utils';

interface Props {
  locale: Locale;
  companyClassName?: string;
}

/**
 * "Currently at Seva / Appointally and AmbevTech", derived from the roles still
 * in progress and joined the way each language joins a list. Each hero wraps it
 * in a line of its own world.
 */
export default function CurrentCompanies({ locale, companyClassName = '' }: Props) {
  const parts = new Intl.ListFormat(locale === 'pt' ? 'pt-BR' : 'en', { type: 'conjunction' }).formatToParts(currentCompanies);
  return (
    <>
      {t('hero.now', locale)}{' '}
      {parts.map((part, i) =>
        part.type === 'element' ? (
          <span key={i} className={`whitespace-nowrap ${companyClassName}`}>
            {part.value}
          </span>
        ) : (
          <Fragment key={i}>{part.value}</Fragment>
        ),
      )}
    </>
  );
}
