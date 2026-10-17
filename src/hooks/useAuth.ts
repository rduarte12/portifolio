import { useEffect, useState } from 'react';

interface ClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
}

interface AuthState {
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userDetails: string | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: true,
    isAuthenticated: false,
    isAdmin: false,
    userDetails: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch('/.auth/me')
      .then((res) => res.json())
      .then((data: { clientPrincipal: ClientPrincipal | null }) => {
        if (cancelled) return;
        const principal = data.clientPrincipal;
        setState({
          loading: false,
          isAuthenticated: principal !== null,
          isAdmin: principal?.userRoles.includes('admin') ?? false,
          userDetails: principal?.userDetails ?? null,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, isAuthenticated: false, isAdmin: false, userDetails: null });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
