import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import type { SkillGroup } from '@data/skills';
import { useLocale } from '@i18n/useLocale';

interface Props {
  skillGroups: SkillGroup[];
}

function SkillCategory({
  group,
  index,
  align,
}: {
  group: SkillGroup;
  index: number;
  align: 'left' | 'right';
}) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const num = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`${align === 'right' ? 'md:text-right md:ml-auto' : ''} max-w-lg`}
    >
      <div className={`flex items-baseline gap-3 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
        <span className="text-sm font-medium text-accent">{num}</span>
        <h3
          className="text-[clamp(2rem,4vw,3rem)] font-bold text-text"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {group.category[locale]}
        </h3>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
        className={`my-3 h-px bg-border ${align === 'right' ? 'origin-right' : 'origin-left'}`}
      />

      <div className={`flex flex-wrap gap-x-4 gap-y-2 ${align === 'right' ? 'md:justify-end' : ''}`}>
        {group.skills.map((skill, si) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.3 + si * 0.04 }}
            className="text-sm text-text-secondary transition-colors hover:text-accent"
            style={{
              fontFamily: 'var(--font-body)',
              textDecorationLine: 'none',
              borderBottom: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderBottomColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.borderBottomColor = 'transparent';
            }}
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

export default function EditorialSkills({ skillGroups }: Props) {
  return (
    <div className="space-y-12">
      {skillGroups.map((group, i) => (
        <SkillCategory
          key={i}
          group={group}
          index={i}
          align={i % 2 === 0 ? 'left' : 'right'}
        />
      ))}
    </div>
  );
}
