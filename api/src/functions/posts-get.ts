import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { postsRepository } from '../repositories/postsRepository.js';
import { errorResponse, ApiError } from '../shared/errors.js';

async function handler(request: HttpRequest): Promise<HttpResponseInit> {
  try {
    const id = request.params.id;
    const post = await postsRepository.getByIdAnyType(id);
    if (!post || post.status !== 'published') {
      throw new ApiError(404, 'NOT_FOUND', `Post '${id}' not found.`);
    }
    return { status: 200, jsonBody: post };
  } catch (error) {
    return errorResponse(error);
  }
}

app.http('posts-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'posts/{id}',
  handler,
});
