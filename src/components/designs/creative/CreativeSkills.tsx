import { motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';
import type { SkillGroup } from '@data/skills';
import { useLocale } from '@i18n/useLocale';

interface Props {
  skillGroups: SkillGroup[];
}

export default function CreativeSkills({ skillGroups }: Props) {
  const locale = useLocale();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [activeGroup, setActiveGroup] = useState<number | null>(null);

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
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeGroup === null
              ? 'bg-accent text-white'
              : 'border border-border text-text-secondary hover:border-accent'
          }`}
        >
          All
        </button>
        {skillGroups.map((g, i) => (
          <button
            key={i}
            onClick={() => setActiveGroup(i)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
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
              key={s.skill}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: i * 0.03, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.1, y: -4 }}
              className="cursor-default rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-text shadow-sm transition-shadow hover:border-accent hover:shadow-md"
            >
              {s.skill}
            </motion.span>
          ))}
      </div>
    </motion.div>
  );
}
