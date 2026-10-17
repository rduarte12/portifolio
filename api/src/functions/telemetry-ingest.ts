import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { accessLogsRepository } from '../repositories/accessLogsRepository.js';
import { telemetryEventSchema } from '../validation/telemetrySchema.js';
import { errorResponse, ApiError } from '../shared/errors.js';

async function handler(request: HttpRequest): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const parsed = telemetryEventSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', parsed.error.issues.map((i) => i.message).join('; '));
    }

    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    await accessLogsRepository.record(parsed.data.postId, parsed.data.eventType, ip, parsed.data.durationMs);

    return { status: 204 };
  } catch (error) {
    return errorResponse(error);
  }
}

app.http('telemetry-ingest', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'telemetry',
  handler,
});
