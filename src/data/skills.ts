export interface SkillGroup {
  category: { en: string; pt: string };
  icon: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    category: { en: 'Backend', pt: 'Backend' },
    icon: 'lucide:server',
    skills: ['Node.js', 'TypeScript', '.NET', 'C#', 'Python', 'Go', 'REST', 'GraphQL', 'gRPC'],
  },
  {
    category: { en: 'Frontend', pt: 'Frontend' },
    icon: 'lucide:layout',
    skills: ['React', 'Next.js', 'Astro', 'Tailwind CSS', 'Styled Components', 'Storybook', 'React Native'],
  },
  {
    category: { en: 'Databases', pt: 'Bancos de Dados' },
    icon: 'lucide:database',
    skills: ['PostgreSQL', 'SQL Server', 'MongoDB', 'Redis', 'DynamoDB'],
  },
  {
    category: { en: 'Infrastructure', pt: 'Infraestrutura' },
    icon: 'lucide:cloud',
    skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'GitHub Actions'],
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
    skills: ['Clean Architecture', 'DDD', 'CQRS', 'Event Sourcing', 'Microservices', 'Micro-frontends', 'SOLID'],
  },
];
