export interface SkillGroup {
  category: { en: string; pt: string };
  icon: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    category: { en: 'Backend', pt: 'Backend' },
    icon: 'lucide:server',
    skills: ['C#', '.NET', 'Node.js', 'Express', 'NestJS', 'Python', 'Go', 'REST', 'GraphQL', 'gRPC'],
  },
  {
    category: { en: 'Frontend', pt: 'Frontend' },
    icon: 'lucide:layout',
    skills: ['JavaScript', 'TypeScript', 'HTML/CSS', 'React', 'Next.js', 'Astro', 'Tailwind CSS', 'Styled Components', 'Storybook', 'React Native', 'Vite'],
  },
  {
    category: { en: 'Databases', pt: 'Bancos de Dados' },
    icon: 'lucide:database',
    skills: ['SQL', 'SQL Server', 'PostgreSQL', 'NoSQL', 'MongoDB', 'Redis', 'Supabase', 'DynamoDB'],
  },
  {
    category: { en: 'Infrastructure', pt: 'Infraestrutura' },
    icon: 'lucide:cloud',
    skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'AKS', 'Helm', 'Terraform', 'CI/CD', 'Azure DevOps', 'GitHub Actions'],
  },
  {
    category: { en: 'Messaging', pt: 'Mensageria' },
    icon: 'lucide:mail',
    skills: ['RabbitMQ', 'Apache Kafka', 'Azure Service Bus', 'SQS/SNS'],
  },
  {
    category: { en: 'Observability', pt: 'Observabilidade' },
    icon: 'lucide:activity',
    skills: ['Datadog', 'Grafana', 'New Relic', 'ELK Stack', 'OpenTelemetry'],
  },
  {
    category: { en: 'Architecture', pt: 'Arquitetura' },
    icon: 'lucide:boxes',
    skills: ['Clean Architecture', 'Hexagonal Architecture', 'DDD', 'CQRS', 'Event Sourcing', 'Microservices', 'Micro-frontends', 'BFF', 'Transactional Outbox', 'SOLID'],
  },
  {
    category: { en: 'Tools', pt: 'Ferramentas' },
    icon: 'lucide:wrench',
    skills: ['SonarQube', 'Snyk', 'Cypress', 'Optimizely', 'Segment'],
  },
  {
    category: { en: 'Artificial Intelligence', pt: 'Inteligência Artificial' },
    icon: 'lucide:brain',
    skills: ['AI-Assisted Development', 'Codex', 'Claude', 'LLM Integration', 'RAG', 'Prompt Engineering', 'Context Engineering'],
  },
];

/** Translate descriptive skill names; technology and product names stay the same. */
const portugueseSkillNames: Record<string, string> = {
  'AI-Assisted Development': 'Desenvolvimento assistido por IA',
  'LLM Integration': 'Integração com LLMs',
  'Prompt Engineering': 'Engenharia de prompts',
  'Context Engineering': 'Engenharia de contexto',
  'Hexagonal Architecture': 'Arquitetura Hexagonal',
};

export function getSkillLabel(skill: string, locale: 'en' | 'pt'): string {
  return locale === 'pt' ? portugueseSkillNames[skill] ?? skill : skill;
}
