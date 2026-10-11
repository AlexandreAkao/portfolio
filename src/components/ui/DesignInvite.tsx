import { motion } from 'motion/react';
import { designIds, designs, nextDesign } from '@data/designs';
import { t, type Locale } from '@i18n/utils';
import { useLocale } from '@i18n/useLocale';

interface Props {
  /** The world this hero belongs to; the invitation offers the one after it. */
  world: string;
  locale?: Locale;
  delay?: number;
  className?: string;
}

/**
 * "One portfolio, 5 designs. Switch to Avant-garde": the site's premise, shown
 * by doing it. The switch runs through DesignToggle, so it plays the same
 * quick-change curtain as the header.
 */
export default function DesignInvite({ world, locale: localeProp, delay = 0, className = '' }: Props) {
  const liveLocale = useLocale();
  const locale = localeProp ?? liveLocale;
  const next = nextDesign(world);
  const nextLabel = designs.find((d) => d.id === next)?.label ?? next;

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className={`text-sm text-text-secondary ${className}`}
    >
      {t('design.invite', locale).replace('{n}', String(designIds.length))}{' '}
      <button
        type="button"
        onClick={() => document.dispatchEvent(new CustomEvent('site-design:switch', { detail: next }))}
        onPointerEnter={() => document.dispatchEvent(new CustomEvent('site-design:intent'))}
        onFocus={() => document.dispatchEvent(new CustomEvent('site-design:intent'))}
        className="font-medium text-text underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
      >
        {t('design.inviteCta', locale).replace('{name}', nextLabel)}
      </button>
    </motion.p>
  );
}
