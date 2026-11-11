import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { postsRepository } from '../repositories/postsRepository.js';
import { accessLogsRepository } from '../repositories/accessLogsRepository.js';
import { errorResponse, ApiError } from '../shared/errors.js';

async function handler(request: HttpRequest): Promise<HttpResponseInit> {
  try {
    const id = request.params.id;
    const existing = await postsRepository.getByIdAnyType(id);
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', `Post '${id}' not found.`);
    }

    const viewsCount = await postsRepository.incrementViews(id, existing.type);
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    await accessLogsRepository.record(id, 'page_view', ip);

    return { status: 200, jsonBody: { viewsCount } };
  } catch (error) {
    return errorResponse(error);
  }
}

app.http('posts-view', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'posts/{id}/view',
  handler,
});
