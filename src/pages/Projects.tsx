import PostListPage from '../components/PostListPage';

export default function Projects() {
  return (
    <PostListPage
      type="project"
      title="Projects"
      description="A collection of my projects and work in the field of Data Science, Machine Learning, and Software Engineering."
      emptyMessage="No projects found for the selected tag."
      searchPlaceholder="Graph Neural..."
    />
  );
}
