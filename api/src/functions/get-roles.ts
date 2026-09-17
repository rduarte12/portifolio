import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';

interface RolesRequestBody {
  identityProvider: string;
  userId: string;
  userDetails: string;
  claims: { typ: string; val: string }[];
}

/** Azure SWA calls this after login to resolve custom roles (configured as `auth.rolesSource`). */
async function handler(request: HttpRequest): Promise<HttpResponseInit> {
  const body = (await request.json()) as RolesRequestBody;
  const ownerUsername = process.env.OWNER_GITHUB_USERNAME;

  const roles = body.userDetails === ownerUsername ? ['admin'] : [];
  return { status: 200, jsonBody: { roles } };
}

app.http('get-roles', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'GetRoles',
  handler,
});
