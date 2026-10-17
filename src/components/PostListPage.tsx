import FeedCard from './FeedCard';
import { usePostsList } from '../hooks/usePostsList';
import type { PostType } from '../types/post';

interface PostListPageProps {
  type: PostType;
  title: string;
  description: string;
  emptyMessage: string;
  searchPlaceholder?: string;
}

export default function PostListPage({
  type,
  title,
  description,
  emptyMessage,
  searchPlaceholder = 'Search...',
}: PostListPageProps) {
  const {
    postsFiltered,
    filteredCount,
    hasMore,
    availableTags,
    filterTag,
    query,
    handleLoadMore,
    handleTagFilterChange,
    handleQueryChange,
  } = usePostsList(type);

  return (
    <main className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>

      <section style={{ marginBottom: '32px' }}>
        <h1 className="text-serif font-bold text-main" style={{ fontSize: '2rem' }}>
          {title}
        </h1>
        <p className="text-muted" style={{ marginTop: '8px' }}>
          {description}
        </p>
      </section>

      <section className="flex-row  flex-wrap">
        <div className="text-main flex-between gap-md">

          <div className="text-muted text-main" style={{ fontSize: '0.9rem' }}>
            <span>Search: </span>
            <input
              style={{ marginLeft: '8px', padding: '4px 8px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', fontSize: '0.9rem' }}
              onChange={handleQueryChange}
              value={query}
              type="text"
              placeholder={searchPlaceholder}
            />
          </div>

          <label>Filter by tag:
            <select
              id="tag-filter"
              className="text-muted"
              style={{ marginLeft: '8px', padding: '4px 8px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', fontSize: '0.9rem' }}
              value={filterTag}
              onChange={handleTagFilterChange}
            >
              <option value="">All</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <hr className="divider" style={{ margin: '24px 0' }} />

      <section className="flex-col gap-sm">
        {filteredCount === 0 ? (
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>{emptyMessage}</p>
        ) : (
          postsFiltered.map((post) => (
            <FeedCard
              key={post.id}
              id={post.id}
              title={post.title}
              summary={post.summary}
              date={post.date}
              tags={post.tags}
              link={post.link}
              owner={post.owner}
              imgUrl={post.imgUrl}
              likesCount={post.likesCount}
              viewsCount={post.viewsCount}
              showShareButton={post.showShareButton}
            />
          ))
        )}
      </section>

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button onClick={handleLoadMore} className="btn">
            Load More
          </button>
        </div>
      )}

    </main>
  );
}
