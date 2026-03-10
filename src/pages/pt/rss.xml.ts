import type { APIContext } from 'astro';
import { generateRssFeed } from '@data/rss';

export async function GET(context: APIContext) {
  return generateRssFeed({
    context,
    locale: 'pt',
    description: 'Reflexões sobre engenharia de software, arquitetura e tecnologia.',
    language: 'pt-BR',
  });
}
