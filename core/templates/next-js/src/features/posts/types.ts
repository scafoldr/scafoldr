import { Post, NewPost } from '@/drizzle/schema';

export type { Post, NewPost };

export interface PostWithAuthor extends Post {
  authorName: string;
}

export interface PostsResponse {
  posts: PostWithAuthor[];
  total: number;
  page: number;
  limit: number;
}

export interface PostFilters {
  query?: string;
  status?: string;
  userId?: number;
  page?: number;
  limit?: number;
}