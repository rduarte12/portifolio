import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { postsRepository } from '../repositories/postsRepository.js';
import { postTypeSchema } from '../validation/postSchema.js';
import { errorResponse, ApiError } from '../shared/errors.js';

async function handler(request: HttpRequest): Promise<HttpResponseInit> {
  try {
    const typeParam = request.query.get('type');
    const type = postTypeSchema.safeParse(typeParam);
    if (!type.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', "Query param 'type' must be one of blog, research, project.");
    }

    const tag = request.query.get('tag') ?? undefined;
    const limit = Number(request.query.get('limit') ?? '20');

    const items = await postsRepository.list(type.data, tag, limit);
    return { status: 200, jsonBody: { items } };
  } catch (error) {
    return errorResponse(error);
  }
}

app.http('posts-list', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'posts',
  handler,
});
