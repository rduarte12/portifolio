import FeedCard from '../components/FeedCard';
import postsData from '../data/blogData.json';
import { useState } from 'react';

export default function Blog() {

  const [visibleCount, setVisibleCount] = useState(5);

  const sortedPosts = [...postsData].sort((a, b) => a.id - b.id).reverse(); 
  const visiblePosts = sortedPosts.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  const [filterTag, setFilterTag] = useState('ALL');

  const handleTagFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterTag(event.target.value);
    setVisibleCount(5); 
  };

  function filterByTag(posts: typeof postsData, tag: string) {
    if (tag === 'ALL' || tag === '') {
      return [posts, posts.length] as const;
    } else {
      const filteredPosts = posts.filter(post => post.tags.includes(tag));
      return [filteredPosts, filteredPosts.length] as const;
    }
  }

  const [query, setQuery] = useState('');

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setVisibleCount(5);
  };

  function filterByQuery(posts: typeof postsData, query: string) {
    if (query === '') {
      return [posts, posts.length] as const;
    } else {
      const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.summary.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      return [filteredPosts, filteredPosts.length] as const;
    }
  }

  function filterPosts(posts: typeof postsData, tag: string, query: string) {
    const [postsByTag, countByTag] = filterByTag(posts, tag);
    const [postsByQuery, countByQuery] = filterByQuery(postsByTag, query);
    return [postsByQuery, countByQuery] as const;
  }

  const [postsFiltered, filteredCount] = filterPosts(sortedPosts, filterTag, query);

  return (
    <main className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
      
      <section style={{ marginBottom: '32px' }}>
        <h1 className="text-serif font-bold text-main" style={{ fontSize: '2rem' }}>
          Blog
        </h1>
        <p className="text-muted" style={{ marginTop: '8px' }}>
          Articles, tutorials, and technical insights about Data Science, Machine Learning, and Software Engineering.
        </p>
      </section>

      <section className="flex-row  flex-wrap">
        <div className="text-main flex-between gap-md">

          <div className="text-muted text-main" style={{ fontSize: '0.9rem' }}>
            
              <span>Search: </span>
              <input style={{ marginLeft: '8px', padding: '4px 8px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', fontSize: '0.9rem' }}
              onChange={handleQueryChange} value={query} type="text" placeholder="Graph Neural..." />
            
          </div>

          <label>Filter by tag:

            <select id="tag-filter" className="text-muted" style={{ marginLeft: '8px', padding: '4px 8px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', fontSize: '0.9rem' }} value={filterTag} onChange={handleTagFilterChange}>
              <option value="">All</option>

              {Array.from(new Set(sortedPosts.flatMap(post => post.tags))).map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}

            </select>

          </label>
        </div>
      </section>

      <hr className="divider" style={{ margin: '24px 0' }} />

      <section className="flex-col gap-sm">
        {(() => {
          
          return (
            <>
              {filteredCount === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>No articles found for the selected tag.</p>
              ) : (
                postsFiltered.slice(0, visibleCount).map((post) => (
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
            </>
          );
        })()}
      </section>

      {visibleCount < sortedPosts.length && (
       <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button onClick={handleLoadMore} className="btn">
          Load More
        </button>
       </div> 
      )}

    </main>
  );
}