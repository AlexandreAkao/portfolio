import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { getSkillLabel, type SkillGroup } from '@data/skills';
import { useLocale } from '@i18n/useLocale';
import { withServerLocale } from '@i18n/withServerLocale';

interface Props {
  skillGroups: SkillGroup[];
}

const CARD_COLORS = ['#0ba95b', '#12b5e5', '#f38ba3', '#a189cc', '#f55a6e', '#fcba28'];
const EMOJIS = ['⚙️', '🖥️', '🗄️', '☁️', '📨', '📊', '🏗️'];

function ArcadeSkills({ skillGroups }: Props) {
  const locale = useLocale();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skillGroups.map((group, i) => {
        const color = CARD_COLORS[i % CARD_COLORS.length];
        const emoji = EMOJIS[i % EMOJIS.length];

        return (
          <motion.div
            key={group.category[locale]}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="rounded-card p-5"
            style={{ backgroundColor: color }}
          >
            <div className="mb-2 text-2xl">{emoji}</div>
            <h3 className="mb-3 font-heading text-sm uppercase" style={{ color: '#0f0d0e' }}>
              {group.category[locale]}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {group.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-[#0f0d0e]/15 px-2.5 py-1 text-xs font-medium"
                  style={{ color: '#0f0d0e' }}
                >
                  {getSkillLabel(skill, locale)}
                </span>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default withServerLocale(ArcadeSkills);
