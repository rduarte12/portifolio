import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { postsRepository } from '../repositories/postsRepository.js';
import { accessLogsRepository } from '../repositories/accessLogsRepository.js';
import { errorResponse, ApiError } from '../shared/errors.js';

const LIKED_COOKIE_PREFIX = 'liked_';

async function handler(request: HttpRequest): Promise<HttpResponseInit> {
  try {
    const id = request.params.id;
    const existing = await postsRepository.getByIdAnyType(id);
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', `Post '${id}' not found.`);
    }

    const cookieHeader = request.headers.get('cookie') ?? '';
    const alreadyLiked = cookieHeader.includes(`${LIKED_COOKIE_PREFIX}${id}=1`);

    if (alreadyLiked) {
      return { status: 200, jsonBody: { likesCount: existing.likesCount, likedByYou: true } };
    }

    const likesCount = await postsRepository.incrementLikes(id, existing.type);
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    await accessLogsRepository.record(id, 'like', ip);

    return {
      status: 200,
      jsonBody: { likesCount, likedByYou: true },
      cookies: [{ name: `${LIKED_COOKIE_PREFIX}${id}`, value: '1', maxAge: 60 * 60 * 24 * 365 }],
    };
  } catch (error) {
    return errorResponse(error);
  }
}

app.http('posts-like', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'posts/{id}/like',
  handler,
});
