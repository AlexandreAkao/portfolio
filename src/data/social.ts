export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export const email = 'alexandreakiraakao@gmail.com';

/** Downloads follow the page language, including before client-side hydration. */
export const cvUrls = {
  en: '/resume/Alexandre_Akira_en_CV.pdf',
  pt: '/resume/Alexandre_Akira_ptbr_CV.pdf',
};

export const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/alexandreakao',
    icon: 'lucide:github',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/alexandre-akao/',
    icon: 'lucide:linkedin',
  },
  {
    name: 'Dev.to',
    url: 'https://dev.to/alexandreakira',
    icon: 'lucide:pen-line',
  },
  {
    name: 'Email',
    url: `mailto:${email}`,
    icon: 'lucide:mail',
  },
];
