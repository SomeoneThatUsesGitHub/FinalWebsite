export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl: string | null;
  sources?: string | null;
  authorId: number;
  categoryId: number;
  published: boolean;
  featured: boolean;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    displayName: string;
    title: string | null;
    avatarUrl: string | null;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}