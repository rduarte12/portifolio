import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AnalyticsSummary {
  yearMonth: string;
  topPosts: { postId: string; views: number }[];
  readMoreClicks: { postId: string; clicks: number }[];
  averageDurationMsByPost: { postId: string; averageDurationMs: number }[];
  uniqueVisitors: number;
}

export default function AdminDashboard() {
  const { loading: authLoading, isAuthenticated, isAdmin } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/analytics/summary')
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then(setSummary)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load analytics.'));
  }, [isAdmin]);

  if (authLoading) {
    return (
      <main className="container" style={{ marginTop: '40px' }}>
        <p className="text-muted">Loading...</p>
      </main>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <main className="container" style={{ marginTop: '40px' }}>
        <h1 className="text-serif font-bold text-main" style={{ fontSize: '2rem' }}>Dashboard</h1>
        <p className="text-muted" style={{ marginTop: '16px' }}>You need admin access to view this page.</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
      <h1 className="text-serif font-bold text-main" style={{ fontSize: '2rem' }}>Dashboard</h1>
      <p className="text-muted" style={{ marginTop: '8px', marginBottom: '24px' }}>
        Access metrics{summary ? ` for ${summary.yearMonth}` : ''}.
      </p>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {summary && (
        <div className="flex-col gap-lg">
          <section>
            <h3 className="title-section text-serif">Unique visitors</h3>
            <p className="text-main font-bold" style={{ fontSize: '1.5rem' }}>{summary.uniqueVisitors}</p>
          </section>

          <section>
            <h3 className="title-section text-serif">Most viewed posts</h3>
            <ul>
              {summary.topPosts.map((p) => (
                <li key={p.postId} className="text-muted">{p.postId} — {p.views} views</li>
              ))}
              {summary.topPosts.length === 0 && <li className="text-muted">No page views recorded yet.</li>}
            </ul>
          </section>

          <section>
            <h3 className="title-section text-serif">"Read More" clicks</h3>
            <ul>
              {summary.readMoreClicks.map((c) => (
                <li key={c.postId} className="text-muted">{c.postId} — {c.clicks} clicks</li>
              ))}
              {summary.readMoreClicks.length === 0 && <li className="text-muted">No clicks recorded yet.</li>}
            </ul>
          </section>

          <section>
            <h3 className="title-section text-serif">Average time on page</h3>
            <ul>
              {summary.averageDurationMsByPost.map((d) => (
                <li key={d.postId} className="text-muted">{d.postId} — {Math.round(d.averageDurationMs / 1000)}s</li>
              ))}
              {summary.averageDurationMsByPost.length === 0 && <li className="text-muted">No duration data recorded yet.</li>}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
