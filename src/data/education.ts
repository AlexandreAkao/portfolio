export interface Education {
  institution: string;
  degree: { en: string; pt: string };
  field: { en: string; pt: string };
  period: string;
  description?: { en: string; pt: string };
}

export const education: Education[] = [
  {
    institution: 'Rocketseat / Sirius',
    degree: {
      en: 'MBA in Full-Stack Development',
      pt: 'MBA em Desenvolvimento Full-Stack',
    },
    field: {
      en: 'Full-Stack Development',
      pt: 'Desenvolvimento Full-Stack',
    },
    period: '2024 - 2025',
    description: {
      en: 'Advanced specialization in modern full-stack development, covering advanced React patterns, Node.js architecture, DevOps, and cloud infrastructure.',
      pt: 'Especializacao avancada em desenvolvimento full-stack moderno, cobrindo padroes avancados de React, arquitetura Node.js, DevOps e infraestrutura cloud.',
    },
  },
  {
    institution: 'UNIFOR - Universidade de Fortaleza',
    degree: {
      en: "Bachelor's in Computer Science",
      pt: 'Bacharelado em Ciencia da Computacao',
    },
    field: {
      en: 'Computer Science',
      pt: 'Ciencia da Computacao',
    },
    period: '2018 - 2022',
    description: {
      en: 'Comprehensive foundation in algorithms, data structures, software engineering, databases, and distributed systems.',
      pt: 'Base abrangente em algoritmos, estruturas de dados, engenharia de software, bancos de dados e sistemas distribuidos.',
    },
  },
];
