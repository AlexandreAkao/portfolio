import { motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { getSkillLabel, type SkillGroup } from '@data/skills';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import { withServerLocale } from '@i18n/withServerLocale';

interface Props {
  skillGroups: SkillGroup[];
}

function CreativeSkills({ skillGroups }: Props) {
  const locale = useLocale();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  // Opens on the first category: the full cloud is one tap away under "All".
  const [activeGroup, setActiveGroup] = useState<number | null>(0);

  const allSkills = skillGroups.flatMap((g, gi) =>
    g.skills.map((s) => ({ skill: s, group: g.category[locale], gi }))
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setActiveGroup(null)}
          aria-pressed={activeGroup === null}
          className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium transition-all md:min-h-0 ${
            activeGroup === null
              ? 'bg-accent text-white'
              : 'border border-border text-text-secondary hover:border-accent'
          }`}
        >
          {t('blog.filter.all', locale)}
        </button>
        {skillGroups.map((g, i) => (
          <button
            key={i}
            onClick={() => setActiveGroup(i)}
            aria-pressed={activeGroup === i}
            className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium transition-all md:min-h-0 ${
              activeGroup === i
                ? 'bg-accent text-white'
                : 'border border-border text-text-secondary hover:border-accent'
            }`}
          >
            {g.category[locale]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {allSkills
          .filter((s) => activeGroup === null || s.gi === activeGroup)
          .map((s, i) => (
            <motion.span
              key={getSkillLabel(s.skill, locale)}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: i * 0.03, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.1, y: -4 }}
              className="cursor-default rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-text shadow-sm transition-shadow hover:border-accent hover:shadow-md"
            >
              {getSkillLabel(s.skill, locale)}
            </motion.span>
          ))}
      </div>
    </motion.div>
  );
}

export default withServerLocale(CreativeSkills);
