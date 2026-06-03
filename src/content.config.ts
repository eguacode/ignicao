import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160, "A descrição não pode ter mais de 160 caracteres para otimização de SEO."),
    pubDate: z.date(),
    heroImage: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
};
