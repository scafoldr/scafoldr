import { User, NewUser } from '@/drizzle/schema';

export type { User, NewUser };

export interface UserWithStats extends User {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface UsersResponse {
  users: UserWithStats[];
  total: number;
  page: number;
  limit: number;
}

export interface UserFilters {
  query?: string;
  role?: string;
  page?: number;
  limit?: number;
}