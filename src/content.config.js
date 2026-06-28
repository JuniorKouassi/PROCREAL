import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const formations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/formations' }),
  schema: z.object({
    title: z.string(),
    title_en: z.string(),
    duration: z.string(),
    duration_en: z.string(),
    schedule: z.string().optional(),
    schedule_en: z.string().optional(),
    startDate: z.string().optional(),
    price: z.number().optional(),
    registration: z.number().optional(),
    currency: z.string().default('FCFA'),
    location: z.string().optional(),
    location_en: z.string().optional(),
    level: z.string().optional(),
    level_en: z.string().optional(),
    domain: z.enum(['cao-dao', 'architecture', 'btp']).default('cao-dao'),
    modules: z.array(z.string()).optional(),
    modules_en: z.array(z.string()).optional(),
    seats: z.number().optional(),
    audience: z.string(),
    audience_en: z.string(),
    prerequisites: z.array(z.string()),
    prerequisites_en: z.array(z.string()),
    outcomes: z.array(z.string()),
    outcomes_en: z.array(z.string()),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })),
    faq_en: z.array(z.object({ question: z.string(), answer: z.string() })),
    program: z.array(z.string()).optional(),
    program_en: z.array(z.string()).optional(),
    bonus: z.array(z.string()).optional(),
    bonus_en: z.array(z.string()).optional(),
    certification: z.string().optional(),
    description: z.string(),
    description_en: z.string(),
    edition: z.string().optional(),
    instructor: z.string().default('KOKO Landry'),
    featured: z.boolean().default(false),
    newBadge: z.boolean().default(false),
    image: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    title_en: z.string(),
    excerpt: z.string(),
    excerpt_en: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['conseils-metier', 'etudes-de-cas', 'actualites', 'temoignages']),
    author: z.string().default('Équipe PROcréal'),
    image: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    name: z.string(),
    role: z.string().optional(),
    role_en: z.string().optional(),
    formationSlug: z.string().optional(),
    quote: z.string(),
    quote_en: z.string().optional(),
    avatar: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { formations, blog, testimonials };
