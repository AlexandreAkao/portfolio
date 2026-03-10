import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt();

interface RssFeedOptions {
  context: APIContext;
  locale: 'en' | 'pt';
  description: string;
  language: string;
}

export async function generateRssFeed({ context, locale, description, language }: RssFeedOptions) {
  const posts = await getCollection('blog', ({ id, data }) =>
    id.startsWith(`${locale}/`) && data.published
  );

  const sortedPosts = posts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  return rss({
    title: 'Alexandre Akira - Blog',
    description,
    site: context.site!,
    items: sortedPosts.map((post) => {
      const slug = post.id.replace(`${locale}/`, '');
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: `/blog/${slug}`,
        categories: post.data.tags,
        content: post.body ? parser.render(post.body) : undefined,
      };
    }),
    customData: `<language>${language}</language>`,
  });
}
