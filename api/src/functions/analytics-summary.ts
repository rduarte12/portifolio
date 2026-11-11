import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { accessLogsRepository } from '../repositories/accessLogsRepository.js';
import { errorResponse, ApiError } from '../shared/errors.js';
import { isAdmin } from '../shared/auth.js';

async function handler(request: HttpRequest): Promise<HttpResponseInit> {
  try {
    if (!isAdmin(request)) {
      throw new ApiError(403, 'FORBIDDEN', 'Admin role required.');
    }

    const yearMonth = request.query.get('yearMonth') ?? undefined;
    const summary = await accessLogsRepository.summary(yearMonth);
    return { status: 200, jsonBody: summary };
  } catch (error) {
    return errorResponse(error);
  }
}

app.http('analytics-summary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'analytics/summary',
  handler,
});
