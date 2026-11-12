import { getContainer } from '../shared/cosmosClient.js';

export interface PostRef {
  postId: string;
  type: 'blog' | 'research' | 'project';
  title: string;
  date: string;
}

export interface TagSummary {
  tagSlug: string;
  label: string;
  postCount: number;
}

export interface TagDetail extends TagSummary {
  postRefs: PostRef[];
}

interface PublishedPost {
  id: string;
  type: PostRef['type'];
  title: string;
  date: string;
  tags: string[];
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function listPublishedPosts(): Promise<PublishedPost[]> {
  const container = getContainer('posts');
  const { resources } = await container.items
    .query<PublishedPost>('SELECT c.id, c.type, c.title, c.date, c.tags FROM c WHERE c.status = "published"')
    .fetchAll();
  return resources;
}

// Tags are derived from posts on read: with a small portfolio this avoids a third container.
export const tagsRepository = {
  async list(): Promise<TagSummary[]> {
    const posts = await listPublishedPosts();
    const bySlug = new Map<string, TagSummary>();

    for (const post of posts) {
      for (const label of post.tags) {
        const tagSlug = slugify(label);
        const existing = bySlug.get(tagSlug);
        if (existing) existing.postCount += 1;
        else bySlug.set(tagSlug, { tagSlug, label, postCount: 1 });
      }
    }

    return [...bySlug.values()].sort((a, b) => a.label.localeCompare(b.label));
  },

  async getBySlug(slug: string): Promise<TagDetail | null> {
    const posts = await listPublishedPosts();
    let label: string | null = null;
    const postRefs: PostRef[] = [];

    for (const post of posts) {
      const match = post.tags.find((t) => slugify(t) === slug);
      if (!match) continue;
      label ??= match;
      postRefs.push({ postId: post.id, type: post.type, title: post.title, date: post.date });
    }

    if (label === null) return null;
    postRefs.sort((a, b) => b.date.localeCompare(a.date));
    return { tagSlug: slug, label, postCount: postRefs.length, postRefs };
  },
};
