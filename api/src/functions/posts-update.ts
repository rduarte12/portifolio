import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { postsRepository } from '../repositories/postsRepository.js';
import { tagsRepository } from '../repositories/tagsRepository.js';
import { updatePostSchema } from '../validation/postSchema.js';
import { errorResponse, ApiError } from '../shared/errors.js';
import { isAdmin } from '../shared/auth.js';

async function handler(request: HttpRequest): Promise<HttpResponseInit> {
  try {
    if (!isAdmin(request)) {
      throw new ApiError(403, 'FORBIDDEN', 'Admin role required.');
    }

    const id = request.params.id;
    const existing = await postsRepository.getByIdAnyType(id);
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', `Post '${id}' not found.`);
    }

    const body = await request.json();
    const parsed = updatePostSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', parsed.error.issues.map((i) => i.message).join('; '));
    }

    const updated = await postsRepository.update(id, existing.type, parsed.data);
    if (updated && parsed.data.tags) {
      await tagsRepository.attachPostToTags(parsed.data.tags, {
        postId: updated.id,
        type: updated.type,
        title: updated.title,
        date: updated.date,
      });
    }

    return { status: 200, jsonBody: updated };
  } catch (error) {
    return errorResponse(error);
  }
}

app.http('posts-update', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'posts/{id}',
  handler,
});
