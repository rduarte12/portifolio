import { app, type HttpResponseInit } from '@azure/functions';
import { postsRepository } from '../repositories/postsRepository.js';
import { errorResponse } from '../shared/errors.js';

async function handler(): Promise<HttpResponseInit> {
  try {
    const items = await postsRepository.searchIndex();
    return {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=300' },
      jsonBody: items,
    };
  } catch (error) {
    return errorResponse(error);
  }
}

app.http('search-index', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'search-index',
  handler,
});
