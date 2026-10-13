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
      en: 'Multi-tenant SaaS for service businesses with 26 independent services, a multilingual Next.js portal, RAG search, and Stripe subscriptions and payments.',
      pt: 'SaaS multi-tenant para negócios de serviços com 26 serviços independentes, portal Next.js multilíngue, busca com RAG e assinaturas e pagamentos via Stripe.',
    },
    type: 'professional',
    tech: ['TypeScript', 'NestJS', 'Next.js', 'MongoDB', 'Redis', 'Azure Service Bus', 'Stripe', 'AWS', 'Terraform', 'RAG'],
    metrics: { en: '26 independent services', pt: '26 serviços independentes' },
  },
  {
    title: 'WMS - AmbevTech',
    description: {
      en: 'Global warehouse management system serving 200+ distribution centers, with Hexagonal Architecture, DDD, CQRS, and Kubernetes optimizations that reduced infrastructure costs by 18%.',
      pt: 'Sistema global de gestão de armazéns utilizado em 200+ centros de distribuição, com Arquitetura Hexagonal, DDD, CQRS e otimizações de Kubernetes que reduziram os custos de infraestrutura em 18%.',
    },
    type: 'professional',
    tech: ['.NET', 'C#', 'React', 'Vite', 'SQL Server', 'Redis', 'Azure Service Bus', 'AKS', 'Datadog'],
    metrics: { en: '200+ centers · 18% lower infrastructure costs', pt: '200+ centros · custos de infraestrutura 18% menores' },
  },
  {
    title: 'BEES B2B',
    description: {
      en: 'B2B commerce platform for AB InBev across Latin America, with a Node.js BFF, Zendesk and Segment integrations, MongoDB persistence, and micro-frontends using Module Federation.',
      pt: 'Plataforma de e-commerce B2B da AB InBev na América Latina, com BFF em Node.js, integrações Zendesk e Segment, persistência MongoDB e micro-frontends com Module Federation.',
    },
    type: 'professional',
    tech: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Redis', 'Module Federation', 'Zendesk', 'Segment'],
    metrics: { en: 'Multi-country LATAM', pt: 'Múltiplos países da LATAM' },
  },
  {
    title: 'UIKit - AmbevTech',
    description: {
      en: 'UI library built for WMS with 52 customizable React components, TypeScript, Storybook, and Vite, reused across 10+ applications.',
      pt: 'Biblioteca de UI desenvolvida para o WMS com 52 componentes React customizáveis, TypeScript, Storybook e Vite, reutilizados em 10+ aplicações.',
    },
    type: 'professional',
    tech: ['React', 'TypeScript', 'Storybook', 'Vite', 'Jest'],
    metrics: { en: '52 components, 10+ apps', pt: '52 componentes, 10+ apps' },
  },
  {
    title: 'DevTray',
    description: {
      en: 'Built and shipped solo: a native macOS menu-bar app with 13 developer tools, a clipboard-aware Spotlight-style shortcut, and offline snippets. Apple-notarized with Sparkle updates, Paddle licensing, and automated GitHub Actions releases. Free with a one-time Pro upgrade.',
      pt: 'Desenvolvi e lancei sozinho um app nativo de barra de menu para macOS com 13 ferramentas para devs, atalho estilo Spotlight que lê o clipboard e snippets offline. Notarizado pela Apple, com atualizações via Sparkle, licenciamento Paddle e releases automatizados com GitHub Actions. Gratuito, com upgrade Pro por pagamento único.',
    },
    type: 'personal',
    tech: ['Swift', 'SwiftUI', 'TypeScript', 'SQLite', 'FTS5', 'Sparkle', 'Cloudflare Workers', 'Hono', 'KV', 'Paddle', 'GitHub Actions', 'R2', 'Cloudflare Pages'],
    live: 'https://devtray.app',
  },
  {
    title: 'Ordenados',
    description: {
      en: 'A digital card game inspired by ITO: players arrange their phones as physical cards. Built with Next.js, Supabase Functions, and real-time WebSocket communication for in-person play.',
      pt: 'Jogo de cartas digital inspirado no ITO: os jogadores organizam seus celulares como cartas físicas. Desenvolvido com Next.js, Supabase Functions e comunicação em tempo real via WebSocket para partidas presenciais.',
    },
    type: 'personal',
    tech: ['Next.js', 'Supabase', 'Supabase Functions', 'WebSocket'],
    github: 'https://github.com/alexandreakao/ordenados',
  },
  {
    title: 'Azure Open PR',
    description: {
      en: 'Chrome extension built with React and Vite that centralizes open pull requests across team repositories, making pending reviews easier to track and helping shorten PR cycles.',
      pt: 'Extensão para Chrome desenvolvida com React e Vite que centraliza os pull requests abertos nos repositórios do time, facilitando o acompanhamento das revisões pendentes e agilizando os ciclos de PRs.',
    },
    type: 'personal',
    tech: ['React', 'Vite', 'TypeScript', 'Chrome Extension', 'Azure DevOps API'],
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
];
