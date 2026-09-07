// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

/**
 * Registers `client:intro`: islands load immediately but hydrate only after
 * the site intro curtain lifts (see src/lib/client-intro.ts).
 * @type {() => import('astro').AstroIntegration}
 */
const clientIntro = () => ({
  name: 'client-intro',
  hooks: {
    'astro:config:setup': ({ addClientDirective }) => {
      addClientDirective({ name: 'intro', entrypoint: './src/lib/client-intro.ts' });
    },
  },
});

export default defineConfig({
  site: 'https://alexandreakira.dev',
  integrations: [react(), mdx(), sitemap(), icon(), clientIntro()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});