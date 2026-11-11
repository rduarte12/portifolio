import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminEditor, { type PostFormValues } from '../components/AdminEditor';

export default function Admin() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleCreate(values: PostFormValues) {
    setSuccessMessage(null);
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
        imgUrl: values.imgUrl || undefined,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error?.message ?? `Request failed with status ${response.status}`);
    }

    setSuccessMessage('Post created successfully.');
  }

  if (loading) {
    return (
      <main className="container" style={{ marginTop: '40px' }}>
        <p className="text-muted">Loading...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="container" style={{ marginTop: '40px' }}>
        <h1 className="text-serif font-bold text-main" style={{ fontSize: '2rem' }}>Admin</h1>
        <p className="text-muted" style={{ marginTop: '16px' }}>You need to sign in to access the admin panel.</p>
        <a href="/.auth/login/github?post_login_redirect_uri=/admin" className="btn" style={{ marginTop: '16px', display: 'inline-block' }}>
          Sign in with GitHub
        </a>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="container" style={{ marginTop: '40px' }}>
        <h1 className="text-serif font-bold text-main" style={{ fontSize: '2rem' }}>Admin</h1>
        <p className="text-muted" style={{ marginTop: '16px' }}>Your account does not have access to this area.</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
      <h1 className="text-serif font-bold text-main" style={{ fontSize: '2rem' }}>New Post</h1>
      <p className="text-muted" style={{ marginTop: '8px', marginBottom: '24px' }}>
        Create a new blog, research or project entry.
      </p>

      {successMessage && (
        <p style={{ color: 'green', marginBottom: '16px' }}>{successMessage}</p>
      )}

      <AdminEditor submitLabel="Create Post" onSubmit={handleCreate} />
    </main>
  );
}
