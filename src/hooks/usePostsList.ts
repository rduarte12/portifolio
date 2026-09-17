import { useState } from 'react';
import allPosts from '../data/postsData.json';
import type { Post, PostType } from '../types/post';

const PAGE_SIZE = 5;

export function usePostsList(type: PostType) {
  const postsOfType = (allPosts as Post[]).filter((post) => post.type === type);
  const sortedPosts = [...postsOfType].sort((a, b) => Number(a.id) - Number(b.id)).reverse();

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filterTag, setFilterTag] = useState('ALL');
  const [query, setQuery] = useState('');

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + PAGE_SIZE);
  };

  const handleTagFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterTag(event.target.value);
    setVisibleCount(PAGE_SIZE);
  };

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setVisibleCount(PAGE_SIZE);
  };

  const byTag = filterTag === 'ALL' || filterTag === ''
    ? sortedPosts
    : sortedPosts.filter((post) => post.tags.includes(filterTag));

  const postsFiltered = query === ''
    ? byTag
    : byTag.filter((post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.summary.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      );

  const availableTags = Array.from(new Set(sortedPosts.flatMap((post) => post.tags)));

  return {
    postsFiltered: postsFiltered.slice(0, visibleCount),
    filteredCount: postsFiltered.length,
    hasMore: visibleCount < postsFiltered.length,
    availableTags,
    filterTag,
    query,
    handleLoadMore,
    handleTagFilterChange,
    handleQueryChange,
  };
}
