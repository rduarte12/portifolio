import { getContainer } from '../shared/cosmosClient.js';

export interface PostRef {
  postId: string;
  type: 'blog' | 'research' | 'project';
  title: string;
  date: string;
}

export interface TagDocument {
  id: string;
  tagSlug: string;
  label: string;
  postRefs: PostRef[];
  postCount: number;
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const tagsRepository = {
  async list(): Promise<TagDocument[]> {
    const container = getContainer('tags');
    const { resources } = await container.items.query<TagDocument>('SELECT * FROM c').fetchAll();
    return resources;
  },

  async getBySlug(slug: string): Promise<TagDocument | null> {
    try {
      const container = getContainer('tags');
      const { resource } = await container.item(`tag_${slug}`, slug).read<TagDocument>();
      return resource ?? null;
    } catch {
      return null;
    }
  },

  /** Adds/updates the given post reference in every tag it belongs to. Idempotent. */
  async attachPostToTags(labels: string[], ref: PostRef): Promise<void> {
    const container = getContainer('tags');
    for (const label of labels) {
      const slug = slugify(label);
      const existing = await this.getBySlug(slug);

      if (existing) {
        const otherRefs = existing.postRefs.filter((r) => r.postId !== ref.postId);
        const postRefs = [...otherRefs, ref];
        await container.item(existing.id, slug).replace<TagDocument>({
          ...existing,
          postRefs,
          postCount: postRefs.length,
        });
      } else {
        const doc: TagDocument = {
          id: `tag_${slug}`,
          tagSlug: slug,
          label,
          postRefs: [ref],
          postCount: 1,
        };
        await container.items.create(doc);
      }
    }
  },

  /** Removes a post reference from every tag document. Idempotent. */
  async detachPostFromAllTags(postId: string): Promise<void> {
    const container = getContainer('tags');
    const { resources } = await container.items.query<TagDocument>('SELECT * FROM c').fetchAll();

    for (const tag of resources) {
      if (!tag.postRefs.some((r) => r.postId === postId)) continue;
      const postRefs = tag.postRefs.filter((r) => r.postId !== postId);
      await container.item(tag.id, tag.tagSlug).replace<TagDocument>({
        ...tag,
        postRefs,
        postCount: postRefs.length,
      });
    }
  },
};
