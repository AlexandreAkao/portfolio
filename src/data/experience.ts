export interface Experience {
  company: string;
  role: { en: string; pt: string };
  period: string;
  summary: { en: string; pt: string };
  bullets: { en: string[]; pt: string[] };
  tech: string[];
  impact?: string;
  subEntries?: Experience[];
}

export const experiences: Experience[] = [
  {
    company: 'Seva / Appointally',
    role: {
      en: 'Senior Full-Stack Engineer',
      pt: 'Desenvolvedor Full-Stack Senior',
    },
    period: 'Apr 2025 - Present',
    summary: {
      en: 'Leading development of a SaaS scheduling platform with 19 microservices architecture.',
      pt: 'Liderando o desenvolvimento de uma plataforma SaaS de agendamento com arquitetura de 19 microsservicos.',
    },
    bullets: {
      en: [
        'Architected 19 microservices using Clean Architecture and CQRS patterns',
        'Implemented event-driven communication with RabbitMQ and Redis',
        'Built multi-tenant system supporting multiple business verticals',
      ],
      pt: [
        'Arquitetou 19 microsservicos usando Clean Architecture e padroes CQRS',
        'Implementou comunicacao event-driven com RabbitMQ e Redis',
        'Construiu sistema multi-tenant suportando multiplas verticais de negocio',
      ],
    },
    tech: ['Node.js', 'TypeScript', 'React', 'PostgreSQL', 'RabbitMQ', 'Redis', 'Docker', 'AWS'],
  },
  {
    company: 'AmbevTech',
    role: {
      en: 'Full-Stack Engineer',
      pt: 'Desenvolvedor Full-Stack',
    },
    period: 'Nov 2020 - Present',
    summary: {
      en: 'Building and maintaining high-scale enterprise applications for AB InBev ecosystem.',
      pt: 'Construindo e mantendo aplicacoes enterprise de alta escala para o ecossistema AB InBev.',
    },
    bullets: { en: [], pt: [] },
    tech: [],
    subEntries: [
      {
        company: 'AmbevTech - WMS',
        role: {
          en: 'Full-Stack Engineer',
          pt: 'Desenvolvedor Full-Stack',
        },
        period: 'Nov 2020 - Present',
        summary: {
          en: 'Warehouse Management System serving 200+ distribution centers across Brazil.',
          pt: 'Sistema de Gestao de Armazem atendendo 200+ centros de distribuicao no Brasil.',
        },
        bullets: {
          en: [
            'Developed and maintained WMS serving 200+ distribution centers',
            'Implemented real-time inventory tracking with SignalR and event-driven architecture',
            'Reduced order processing time by 40% through optimized algorithms',
          ],
          pt: [
            'Desenvolveu e manteve WMS atendendo 200+ centros de distribuicao',
            'Implementou rastreamento de inventario em tempo real com SignalR e arquitetura event-driven',
            'Reduziu tempo de processamento de pedidos em 40% atraves de algoritmos otimizados',
          ],
        },
        tech: ['.NET', 'C#', 'React', 'SQL Server', 'Azure', 'SignalR', 'Docker'],
      },
      {
        company: 'AmbevTech - BEES',
        role: {
          en: 'Frontend Engineer',
          pt: 'Desenvolvedor Frontend',
        },
        period: '2022 - 2023',
        summary: {
          en: 'B2B e-commerce platform used across Latin America for AB InBev products.',
          pt: 'Plataforma de e-commerce B2B usada em toda a America Latina para produtos AB InBev.',
        },
        bullets: {
          en: [
            'Built features for B2B e-commerce platform serving multiple LATAM countries',
            'Developed micro-frontends architecture for independent team deployments',
            'Implemented A/B testing and feature flags for gradual rollouts',
          ],
          pt: [
            'Construiu features para plataforma de e-commerce B2B atendendo multiplos paises da LATAM',
            'Desenvolveu arquitetura de micro-frontends para deploys independentes por equipe',
            'Implementou A/B testing e feature flags para rollouts graduais',
          ],
        },
        tech: ['React', 'TypeScript', 'Next.js', 'Micro-frontends', 'Azure DevOps'],
      },
      {
        company: 'AmbevTech - UIKit',
        role: {
          en: 'Frontend Engineer',
          pt: 'Desenvolvedor Frontend',
        },
        period: '2021 - 2022',
        summary: {
          en: 'Internal design system with 52 reusable UI components.',
          pt: 'Design system interno com 52 componentes UI reutilizaveis.',
        },
        bullets: {
          en: [
            'Created 52 reusable React components used across 10+ internal applications',
            'Built comprehensive Storybook documentation with interactive examples',
            'Achieved 95%+ test coverage with unit and visual regression tests',
          ],
          pt: [
            'Criou 52 componentes React reutilizaveis usados em 10+ aplicacoes internas',
            'Construiu documentacao Storybook abrangente com exemplos interativos',
            'Alcancou 95%+ de cobertura de testes com testes unitarios e de regressao visual',
          ],
        },
        tech: ['React', 'TypeScript', 'Storybook', 'Jest', 'Styled Components'],
      },
    ],
  },
  {
    company: 'NATI - UNIFOR',
    role: {
      en: 'Full-Stack Engineer',
      pt: 'Desenvolvedor Full-Stack',
    },
    period: 'Aug 2019 - Nov 2020',
    summary: {
      en: 'Technology innovation hub at University of Fortaleza, developing solutions for partner companies.',
      pt: 'Hub de inovacao tecnologica da Universidade de Fortaleza, desenvolvendo solucoes para empresas parceiras.',
    },
    bullets: {
      en: [
        'Developed web and mobile applications for university partners',
        'Led technical decisions on frontend architecture using React and React Native',
        'Mentored junior engineers on best practices and code review processes',
      ],
      pt: [
        'Desenvolveu aplicacoes web e mobile para parceiros da universidade',
        'Liderou decisoes tecnicas de arquitetura frontend usando React e React Native',
        'Mentorou desenvolvedores juniores em boas praticas e processos de code review',
      ],
    },
    tech: ['React', 'React Native', 'Node.js', 'MongoDB', 'Firebase'],
  },
  {
    company: 'FUNCAP',
    role: {
      en: 'Research Scholarship - Engineer',
      pt: 'Bolsista de Pesquisa - Desenvolvedor',
    },
    period: 'May 2020 - Oct 2020',
    summary: {
      en: 'Research foundation scholarship for developing technology solutions.',
      pt: 'Bolsa de fundacao de pesquisa para desenvolvimento de solucoes tecnologicas.',
    },
    bullets: {
      en: [
        'Developed research tools and data visualization dashboards',
        'Built APIs for data collection and analysis workflows',
      ],
      pt: [
        'Desenvolveu ferramentas de pesquisa e dashboards de visualizacao de dados',
        'Construiu APIs para fluxos de coleta e analise de dados',
      ],
    },
    tech: ['Python', 'React', 'D3.js', 'PostgreSQL'],
  },
];
