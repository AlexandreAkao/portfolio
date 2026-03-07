export interface Project {
  title: string;
  description: { en: string; pt: string };
  type: 'professional' | 'personal';
  tech: string[];
  github?: string;
  live?: string;
  metrics?: string;
}

export const projects: Project[] = [
  {
    title: 'Appointally',
    description: {
      en: 'SaaS scheduling platform with 19 microservices, Clean Architecture, CQRS, and event-driven communication.',
      pt: 'Plataforma SaaS de agendamento com 19 microsservicos, Clean Architecture, CQRS e comunicacao event-driven.',
    },
    type: 'professional',
    tech: ['Node.js', 'TypeScript', 'React', 'PostgreSQL', 'RabbitMQ', 'Redis', 'Docker', 'AWS'],
    metrics: '19 microservices',
  },
  {
    title: 'WMS - AmbevTech',
    description: {
      en: 'Warehouse Management System serving 200+ distribution centers across Brazil with real-time inventory tracking.',
      pt: 'Sistema de Gestao de Armazem atendendo 200+ centros de distribuicao no Brasil com rastreamento de inventario em tempo real.',
    },
    type: 'professional',
    tech: ['.NET', 'C#', 'React', 'SQL Server', 'Azure', 'SignalR'],
    metrics: '200+ distribution centers',
  },
  {
    title: 'BEES B2B',
    description: {
      en: 'B2B e-commerce platform for AB InBev products, serving multiple countries across Latin America with micro-frontends.',
      pt: 'Plataforma e-commerce B2B para produtos AB InBev, atendendo multiplos paises da America Latina com micro-frontends.',
    },
    type: 'professional',
    tech: ['React', 'TypeScript', 'Next.js', 'Micro-frontends'],
    metrics: 'Multi-country LATAM',
  },
  {
    title: 'UIKit - AmbevTech',
    description: {
      en: 'Internal design system with 52 reusable React components used across 10+ applications.',
      pt: 'Design system interno com 52 componentes React reutilizaveis usados em 10+ aplicacoes.',
    },
    type: 'professional',
    tech: ['React', 'TypeScript', 'Storybook', 'Jest'],
    metrics: '52 components, 10+ apps',
  },
  {
    title: 'Ordenados',
    description: {
      en: 'A task management and organization application with intuitive drag-and-drop interface.',
      pt: 'Aplicacao de gerenciamento e organizacao de tarefas com interface intuitiva de arrastar e soltar.',
    },
    type: 'personal',
    tech: ['React', 'TypeScript', 'Node.js'],
    github: 'https://github.com/alexandreakao/ordenados',
  },
  {
    title: 'Azure Open PR',
    description: {
      en: 'Browser extension that streamlines Azure DevOps pull request management and review workflows.',
      pt: 'Extensao de navegador que simplifica o gerenciamento e fluxos de revisao de pull requests no Azure DevOps.',
    },
    type: 'personal',
    tech: ['TypeScript', 'Browser Extension', 'Azure DevOps API'],
    github: 'https://github.com/alexandreakao/azure-open-pr',
  },
  {
    title: 'Design Patterns TS',
    description: {
      en: 'Comprehensive collection of design patterns implemented in TypeScript with practical examples.',
      pt: 'Colecao abrangente de design patterns implementados em TypeScript com exemplos praticos.',
    },
    type: 'personal',
    tech: ['TypeScript', 'Design Patterns'],
    github: 'https://github.com/alexandreakao/design-pattern-ts',
  },
  {
    title: 'Particle Website',
    description: {
      en: 'Interactive website featuring particle animations and creative visual effects.',
      pt: 'Website interativo com animacoes de particulas e efeitos visuais criativos.',
    },
    type: 'personal',
    tech: ['JavaScript', 'Canvas API', 'CSS'],
    github: 'https://github.com/alexandreakao/particle-website',
  },
  {
    title: 'Space Themed Website',
    description: {
      en: 'Immersive space-themed website with parallax scrolling and cosmic visual effects.',
      pt: 'Website imersivo com tema espacial, scrolling parallax e efeitos visuais cosmicos.',
    },
    type: 'personal',
    tech: ['JavaScript', 'Three.js', 'CSS'],
    github: 'https://github.com/alexandreakao/space-themed-website',
  },
];
