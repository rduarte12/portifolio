import { z } from 'zod';

export const postTypeSchema = z.enum(['blog', 'research', 'project']);

export const createPostSchema = z.object({
  type: postTypeSchema,
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  body: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  imgUrl: z.string().url().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  owner: z.string().min(1).optional(),
  showShareButton: z.boolean().default(true),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
