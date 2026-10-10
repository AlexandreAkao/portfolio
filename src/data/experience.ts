export interface Experience {
  company: string;
  role: { en: string; pt: string };
  period: { en: string; pt: string };
  summary: { en: string; pt: string };
  bullets: { en: string[]; pt: string[] };
  tech: string[];
  /** The one result a skim should catch; shown even where the bullets are collapsed. */
  impact?: { en: string; pt: string };
  subEntries?: Experience[];
}

export const experiences: Experience[] = [
  {
    company: 'Seva / Appointally',
    role: {
      en: 'Senior Full-Stack Engineer',
      pt: 'Desenvolvedor Full-Stack Sênior',
    },
    period: { en: 'Apr 2025 - Present', pt: 'abr 2025 - atual' },
    summary: {
      en: 'Leading development of a SaaS scheduling platform with 19 microservices architecture.',
      pt: 'Liderando o desenvolvimento de uma plataforma SaaS de agendamento com arquitetura de 19 microsserviços.',
    },
    bullets: {
      en: [
        'Architected 19 microservices using Clean Architecture and CQRS patterns',
        'Implemented event-driven communication with RabbitMQ and Redis',
        'Built multi-tenant system supporting multiple business verticals',
      ],
      pt: [
        'Arquitetou 19 microsserviços usando Clean Architecture e padrões CQRS',
        'Implementou comunicação event-driven com RabbitMQ e Redis',
        'Construiu sistema multi-tenant suportando múltiplas verticais de negócio',
      ],
    },
    tech: ['Node.js', 'TypeScript', 'React', 'PostgreSQL', 'RabbitMQ', 'Redis', 'Docker', 'AWS'],
    impact: {
      en: '19 microservices on Clean Architecture and CQRS',
      pt: '19 microsserviços com Clean Architecture e CQRS',
    },
  },
  {
    company: 'AmbevTech',
    role: {
      en: 'Full-Stack Engineer',
      pt: 'Desenvolvedor Full-Stack',
    },
    period: { en: 'Nov 2020 - Present', pt: 'nov 2020 - atual' },
    summary: {
      en: 'Building and maintaining high-scale enterprise applications for AB InBev ecosystem.',
      pt: 'Construindo e mantendo aplicações enterprise de alta escala para o ecossistema AB InBev.',
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
        period: { en: 'Nov 2020 - Present', pt: 'nov 2020 - atual' },
        summary: {
          en: 'Warehouse Management System serving 200+ distribution centers across Brazil.',
          pt: 'Sistema de Gestão de Armazém atendendo 200+ centros de distribuição no Brasil.',
        },
        bullets: {
          en: [
            'Developed and maintained WMS serving 200+ distribution centers',
            'Implemented real-time inventory tracking with SignalR and event-driven architecture',
            'Reduced order processing time by 40% through optimized algorithms',
          ],
          pt: [
            'Desenvolveu e manteve WMS atendendo 200+ centros de distribuição',
            'Implementou rastreamento de inventário em tempo real com SignalR e arquitetura event-driven',
            'Reduziu tempo de processamento de pedidos em 40% através de algoritmos otimizados',
          ],
        },
        tech: ['.NET', 'C#', 'React', 'SQL Server', 'Azure', 'SignalR', 'Docker'],
        impact: {
          en: '200+ distribution centers · order processing time cut by 40%',
          pt: '200+ centros de distribuição · tempo de processamento de pedidos 40% menor',
        },
      },
      {
        company: 'AmbevTech - BEES',
        role: {
          en: 'Frontend Engineer',
          pt: 'Desenvolvedor Frontend',
        },
        period: { en: '2022 - 2023', pt: '2022 - 2023' },
        summary: {
          en: 'B2B e-commerce platform used across Latin America for AB InBev products.',
          pt: 'Plataforma de e-commerce B2B usada em toda a América Latina para produtos AB InBev.',
        },
        bullets: {
          en: [
            'Built features for B2B e-commerce platform serving multiple LATAM countries',
            'Developed micro-frontends architecture for independent team deployments',
            'Implemented A/B testing and feature flags for gradual rollouts',
          ],
          pt: [
            'Construiu features para plataforma de e-commerce B2B atendendo múltiplos países da LATAM',
            'Desenvolveu arquitetura de micro-frontends para deploys independentes por equipe',
            'Implementou A/B testing e feature flags para rollouts graduais',
          ],
        },
        tech: ['React', 'TypeScript', 'Next.js', 'Micro-frontends', 'Azure DevOps'],
        impact: {
          en: 'B2B e-commerce serving multiple LATAM countries',
          pt: 'E-commerce B2B atendendo múltiplos países da LATAM',
        },
      },
      {
        company: 'AmbevTech - UIKit',
        role: {
          en: 'Frontend Engineer',
          pt: 'Desenvolvedor Frontend',
        },
        period: { en: '2021 - 2022', pt: '2021 - 2022' },
        summary: {
          en: 'Internal design system with 52 reusable UI components.',
          pt: 'Design system interno com 52 componentes UI reutilizáveis.',
        },
        bullets: {
          en: [
            'Created 52 reusable React components used across 10+ internal applications',
            'Built comprehensive Storybook documentation with interactive examples',
            'Achieved 95%+ test coverage with unit and visual regression tests',
          ],
          pt: [
            'Criou 52 componentes React reutilizáveis usados em 10+ aplicações internas',
            'Construiu documentação Storybook abrangente com exemplos interativos',
            'Alcançou 95%+ de cobertura de testes com testes unitários e de regressão visual',
          ],
        },
        tech: ['React', 'TypeScript', 'Storybook', 'Jest', 'Styled Components'],
        impact: {
          en: '52 components across 10+ apps · 95%+ test coverage',
          pt: '52 componentes em 10+ apps · 95%+ de cobertura de testes',
        },
      },
    ],
  },
  {
    company: 'NATI - UNIFOR',
    role: {
      en: 'Full-Stack Engineer',
      pt: 'Desenvolvedor Full-Stack',
    },
    period: { en: 'Aug 2019 - Nov 2020', pt: 'ago 2019 - nov 2020' },
    summary: {
      en: 'Technology innovation hub at University of Fortaleza, developing solutions for partner companies.',
      pt: 'Hub de inovação tecnológica da Universidade de Fortaleza, desenvolvendo soluções para empresas parceiras.',
    },
    bullets: {
      en: [
        'Developed web and mobile applications for university partners',
        'Led technical decisions on frontend architecture using React and React Native',
        'Mentored junior developers on best practices and code review processes',
      ],
      pt: [
        'Desenvolveu aplicações web e mobile para parceiros da universidade',
        'Liderou decisões técnicas de arquitetura frontend usando React e React Native',
        'Mentorou desenvolvedores juniores em boas práticas e processos de code review',
      ],
    },
    tech: ['React', 'React Native', 'Node.js', 'MongoDB', 'Firebase'],
  },
  {
    company: 'FUNCAP',
    role: {
      en: 'Research Scholarship - Developer',
      pt: 'Bolsista de Pesquisa - Desenvolvedor',
    },
    period: { en: 'May 2020 - Oct 2020', pt: 'mai 2020 - out 2020' },
    summary: {
      en: 'Research foundation scholarship for developing technology solutions.',
      pt: 'Bolsa de fundação de pesquisa para desenvolvimento de soluções tecnológicas.',
    },
    bullets: {
      en: [
        'Developed research tools and data visualization dashboards',
        'Built APIs for data collection and analysis workflows',
      ],
      pt: [
        'Desenvolveu ferramentas de pesquisa e dashboards de visualização de dados',
        'Construiu APIs para fluxos de coleta e análise de dados',
      ],
    },
    tech: ['Python', 'React', 'D3.js', 'PostgreSQL'],
  },
];

/** Companies of the roles still in progress, in the order they are listed. */
export const currentCompanies = experiences
  .filter((exp) => exp.period.en.endsWith('Present'))
  .map((exp) => exp.company);
