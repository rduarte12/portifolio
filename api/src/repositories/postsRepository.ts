import { randomUUID } from 'node:crypto';
import { getContainer } from '../shared/cosmosClient.js';
import type { CreatePostInput, UpdatePostInput } from '../validation/postSchema.js';

export interface PostDocument {
  id: string;
  type: 'blog' | 'research' | 'project';
  title: string;
  summary: string;
  body: string;
  tags: string[];
  date: string;
  owner?: string;
  imgUrl?: string;
  link: string;
  viewsCount: number;
  likesCount: number;
  showShareButton: boolean;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export type PostSummary = Omit<PostDocument, 'body'>;

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function stripBody(doc: PostDocument): PostSummary {
  const { body: _body, ...summary } = doc;
  return summary;
}

export const postsRepository = {
  async list(type: 'blog' | 'research' | 'project', tag?: string, limit = 20): Promise<PostSummary[]> {
    const container = getContainer('posts');
    const conditions = ['c.type = @type', 'c.status = "published"'];
    const parameters: { name: string; value: string | number }[] = [{ name: '@type', value: type }];

    if (tag) {
      conditions.push('ARRAY_CONTAINS(c.tags, @tag)');
      parameters.push({ name: '@tag', value: tag });
    }

    const query = {
      query: `SELECT * FROM c WHERE ${conditions.join(' AND ')} ORDER BY c.date DESC OFFSET 0 LIMIT @limit`,
      parameters: [...parameters, { name: '@limit', value: limit }],
    };

    const { resources } = await container.items.query<PostDocument>(query).fetchAll();
    return resources.map(stripBody);
  },

  async getById(id: string, type: 'blog' | 'research' | 'project'): Promise<PostDocument | null> {
    try {
      const container = getContainer('posts');
      const { resource } = await container.item(id, type).read<PostDocument>();
      return resource ?? null;
    } catch {
      return null;
    }
  },

  /** Point-reads require the partition key (/type); this resolves it via a cross-partition lookup by id. */
  async getByIdAnyType(id: string): Promise<PostDocument | null> {
    const container = getContainer('posts');
    const { resources } = await container.items
      .query<PostDocument>({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: id }] })
      .fetchAll();
    return resources[0] ?? null;
  },

  async create(input: CreatePostInput): Promise<PostDocument> {
    const container = getContainer('posts');
    const now = new Date().toISOString();
    const doc: PostDocument = {
      id: `post_${slugify(input.title)}_${randomUUID().slice(0, 8)}`,
      type: input.type,
      title: input.title,
      summary: input.summary,
      body: input.body,
      tags: input.tags,
      date: now.slice(0, 10),
      owner: input.owner,
      imgUrl: input.imgUrl,
      link: `/${input.type === 'project' ? 'projects' : input.type}/${slugify(input.title)}`,
      viewsCount: 0,
      likesCount: 0,
      showShareButton: input.showShareButton,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    };
    const { resource } = await container.items.create(doc);
    return resource as unknown as PostDocument;
  },

  async update(id: string, type: 'blog' | 'research' | 'project', input: UpdatePostInput): Promise<PostDocument | null> {
    const existing = await this.getById(id, type);
    if (!existing) return null;

    const container = getContainer('posts');
    const updated: PostDocument = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    const { resource } = await container.item(id, type).replace(updated);
    return resource as unknown as PostDocument;
  },

  async remove(id: string, type: 'blog' | 'research' | 'project'): Promise<void> {
    const container = getContainer('posts');
    await container.item(id, type).delete();
  },

  async incrementViews(id: string, type: 'blog' | 'research' | 'project'): Promise<number> {
    const container = getContainer('posts');
    const { resource } = await container.item(id, type).patch<PostDocument>([
      { op: 'incr', path: '/viewsCount', value: 1 },
    ]);
    return resource?.viewsCount ?? 0;
  },

  async incrementLikes(id: string, type: 'blog' | 'research' | 'project'): Promise<number> {
    const container = getContainer('posts');
    const { resource } = await container.item(id, type).patch<PostDocument>([
      { op: 'incr', path: '/likesCount', value: 1 },
    ]);
    return resource?.likesCount ?? 0;
  },

  async searchIndex(): Promise<Pick<PostDocument, 'id' | 'type' | 'title' | 'summary' | 'tags'>[]> {
    const container = getContainer('posts');
    const { resources } = await container.items
      .query<PostDocument>('SELECT c.id, c.type, c.title, c.summary, c.tags FROM c WHERE c.status = "published"')
      .fetchAll();
    return resources;
  },

  async listAllPublished(): Promise<PostDocument[]> {
    const container = getContainer('posts');
    const { resources } = await container.items
      .query<PostDocument>('SELECT * FROM c WHERE c.status = "published"')
      .fetchAll();
    return resources;
  },
};
