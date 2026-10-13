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
      en: 'Building Appointally, a multi-tenant SaaS for service businesses covering appointments, clients, staff schedules, subscriptions, payments, and catalogs. Remote, part-time role for Seva in Canada.',
      pt: 'Desenvolvendo o Appointally, um SaaS multi-tenant para negócios de serviços com agendamentos, clientes, escalas, assinaturas, pagamentos e catálogos. Atuação remota e em tempo parcial para a Seva, no Canadá.',
    },
    bullets: {
      en: [
        'Architected and built 26 independent services from scratch using Clean Architecture with strictly enforced layer boundaries',
        'Designed a RAG pipeline for semantic search and insights across business catalogs, using AI-assisted development to accelerate delivery and maintenance',
        'Built the frontend portal with Next.js, Server Actions, TanStack Query, and support for three languages',
        'Implemented event-driven messaging with Azure Service Bus and the Transactional Outbox Pattern for eventual consistency in critical payment flows',
        'Integrated Stripe subscriptions, payments, webhooks, and billing, with MongoDB for persistence and Redis for caching',
        'Built JWT authentication with AWS Cognito and a dedicated RBAC authorization service',
        'Provisioned AWS infrastructure with Terraform, including VPC, EKS, RDS, ECR, S3, Secrets Manager, and ALB Ingress, with GitHub Actions for Kubernetes deployments',
        'Built multichannel notifications with SendGrid, Twilio, Firebase, and Handlebars, plus a file storage service with FastAPI and AWS S3',
      ],
      pt: [
        'Projetei e construí do zero 26 serviços independentes com Clean Architecture e limites rigorosos entre camadas',
        'Projetei um pipeline RAG para buscas semânticas e análises nos catálogos de negócios, usando desenvolvimento assistido por IA para acelerar a entrega e a manutenção',
        'Desenvolvi o portal frontend com Next.js, Server Actions, TanStack Query e suporte a três idiomas',
        'Implementei mensageria orientada a eventos com Azure Service Bus e Transactional Outbox para consistência eventual em fluxos críticos de pagamento',
        'Integrei assinaturas, pagamentos, webhooks e faturamento com Stripe, usando MongoDB para persistência e Redis para cache',
        'Desenvolvi autenticação JWT com AWS Cognito e um serviço dedicado de autorização RBAC',
        'Provisionei a infraestrutura AWS com Terraform, incluindo VPC, EKS, RDS, ECR, S3, Secrets Manager e ALB Ingress, com GitHub Actions para deploys no Kubernetes',
        'Desenvolvi notificações multicanal com SendGrid, Twilio, Firebase e Handlebars, além de armazenamento de arquivos com FastAPI e AWS S3',
      ],
    },
    tech: ['TypeScript', 'Node.js', 'NestJS', 'Next.js', 'TanStack Query', 'MongoDB', 'Redis', 'Azure Service Bus', 'Stripe', 'AWS', 'Terraform', 'Kubernetes', 'GitHub Actions', 'FastAPI', 'RAG'],
    impact: {
      en: '26 independent services built with Clean Architecture',
      pt: '26 serviços independentes com Clean Architecture',
    },
  },
  {
    company: 'AmbevTech / AB InBev',
    role: {
      en: 'Senior Software Engineer',
      pt: 'Desenvolvedor de Software Sênior',
    },
    period: { en: 'Nov 2020 - Present', pt: 'nov 2020 - atual' },
    summary: {
      en: 'Building and maintaining distributed systems, B2B commerce, and shared UI libraries for AB InBev. Remote role in Brazil.',
      pt: 'Desenvolvendo e mantendo sistemas distribuídos, e-commerce B2B e bibliotecas de UI para a AB InBev. Atuação remota no Brasil.',
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
          en: 'Global warehouse management solution serving 200+ distribution centers, covering stock, inventory auditing, reports, and routing.',
          pt: 'Solução global de gestão de armazéns utilizada em 200+ centros de distribuição, com estoque, auditoria de inventário, relatórios e rotas.',
        },
        bullets: {
          en: [
            'Architected distributed microservices with Hexagonal Architecture, DDD, CQRS, and MediatR for 200+ distribution centers',
            'Reduced infrastructure costs by 18% by optimizing Kubernetes resource requests/limits and HPA',
            'Used AI-assisted development and observability to accelerate delivery, root cause analysis, and incident resolution',
            'Implemented domain logic in C# and .NET with feature flags for safe production rollouts',
            'Built asynchronous consumers with .NET Background Services, RabbitMQ, and Azure Service Bus',
            'Implemented Redis distributed locks and caching to reduce database load and prevent stock reservation race conditions',
            'Optimized SQL Server with table partitioning, reporting views, and strategic indexing',
            'Managed logs, tracing, and monitoring with Datadog and container orchestration with AKS',
            'Led the gradual migration from React 15 and Webpack to React 18 and Vite using the Strangler Fig Pattern',
            'Reduced order processing time by 40% through optimized algorithms',
          ],
          pt: [
            'Projetei microsserviços com Arquitetura Hexagonal, DDD, CQRS e MediatR para 200+ centros de distribuição',
            'Reduzi os custos de infraestrutura em 18% com otimização de requests/limits de recursos no Kubernetes e ajustes do HPA',
            'Utilizei desenvolvimento e observabilidade assistidos por IA para acelerar entregas, análise de causa raiz e resolução de incidentes',
            'Implementei lógica de domínio em C# e .NET com feature flags para ativação segura de funcionalidades em produção',
            'Desenvolvi consumidores assíncronos com .NET Background Services, RabbitMQ e Azure Service Bus',
            'Implementei bloqueios distribuídos e cache com Redis para reduzir a carga no banco e evitar condições de corrida nas reservas de estoque',
            'Otimizei o SQL Server com particionamento de tabelas, views para relatórios e indexação estratégica',
            'Gerenciei logs, rastreamento e monitoramento com Datadog e orquestração de contêineres com AKS',
            'Liderei a migração gradual de React 15 e Webpack para React 18 e Vite com o Strangler Fig Pattern',
            'Reduzi o tempo de processamento de pedidos em 40% através de algoritmos otimizados',
          ],
        },
        tech: ['C#', '.NET', 'MediatR', 'SQL Server', 'React', 'Vite', 'Redis', 'RabbitMQ', 'Azure Service Bus', 'AKS', 'Kubernetes', 'Datadog'],
        impact: {
          en: '200+ distribution centers · infrastructure costs cut by 18%',
          pt: '200+ centros de distribuição · custos de infraestrutura 18% menores',
        },
      },
      {
        company: 'AmbevTech - BEES',
        role: {
          en: 'Full-Stack Engineer',
          pt: 'Desenvolvedor Full-Stack',
        },
        period: { en: '2022 - 2023', pt: '2022 - 2023' },
        summary: {
          en: 'B2B e-commerce platform used across Latin America for AB InBev products.',
          pt: 'Plataforma de e-commerce B2B usada em toda a América Latina para produtos AB InBev.',
        },
        bullets: {
          en: [
            'Built a BFF with Node.js, Express, and TypeScript to aggregate data and reduce latency between clients and core services',
            'Integrated Zendesk and Segment through RESTful APIs for support tickets and user behavior tracking',
            'Implemented MongoDB persistence for the BFF to reduce load on core microservices',
            'Helped migrate a monolithic application to micro-frontends with Module Federation',
            'Implemented A/B testing and feature flags for gradual rollouts',
          ],
          pt: [
            'Desenvolvi um BFF com Node.js, Express e TypeScript para agregar dados e reduzir a latência entre clientes e serviços principais',
            'Integrei Zendesk e Segment por APIs RESTful para tickets de suporte e rastreamento do comportamento dos usuários',
            'Implementei persistência MongoDB no BFF para reduzir a carga nos microsserviços principais',
            'Colaborei na migração de uma aplicação monolítica para micro-frontends com Module Federation',
            'Implementei A/B testing e feature flags para rollouts graduais',
          ],
        },
        tech: ['React', 'Node.js', 'Express', 'TypeScript', 'MongoDB', 'Redis', 'Module Federation', 'Zendesk', 'Segment'],
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
          en: 'UI library built for WMS with 52 customizable components, standardizing interfaces and component reuse.',
          pt: 'Biblioteca de UI desenvolvida para o WMS com 52 componentes customizáveis, padronizando interfaces e a reutilização de componentes.',
        },
        bullets: {
          en: [
            'Created 52 reusable React components used across 10+ internal applications',
            'Built the library with React, TypeScript, and Vite for performance and maintainability',
            'Built comprehensive Storybook documentation with interactive examples',
            'Achieved 95%+ test coverage with unit and visual regression tests',
          ],
          pt: [
            'Criei 52 componentes React reutilizáveis usados em 10+ aplicações internas',
            'Desenvolvi a biblioteca com React, TypeScript e Vite para desempenho e facilidade de manutenção',
            'Construí documentação Storybook abrangente com exemplos interativos',
            'Alcancei 95%+ de cobertura de testes com testes unitários e de regressão visual',
          ],
        },
        tech: ['React', 'TypeScript', 'Storybook', 'Vite', 'Jest', 'Styled Components'],
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
      en: 'Developed Athena and Banca at the University of Fortaleza technology innovation hub in Fortaleza, Brazil.',
      pt: 'Desenvolvi o Athena e o Banca no núcleo de inovação tecnológica da Universidade de Fortaleza, em Fortaleza, Brasil.',
    },
    bullets: {
      en: [
        'Built Athena, an interactive quiz platform for undergraduate students, with tools for instructors to monitor performance and engagement',
        'Built Banca, a centralized article publishing platform for Journalism students',
        'Implemented the frontend in React and the backend in Node.js for both platforms',
      ],
      pt: [
        'Desenvolvi o Athena, uma plataforma interativa de quizzes para alunos de graduação, com acompanhamento de desempenho e engajamento pelos professores',
        'Desenvolvi o Banca, uma plataforma centralizada de publicação de artigos para alunos de Jornalismo',
        'Implementei o frontend em React e o backend em Node.js nas duas plataformas',
      ],
    },
    tech: ['React', 'Node.js'],
  },
  {
    company: 'FUNCAP',
    role: {
      en: 'Undergraduate Research Fellow',
      pt: 'Bolsista de Iniciação Científica',
    },
    period: { en: 'May 2020 - Oct 2020', pt: 'mai 2020 - out 2020' },
    summary: {
      en: 'Worked on Unifall, a machine learning system for detecting falls in older adults and issuing automatic alerts, in Fortaleza, Brazil.',
      pt: 'Atuei no Unifall, um sistema de Machine Learning para detectar quedas de idosos e emitir alertas automáticos, em Fortaleza, Brasil.',
    },
    bullets: {
      en: [
        'Developed a fall detection system in Python using Machine Learning',
        'Implemented COCO, BODY25, and MPI skeleton models for body recognition',
      ],
      pt: [
        'Desenvolvi um sistema de detecção de quedas com Python e Machine Learning',
        'Implementei os modelos de esqueleto COCO, BODY25 e MPI para reconhecimento corporal',
      ],
    },
    tech: ['Python', 'Machine Learning', 'COCO', 'BODY25', 'MPI'],
  },
];

/** Companies of the roles still in progress, in the order they are listed. */
export const currentCompanies = experiences
  .filter((exp) => exp.period.en.endsWith('Present'))
  .map((exp) => exp.company);
