import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import type { SkillGroup } from '@data/skills';
import { useLocale } from '@i18n/useLocale';

interface Props {
  skillGroups: SkillGroup[];
}

export default function NightshiftSkills({ skillGroups }: Props) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3"
    >
      {skillGroups.map((group, i) => {
        const last = i === skillGroups.length - 1;
        const n = skillGroups.length;
        const span = [
          last && n % 2 === 1 ? 'md:col-span-2' : '',
          last && n % 3 === 1 ? 'lg:col-span-3' : last && n % 3 === 2 ? 'lg:col-span-2' : '',
        ].join(' ');
        return (
        <motion.section
          key={group.category[locale]}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
          className={`bg-bg p-6 transition-shadow hover:ring-1 hover:ring-inset hover:ring-accent ${span}`}
          aria-label={group.category[locale]}
        >
          <header className="flex items-baseline justify-between gap-4">
            <h3 className="font-heading text-base font-bold uppercase tracking-[0.06em] text-text">
              {group.category[locale]}
            </h3>
            <span className="font-mono text-xs text-text-secondary">
              {String(group.skills.length).padStart(2, '0')}
            </span>
          </header>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {group.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-btn border border-border px-2 py-0.5 font-body text-xs text-text-secondary"
              >
                {skill}
              </li>
            ))}
          </ul>
        </motion.section>
        );
      })}
    </motion.div>
  );
}
