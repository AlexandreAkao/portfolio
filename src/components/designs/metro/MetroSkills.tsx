import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import type { SkillGroup } from '@data/skills';
import { useLocale } from '@i18n/useLocale';

interface Props {
  skillGroups: SkillGroup[];
}

const EASE = [0.16, 1, 0.3, 1] as const;

function LineRow({ group, index }: { group: SkillGroup; index: number }) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: EASE }}
      className="flex flex-col gap-3 md:flex-row md:items-start md:gap-0"
    >
      {/* Line badge */}
      <span className="inline-flex shrink-0 self-start rounded-btn bg-accent px-2.5 py-1 font-heading text-xs font-extrabold uppercase tracking-[0.06em] text-white md:mt-[-3px]">
        {group.category[locale]}
      </span>

      {/* Stops */}
      <ul className="relative ml-[5px] flex flex-col gap-3 md:ml-0 md:flex-1 md:flex-row md:flex-wrap md:gap-y-7 md:pl-3">
        {group.skills.map((skill) => (
          <li key={skill} className="group relative flex items-center gap-3 md:min-w-[6.5rem] md:flex-1 md:flex-col md:items-center md:gap-2 md:px-1">
            {/* Line segment: vertical below md, horizontal from md */}
            <span aria-hidden="true" className="absolute bottom-[-0.75rem] left-[4px] top-[-0.75rem] w-0.5 bg-accent md:hidden" />
            <span aria-hidden="true" className="absolute left-0 right-0 top-[4px] hidden h-0.5 bg-accent md:block" />
            <span
              aria-hidden="true"
              className="relative z-10 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-accent bg-white transition-colors group-hover:bg-accent"
            />
            <span className="relative z-10 text-sm font-medium text-text transition-[font-weight] group-hover:font-bold md:text-center">
              {skill}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function MetroSkills({ skillGroups }: Props) {
  return (
    <div className="space-y-10">
      {skillGroups.map((group, i) => (
        <LineRow key={group.category.en} group={group} index={i} />
      ))}
    </div>
  );
}
