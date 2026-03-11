import { motion } from 'motion/react';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';
import SocialLinks from '@components/ui/SocialLinks';

interface Props {
  avatarSrc?: string;
}

export default function CreativeHero({ avatarSrc = '/images/avatar.jpeg' }: Props) {
  const locale = useLocale();
  const name = t('hero.name', locale);

  return (
    <div className="flex min-h-screen items-center px-6">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div>
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-sm font-medium uppercase tracking-widest text-accent"
          >
            {t('hero.greeting', locale)}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 text-6xl font-bold leading-tight text-text md:text-8xl"
          >
            {name.split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? 'text-accent' : ''}>
                {word}{' '}
              </span>
            ))}
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 text-xl text-text-secondary md:text-2xl"
          >
            {t('hero.title', locale)}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8 max-w-md text-lg text-text-secondary"
          >
            {t('hero.tagline', locale)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#projects"
              className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition-transform hover:scale-105 sm:px-8"
            >
              {t('hero.cta.work', locale)}
            </a>
            <a
              href="/resume/Alexandre_Akira_en_CV.pdf"
              download
              className="rounded-full border-2 border-accent px-5 py-3 text-sm font-medium text-accent transition-transform hover:scale-105 sm:px-8"
            >
              {t('hero.cta.cv', locale)}
            </a>
          </motion.div>

          <SocialLinks delay={0.6} className="mt-8" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden md:block"
        >
          <div className="relative mx-auto h-80 w-80">
            <div className="absolute inset-0 animate-pulse rounded-full bg-linear-to-br from-accent/30 to-accent/10 blur-3xl" />
            <div className="absolute inset-4 rounded-full bg-linear-to-br from-accent/20 to-transparent" />
            <div className="absolute inset-8 rounded-full border-2 border-accent/20" />
            <div className="absolute inset-16 rounded-full border border-accent/40" />
            <img
              src={avatarSrc}
              alt="Alexandre Akira"
              width={224}
              height={224}
              className="absolute inset-12 h-56 w-56 rounded-full object-cover shadow-2xl"
              loading="eager"
              decoding="async"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
