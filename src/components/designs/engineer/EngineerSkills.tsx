import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import type { SkillGroup } from '@data/skills';
import { useLocale } from '@i18n/useLocale';

interface Props {
  skillGroups: SkillGroup[];
}

export default function EngineerSkills({ skillGroups }: Props) {
  const locale = useLocale();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="rounded-xs border border-border bg-bg-secondary p-6 font-mono text-sm"
    >
      <div className="mb-4 text-text-secondary">
        <span className="text-accent">{'{'}</span>
      </div>

      {skillGroups.map((group, i) => (
        <motion.div
          key={group.category[locale]}
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="mb-3 pl-4"
        >
          <span className="text-accent">"{group.category[locale]}"</span>
          <span className="text-text-secondary">: [</span>
          <div className="pl-4">
            {group.skills.map((skill, j) => (
              <span key={skill}>
                <span className="text-text">"{skill}"</span>
                {j < group.skills.length - 1 && <span className="text-text-secondary">, </span>}
              </span>
            ))}
          </div>
          <span className="text-text-secondary">]{i < skillGroups.length - 1 ? ',' : ''}</span>
        </motion.div>
      ))}

      <div className="text-text-secondary">
        <span className="text-accent">{'}'}</span>
      </div>
    </motion.div>
  );
}
