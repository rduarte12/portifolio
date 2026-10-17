import PostListPage from '../components/PostListPage';

export default function Research() {
  return (
    <PostListPage
      type="research"
      title="Research"
      description="A collection of our recent research works."
      emptyMessage="No research works found for the selected tag."
      searchPlaceholder="Graph Neural..."
    />
  );
}
