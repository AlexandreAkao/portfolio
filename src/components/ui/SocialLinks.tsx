import { motion } from 'motion/react';
import { FaGithub, FaLinkedin, FaDev } from 'react-icons/fa';

const links = [
  {
    name: 'GitHub',
    url: 'https://github.com/alexandreakao',
    icon: <FaGithub className="h-5 w-5" />,
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/alexandre-akao/',
    icon: <FaLinkedin className="h-5 w-5" />,
  },
  {
    name: 'Dev.to',
    url: 'https://dev.to/alexandreakira',
    icon: <FaDev className="h-5 w-5" />,
  },
];

interface Props {
  className?: string;
  delay?: number;
}

export default function SocialLinks({ className = '', delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`flex items-center gap-3 ${className}`}
    >
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-btn border border-border px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
          aria-label={link.name}
        >
          {link.icon}
          <span className="hidden sm:inline">{link.name}</span>
        </a>
      ))}
    </motion.div>
  );
}
