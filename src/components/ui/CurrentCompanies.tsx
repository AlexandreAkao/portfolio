import { Fragment } from 'react';
import { currentCompanies } from '@data/experience';
import { t, type Locale } from '@i18n/utils';

interface Props {
  locale: Locale;
  companyClassName?: string;
}

/**
 * "Currently at Seva / Appointally · AmbevTech", derived from the roles still
 * in progress. Each hero wraps it in a line of its own world.
 */
export default function CurrentCompanies({ locale, companyClassName = '' }: Props) {
  return (
    <>
      {t('hero.now', locale)}{' '}
      {currentCompanies.map((company, i) => (
        <Fragment key={company}>
          {i > 0 && ' · '}
          <span className={`whitespace-nowrap ${companyClassName}`}>{company}</span>
        </Fragment>
      ))}
    </>
  );
}
