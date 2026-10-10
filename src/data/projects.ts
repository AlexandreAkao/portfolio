export interface Project {
  title: string;
  description: { en: string; pt: string };
  type: 'professional' | 'personal';
  tech: string[];
  github?: string;
  live?: string;
  metrics?: { en: string; pt: string };
}

export const projects: Project[] = [
  {
    title: 'Appointally',
    description: {
      en: 'SaaS scheduling platform with 19 microservices, Clean Architecture, CQRS, and event-driven communication.',
      pt: 'Plataforma SaaS de agendamento com 19 microsserviços, Clean Architecture, CQRS e comunicação event-driven.',
    },
    type: 'professional',
    tech: ['Node.js', 'TypeScript', 'React', 'PostgreSQL', 'RabbitMQ', 'Redis', 'Docker', 'AWS'],
    metrics: { en: '19 microservices', pt: '19 microsserviços' },
  },
  {
    title: 'WMS - AmbevTech',
    description: {
      en: 'Warehouse Management System serving 200+ distribution centers across Brazil with real-time inventory tracking.',
      pt: 'Sistema de Gestão de Armazém atendendo 200+ centros de distribuição no Brasil com rastreamento de inventário em tempo real.',
    },
    type: 'professional',
    tech: ['.NET', 'C#', 'React', 'SQL Server', 'Azure', 'SignalR'],
    metrics: { en: '200+ distribution centers', pt: '200+ centros de distribuição' },
  },
  {
    title: 'BEES B2B',
    description: {
      en: 'B2B e-commerce platform for AB InBev products, serving multiple countries across Latin America with micro-frontends.',
      pt: 'Plataforma e-commerce B2B para produtos AB InBev, atendendo múltiplos países da América Latina com micro-frontends.',
    },
    type: 'professional',
    tech: ['React', 'TypeScript', 'Next.js', 'Micro-frontends'],
    metrics: { en: 'Multi-country LATAM', pt: 'Múltiplos países da LATAM' },
  },
  {
    title: 'UIKit - AmbevTech',
    description: {
      en: 'Internal design system with 52 reusable React components used across 10+ applications.',
      pt: 'Design system interno com 52 componentes React reutilizáveis usados em 10+ aplicações.',
    },
    type: 'professional',
    tech: ['React', 'TypeScript', 'Storybook', 'Jest'],
    metrics: { en: '52 components, 10+ apps', pt: '52 componentes, 10+ apps' },
  },
  {
    title: 'Ordenados',
    description: {
      en: 'A task management and organization application with intuitive drag-and-drop interface.',
      pt: 'Aplicação de gerenciamento e organização de tarefas com interface intuitiva de arrastar e soltar.',
    },
    type: 'personal',
    tech: ['React', 'TypeScript', 'Node.js'],
    github: 'https://github.com/alexandreakao/ordenados',
  },
  {
    title: 'Azure Open PR',
    description: {
      en: 'Browser extension that streamlines Azure DevOps pull request management and review workflows.',
      pt: 'Extensão de navegador que simplifica o gerenciamento e fluxos de revisão de pull requests no Azure DevOps.',
    },
    type: 'personal',
    tech: ['TypeScript', 'Browser Extension', 'Azure DevOps API'],
    github: 'https://github.com/alexandreakao/azure-open-pr',
  },
  {
    title: 'Design Patterns TS',
    description: {
      en: 'Comprehensive collection of design patterns implemented in TypeScript with practical examples.',
      pt: 'Coleção abrangente de design patterns implementados em TypeScript com exemplos práticos.',
    },
    type: 'personal',
    tech: ['TypeScript', 'Design Patterns'],
    github: 'https://github.com/alexandreakao/design-pattern-ts',
  },
  {
    title: 'Particle Website',
    description: {
      en: 'Interactive website featuring particle animations and creative visual effects.',
      pt: 'Website interativo com animações de partículas e efeitos visuais criativos.',
    },
    type: 'personal',
    tech: ['JavaScript', 'Canvas API', 'CSS'],
    github: 'https://github.com/alexandreakao/particle-website',
  },
  {
    title: 'Space Themed Website',
    description: {
      en: 'Immersive space-themed website with parallax scrolling and cosmic visual effects.',
      pt: 'Website imersivo com tema espacial, scrolling parallax e efeitos visuais cósmicos.',
    },
    type: 'personal',
    tech: ['JavaScript', 'Three.js', 'CSS'],
    github: 'https://github.com/alexandreakao/space-themed-website',
  },
];
