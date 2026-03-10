import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ id, data }) =>
    id.startsWith('pt/') && data.published
  );

  const sortedPosts = posts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  return rss({
    title: 'Alexandre Akira - Blog',
    description: 'Reflexões sobre engenharia de software, arquitetura e tecnologia.',
    site: context.site!,
    items: sortedPosts.map((post) => {
      const slug = post.id.replace('pt/', '');
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: `/blog/${slug}`,
        categories: post.data.tags,
      };
    }),
    customData: '<language>pt-BR</language>',
  });
}
