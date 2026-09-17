import PostListPage from '../components/PostListPage';

export default function Blog() {
  return (
    <PostListPage
      type="blog"
      title="Blog"
      description="Articles, tutorials, and technical insights about Data Science, Machine Learning, and Software Engineering."
      emptyMessage="No articles found for the selected tag."
      searchPlaceholder="Graph Neural..."
    />
  );
}
