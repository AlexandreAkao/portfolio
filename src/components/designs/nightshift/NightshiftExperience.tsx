import { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import type { Experience } from '@data/experience';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import NightshiftVignette from './NightshiftVignette';
import type { VignetteKind } from './NightshiftVignetteScene';

interface Props {
  experiences: Experience[];
}

/** Which lit object stands beside which job. Keyed on the manifest's company line. */
const VIGNETTE_BY_COMPANY: Record<string, VignetteKind> = {
  'Seva / Appointally': 'services',
  'AmbevTech - WMS': 'racking',
  'AmbevTech - BEES': 'truck',
  'AmbevTech - UIKit': 'components',
  'NATI - UNIFOR': 'devices',
  FUNCAP: 'chart',
};

function TechChips({ tech }: { tech: string[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tech">
      {tech.map((item) => (
        <li key={item} className="rounded-btn border border-border px-2 py-0.5 font-body text-xs text-text-secondary">
          {item}
        </li>
      ))}
    </ul>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((bullet, i) => (
        <li key={i} className="flex items-start gap-3 font-body text-sm leading-relaxed text-text-secondary">
          <span className="mt-2 block h-1 w-1 shrink-0 bg-accent" aria-hidden="true" />
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

function Entry({ entry, nested, hidePeriod }: { entry: Experience; nested?: boolean; hidePeriod?: boolean }) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const bullets = entry.bullets[locale];
  const company = nested ? entry.company.replace('AmbevTech - ', '') : entry.company;
  const vignette = VIGNETTE_BY_COMPANY[entry.company];

  return (
    <div className={nested ? 'mt-5 border-l border-border pl-5' : ''}>
      <div className="flex items-start gap-5 md:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className={`font-heading font-bold uppercase leading-none text-text ${nested ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
              {company}
            </h3>
            <span className={`font-heading text-xs font-bold uppercase tracking-[0.1em] text-accent ${hidePeriod ? 'md:hidden' : ''}`}>
              {entry.period}
            </span>
          </div>
          <p className="mt-1 font-body text-sm font-medium text-text-secondary">{entry.role[locale]}</p>
          {entry.summary[locale] && (
            <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-text-secondary">{entry.summary[locale]}</p>
          )}

          {bullets.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="mt-3 inline-flex items-center gap-2 border-b border-transparent font-heading text-xs font-bold uppercase tracking-[0.1em] text-accent transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="block h-1.5 w-1.5 bg-accent" aria-hidden="true" />
              {open ? t('experience.collapse', locale) : t('experience.details', locale)}
            </button>
          )}

          {open && bullets.length > 0 && <Bullets items={bullets} />}

          <TechChips tech={entry.tech} />
        </div>

        {/* The job's own lit object, in a bay beside its line on the manifest */}
        {vignette && (
          <NightshiftVignette kind={vignette} className="h-20 w-20 shrink-0 md:h-36 md:w-36" />
        )}
      </div>
    </div>
  );
}

function ManifestRow({ exp, index }: { exp: Experience; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
      className="border-t border-border py-8 md:grid md:grid-cols-[minmax(0,11rem)_1fr] md:gap-8"
    >
      <div className="hidden md:block">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.1em] text-accent">{exp.period}</p>
      </div>
      <div>
        <Entry entry={exp} hidePeriod />
        {exp.subEntries?.map((sub, i) => (
          <Entry key={i} entry={sub} nested />
        ))}
      </div>
    </motion.article>
  );
}

export default function NightshiftExperience({ experiences }: Props) {
  return (
    <div className="border-b border-border">
      {experiences.map((exp, i) => (
        <ManifestRow key={exp.company} exp={exp} index={i} />
      ))}
    </div>
  );
}
