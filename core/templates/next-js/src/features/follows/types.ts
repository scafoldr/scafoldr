import { follows } from '@/drizzle/schema';

export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;

// Extended type with user information for display and a synthetic ID for CRUD operations
export interface FollowWithUsers extends Follow {
  id: number; // Synthetic ID for CRUD operations (will be generated from composite key)
  followerUsername: string;
  followedUsername: string;
}