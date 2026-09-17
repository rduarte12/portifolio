import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { tagsRepository } from '../repositories/tagsRepository.js';
import { errorResponse, ApiError } from '../shared/errors.js';

async function handler(request: HttpRequest): Promise<HttpResponseInit> {
  try {
    const slug = request.params.slug;
    const tag = await tagsRepository.getBySlug(slug);
    if (!tag) {
      throw new ApiError(404, 'NOT_FOUND', `Tag '${slug}' not found.`);
    }
    return { status: 200, jsonBody: tag };
  } catch (error) {
    return errorResponse(error);
  }
}

app.http('tags-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'tags/{slug}',
  handler,
});
