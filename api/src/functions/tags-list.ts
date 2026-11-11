import { app, type HttpResponseInit } from '@azure/functions';
import { tagsRepository } from '../repositories/tagsRepository.js';
import { errorResponse } from '../shared/errors.js';

async function handler(): Promise<HttpResponseInit> {
  try {
    const tags = await tagsRepository.list();
    return {
      status: 200,
      jsonBody: { items: tags.map(({ tagSlug, label, postCount }) => ({ tagSlug, label, postCount })) },
    };
  } catch (error) {
    return errorResponse(error);
  }
}

app.http('tags-list', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'tags',
  handler,
});
