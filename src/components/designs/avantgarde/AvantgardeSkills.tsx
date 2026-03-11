import { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import type { SkillGroup } from '@data/skills';
import { useLocale } from '@i18n/useLocale';

interface Props {
  skillGroups: SkillGroup[];
}

function CategoryBlock({
  group,
  index,
  activeCategory,
  onSelect,
}: {
  group: SkillGroup;
  index: number;
  activeCategory: number | null;
  onSelect: (i: number) => void;
}) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const num = String(index + 1).padStart(2, '0');
  const isActive = activeCategory === null || activeCategory === index;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: isActive ? 1 : 0.3, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="transition-opacity duration-300"
    >
      {/* Category header */}
      <button
        onClick={() => onSelect(activeCategory === index ? -1 : index)}
        className="group mb-3 flex items-center gap-3 text-left"
      >
        <span className="font-mono text-xs text-accent">{num}</span>
        <span className="text-sm font-semibold uppercase tracking-wider text-text-secondary transition-colors group-hover:text-accent">
          {group.category[locale]}
        </span>
        <span className="h-px flex-1 bg-border" />
      </button>

      {/* Skills grid */}
      <div className="flex flex-wrap gap-2">
        {group.skills.map((skill, si) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.25, delay: index * 0.08 + 0.1 + si * 0.03 }}
            className="rounded-btn border border-border bg-bg-secondary px-3 py-1.5 text-sm text-text transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_16px_rgba(197,255,65,0.12)]"
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

export default function AvantgardeSkills({ skillGroups }: Props) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      {skillGroups.map((group, i) => (
        <CategoryBlock
          key={i}
          group={group}
          index={i}
          activeCategory={activeCategory}
          onSelect={(idx) => setActiveCategory(idx === -1 ? null : idx)}
        />
      ))}
    </div>
  );
}
