import type { HttpResponseInit } from '@azure/functions';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export function errorResponse(error: unknown): HttpResponseInit {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      jsonBody: { error: { code: error.code, message: error.message } },
    };
  }

  console.error(error);
  return {
    status: 500,
    jsonBody: { error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error.' } },
  };
}
