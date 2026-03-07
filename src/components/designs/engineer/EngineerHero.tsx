import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';

export default function EngineerHero() {
  const locale = useLocale();
  const tagline = t('hero.tagline', locale);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    setTyped('');
    let i = 0;
    const interval = setInterval(() => {
      setTyped(tagline.slice(0, i + 1));
      i++;
      if (i >= tagline.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [tagline]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 font-mono text-sm text-accent"
      >
        {t('hero.greeting', locale)}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-2 font-mono text-5xl font-bold text-text md:text-7xl"
      >
        {t('hero.name', locale)}
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6 font-mono text-2xl text-text-secondary md:text-4xl"
      >
        {'> '}{t('hero.title', locale)}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8 max-w-xl font-mono text-sm text-text-secondary"
      >
        <span className="text-accent">$</span> {typed}
        <span className="animate-pulse text-accent">_</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-wrap gap-4"
      >
        <a
          href="#projects"
          className="rounded-btn border border-accent px-4 py-3 font-mono text-sm text-accent transition-colors hover:bg-accent/10 sm:px-6"
        >
          {t('hero.cta.work', locale)}
        </a>
        <a
          href="/resume/Alexandre_Akira_en_CV.pdf"
          download
          className="rounded-btn bg-accent px-4 py-3 font-mono text-sm text-[#0a192f] transition-colors hover:bg-accent-hover sm:px-6"
        >
          {t('hero.cta.cv', locale)}
        </a>
      </motion.div>
    </div>
  );
}
