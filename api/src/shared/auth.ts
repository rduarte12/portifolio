import type { HttpRequest } from '@azure/functions';

interface ClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
}

/** Decodes the `x-ms-client-principal` header injected by Azure Static Web Apps auth. */
export function getClientPrincipal(request: HttpRequest): ClientPrincipal | null {
  const header = request.headers.get('x-ms-client-principal');
  if (!header) return null;

  try {
    const decoded = Buffer.from(header, 'base64').toString('utf-8');
    return JSON.parse(decoded) as ClientPrincipal;
  } catch {
    return null;
  }
}

export function isAdmin(request: HttpRequest): boolean {
  const principal = getClientPrincipal(request);
  return principal?.userRoles.includes('admin') ?? false;
}
