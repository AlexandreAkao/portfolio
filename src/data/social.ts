export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export const email = 'alexandreakiraakao@gmail.com';

/** The CV is English only; the Portuguese button label says so. */
export const cvUrl = '/resume/Alexandre_Akira_en_CV.pdf';

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
