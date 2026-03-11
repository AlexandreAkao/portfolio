import { motion } from 'motion/react';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function DevToIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6v4.36h.58c.37 0 .67-.07.84-.23.18-.17.25-.48.25-.93v-2.04c0-.45-.07-.76-.25-.93zm13.37-7.03H3.2C1.94 3.02 1 4.04 1 5.3v13.4c0 1.26.94 2.28 2.2 2.28h17.6c1.26 0 2.2-1.02 2.2-2.28V5.3c0-1.26-.94-2.28-2.2-2.28zM8.14 14.9c-.5.52-1.17.73-1.95.73H4.5V8.37h1.73c.78 0 1.44.22 1.95.74.48.49.71 1.19.71 2.06v1.7c0 .87-.23 1.56-.75 2.03zM12.56 9.8h-2.1v1.63h1.27v1.42h-1.27v1.73h2.1v1.42h-2.6c-.5 0-.91-.17-1.19-.5-.26-.31-.4-.72-.4-1.21V10c0-.49.14-.9.4-1.21.28-.33.69-.5 1.19-.5h2.6V9.8zm5.69 5.37c-.27.6-.74.9-1.38.9-.62 0-1.09-.27-1.38-.87-.22-.46-.33-1.14-.33-2.04v-.87c0-.9.11-1.57.33-2.02.29-.59.75-.87 1.37-.87.63 0 1.1.28 1.38.87.22.45.34 1.12.34 2.02v.87c0 .9-.12 1.58-.33 2.01z" />
    </svg>
  );
}

const links = [
  {
    name: 'GitHub',
    url: 'https://github.com/alexandreakao',
    icon: <GitHubIcon className="h-5 w-5" />,
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/alexandre-akao/',
    icon: <LinkedInIcon className="h-5 w-5" />,
  },
  {
    name: 'Dev.to',
    url: 'https://dev.to/alexandreakira',
    icon: <DevToIcon className="h-5 w-5" />,
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
