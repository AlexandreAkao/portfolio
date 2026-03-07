export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

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
    url: 'mailto:alexandreakiraakao@gmail.com',
    icon: 'lucide:mail',
  },
];
