import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { postsRepository } from '../repositories/postsRepository.js';
import { tagsRepository } from '../repositories/tagsRepository.js';
import { createPostSchema } from '../validation/postSchema.js';
import { errorResponse, ApiError } from '../shared/errors.js';
import { isAdmin } from '../shared/auth.js';

async function handler(request: HttpRequest): Promise<HttpResponseInit> {
  try {
    if (!isAdmin(request)) {
      throw new ApiError(403, 'FORBIDDEN', 'Admin role required.');
    }

    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', parsed.error.issues.map((i) => i.message).join('; '));
    }

    const post = await postsRepository.create(parsed.data);
    await tagsRepository.attachPostToTags(post.tags, {
      postId: post.id,
      type: post.type,
      title: post.title,
      date: post.date,
    });

    return { status: 201, jsonBody: post };
  } catch (error) {
    return errorResponse(error);
  }
}

app.http('posts-create', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'posts',
  handler,
});
