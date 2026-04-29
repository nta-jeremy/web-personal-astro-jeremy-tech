import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    readingTime: z.number().optional(),
    locale: z.enum(['en', 'vi']).default('en'),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    url: z.string().optional(),
    github: z.string().optional(),
    tech: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    categories: z.array(z.string()).default([]),
    liveUrl: z.string().optional(),
    repoUrl: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const collections = { blog, projects };
