export type PostType = 'blog' | 'research' | 'project';

export interface Post {
  id: string;
  type: PostType;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  link: string;
  owner?: string;
  imgUrl?: string;
  likesCount?: number;
  viewsCount?: number;
  showShareButton?: boolean;
}
