import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  username: z.string().min(1, 'Username is required').max(255, 'Username too long'),
  role: z.string().min(1, 'Role is required').max(50, 'Role too long'),
});

export const updateUserSchema = userSchema.partial();

// Post validation schemas
export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  body: z.string().min(1, 'Body is required'),
  userId: z.number().int().positive('User ID must be a positive integer'),
  status: z.string().min(1, 'Status is required').max(50, 'Status too long'),
});

export const updatePostSchema = postSchema.partial().extend({
  id: z.number().int().positive(),
});

// Follow validation schemas
export const followSchema = z.object({
  followingUserId: z.number().int().positive('Following user ID must be a positive integer'),
  followedUserId: z.number().int().positive('Followed user ID must be a positive integer'),
}).refine((data) => data.followingUserId !== data.followedUserId, {
  message: "Users cannot follow themselves",
  path: ["followedUserId"],
});

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export const userFilterSchema = searchSchema.extend({
  role: z.string().optional(),
});

export const postFilterSchema = searchSchema.extend({
  status: z.string().optional(),
  userId: z.number().int().positive().optional(),
});

// Type exports
// Simplified post schema for forms (without userId initially)
export const postFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  body: z.string().min(1, 'Body is required'),
  status: z.string().min(1, 'Status is required').max(50, 'Status too long'),
  userId: z.number().int().positive('User ID must be a positive integer'),
});

export type UserInput = z.infer<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type PostFormInput = z.infer<typeof postFormSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type FollowInput = z.infer<typeof followSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
export type PostFilterInput = z.infer<typeof postFilterSchema>;