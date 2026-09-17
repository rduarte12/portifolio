import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { postsRepository } from '../repositories/postsRepository.js';
import { tagsRepository } from '../repositories/tagsRepository.js';
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

    await postsRepository.remove(id, existing.type);
    await tagsRepository.detachPostFromAllTags(id);

    return { status: 204 };
  } catch (error) {
    return errorResponse(error);
  }
}

app.http('posts-delete', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'posts/{id}',
  handler,
});
