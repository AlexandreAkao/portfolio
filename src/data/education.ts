export interface Education {
  institution: string;
  degree: { en: string; pt: string };
  field: { en: string; pt: string };
  period: { en: string; pt: string };
  description?: { en: string; pt: string };
}

export const education: Education[] = [
  {
    institution: 'UNIPDS',
    degree: {
      en: 'Postgraduate Degree in Applied AI Engineering',
      pt: 'Pós-graduação em Engenharia de IA Aplicada',
    },
    field: { en: 'Applied AI Engineering', pt: 'Engenharia de IA Aplicada' },
    period: { en: 'May 2024 - May 2025', pt: 'mai 2024 - mai 2025' },
  },
  {
    institution: 'Sirius',
    degree: {
      en: 'MBA in Full-Stack Development',
      pt: 'MBA em Desenvolvimento Full-Stack',
    },
    field: {
      en: 'Full-Stack Development',
      pt: 'Desenvolvimento Full-Stack',
    },
    period: { en: 'May 2024 - May 2025', pt: 'mai 2024 - mai 2025' },
  },
  {
    institution: 'UNIFOR - Universidade de Fortaleza',
    degree: {
      en: "Bachelor's in Computer Science",
      pt: 'Bacharelado em Ciência da Computação',
    },
    field: {
      en: 'Computer Science',
      pt: 'Ciência da Computação',
    },
    period: { en: 'Jan 2018 - Jan 2022', pt: 'jan 2018 - jan 2022' },
  },
];
