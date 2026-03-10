import type { APIContext } from 'astro';
import { generateRssFeed } from '@data/rss';

export async function GET(context: APIContext) {
  return generateRssFeed({
    context,
    locale: 'en',
    description: 'Thoughts on software engineering, architecture, and technology.',
    language: 'en',
  });
}
