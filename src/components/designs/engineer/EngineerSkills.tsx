import { getSkillLabel, type SkillGroup } from '@data/skills';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import { withServerLocale } from '@i18n/withServerLocale';

interface Props {
  skillGroups: SkillGroup[];
}

/** Section 4 of the draft: the whole skill set as one JSON object, printed as Figure 1. */
function EngineerSkills({ skillGroups }: Props) {
  const locale = useLocale();
  return (
    <figure className="rfc-figure">
      <pre>
        <span className="rfc-json__ln text-text-secondary">{'{'}</span>
        {skillGroups.map((group, i) => (
          <span key={group.category.en} className="rfc-json__ln rfc-json__ln--item">
            <b>"{group.category[locale]}"</b>
            <span className="text-text-secondary">: [</span>
            {group.skills.map((skill, j) => (
              <span key={skill}>
                "{getSkillLabel(skill, locale)}"{j < group.skills.length - 1 && <span className="text-text-secondary">, </span>}
              </span>
            ))}
            <span className="text-text-secondary">]{i < skillGroups.length - 1 ? ',' : ''}</span>
          </span>
        ))}
        <span className="rfc-json__ln text-text-secondary">{'}'}</span>
      </pre>
      <figcaption className="rfc-cap">{t('rfc.figure', locale)} 1</figcaption>
    </figure>
  );
}

export default withServerLocale(EngineerSkills);
