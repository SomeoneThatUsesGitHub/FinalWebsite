export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  categoryId?: number;
  published?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  viewCount?: number;
  commentCount?: number;
  author?: Author;
  sources?: string;
}

export interface Author {
  id: number;
  username: string;
  displayName: string;
  role: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  description?: string;
}