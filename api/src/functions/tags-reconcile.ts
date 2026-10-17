import { app, type Timer } from '@azure/functions';
import { postsRepository } from '../repositories/postsRepository.js';
import { getContainer } from '../shared/cosmosClient.js';
import type { TagDocument, PostRef } from '../repositories/tagsRepository.js';

function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Rebuilds every tag's postRefs from the current posts, correcting any drift
 * left by the non-transactional writes in posts-create/update/delete.
 */
async function handler(_timer: Timer): Promise<void> {
  const posts = await postsRepository.listAllPublished();
  const byTagSlug = new Map<string, TagDocument>();

  for (const post of posts) {
    for (const label of post.tags) {
      const slug = slugify(label);
      const ref: PostRef = { postId: post.id, type: post.type, title: post.title, date: post.date };
      const existing = byTagSlug.get(slug);
      if (existing) {
        existing.postRefs.push(ref);
        existing.postCount += 1;
      } else {
        byTagSlug.set(slug, { id: `tag_${slug}`, tagSlug: slug, label, postRefs: [ref], postCount: 1 });
      }
    }
  }

  const container = getContainer('tags');
  for (const tag of byTagSlug.values()) {
    await container.items.upsert(tag);
  }
}

app.timer('tags-reconcile', {
  schedule: '0 0 3 * * *',
  handler,
});
