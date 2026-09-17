import { useMemo, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { PostType } from '../types/post';

export interface PostFormValues {
  type: PostType;
  title: string;
  summary: string;
  body: string;
  tags: string;
  imgUrl: string;
  status: 'draft' | 'published';
}

interface AdminEditorProps {
  initialValues?: Partial<PostFormValues>;
  submitLabel: string;
  onSubmit: (values: PostFormValues) => Promise<void>;
}

const emptyValues: PostFormValues = {
  type: 'blog',
  title: '',
  summary: '',
  body: '',
  tags: '',
  imgUrl: '',
  status: 'draft',
};

export default function AdminEditor({ initialValues, submitLabel, onSubmit }: AdminEditorProps) {
  const [values, setValues] = useState<PostFormValues>({ ...emptyValues, ...initialValues });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewHtml = useMemo(() => {
    const rawHtml = marked.parse(values.body, { async: false }) as string;
    return DOMPurify.sanitize(rawHtml);
  }, [values.body]);

  function update<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-col gap-md">
      <div className="flex-row flex-wrap gap-md">
        <label className="flex-col gap-sm" style={{ flex: 1, minWidth: '200px' }}>
          Title
          <input
            required
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </label>

        <label className="flex-col gap-sm">
          Type
          <select
            value={values.type}
            onChange={(e) => update('type', e.target.value as PostType)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ccc' }}
          >
            <option value="blog">Blog</option>
            <option value="research">Research</option>
            <option value="project">Project</option>
          </select>
        </label>

        <label className="flex-col gap-sm">
          Status
          <select
            value={values.status}
            onChange={(e) => update('status', e.target.value as 'draft' | 'published')}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ccc' }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>

      <label className="flex-col gap-sm">
        Summary
        <textarea
          required
          value={values.summary}
          onChange={(e) => update('summary', e.target.value)}
          rows={2}
          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
      </label>

      <div className="flex-row flex-wrap gap-md">
        <label className="flex-col gap-sm" style={{ flex: 1, minWidth: '200px' }}>
          Tags (comma-separated)
          <input
            value={values.tags}
            onChange={(e) => update('tags', e.target.value)}
            placeholder="nlp, transformers, deep-learning"
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </label>

        <label className="flex-col gap-sm" style={{ flex: 1, minWidth: '200px' }}>
          Cover image URL
          <input
            value={values.imgUrl}
            onChange={(e) => update('imgUrl', e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </label>
      </div>

      <div className="flex-row mobile-col gap-md" style={{ alignItems: 'stretch' }}>
        <label className="flex-col gap-sm" style={{ flex: 1 }}>
          Body (Markdown)
          <textarea
            required
            value={values.body}
            onChange={(e) => update('body', e.target.value)}
            rows={16}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'monospace' }}
          />
        </label>

        <div className="flex-col gap-sm" style={{ flex: 1 }}>
          Preview
          <div
            className="card"
            style={{ padding: '10px', minHeight: '300px', overflow: 'auto' }}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <div>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
