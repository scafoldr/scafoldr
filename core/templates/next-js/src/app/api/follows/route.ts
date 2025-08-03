import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { follows, users } from '@/drizzle/schema';
import { followSchema } from '@/lib/validations';
import { eq, and, or, ilike, desc, count, sql } from 'drizzle-orm';
import { FollowWithUsers } from '@/features/follows/types';

// GET /api/follows - List follows with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const query = searchParams.get('query') || '';
    const offset = (page - 1) * limit;

    // Get follows with user information
    const followsWithUsers = await db
      .select({
        followingUserId: follows.followingUserId,
        followedUserId: follows.followedUserId,
        createdAt: follows.createdAt,
        followerUsername: sql<string>`follower.username`,
        followedUsername: sql<string>`followed.username`,
      })
      .from(follows)
      .leftJoin(sql`users as follower`, sql`follower.id = ${follows.followingUserId}`)
      .leftJoin(sql`users as followed`, sql`followed.id = ${follows.followedUserId}`)
      .where(
        query 
          ? or(
              ilike(sql`follower.username`, `%${query}%`),
              ilike(sql`followed.username`, `%${query}%`)
            )
          : undefined
      )
      .orderBy(desc(follows.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(follows)
      .leftJoin(sql`users as follower`, sql`follower.id = ${follows.followingUserId}`)
      .leftJoin(sql`users as followed`, sql`followed.id = ${follows.followedUserId}`)
      .where(
        query 
          ? or(
              ilike(sql`follower.username`, `%${query}%`),
              ilike(sql`followed.username`, `%${query}%`)
            )
          : undefined
      );

    const total = totalResult[0]?.count || 0;

    // Transform results to include synthetic ID
    const transformedResults: FollowWithUsers[] = followsWithUsers.map((follow) => ({
      id: follow.followingUserId * 1000000 + follow.followedUserId, // Synthetic ID
      followingUserId: follow.followingUserId,
      followedUserId: follow.followedUserId,
      createdAt: follow.createdAt,
      followerUsername: follow.followerUsername || 'Unknown',
      followedUsername: follow.followedUsername || 'Unknown',
    }));

    return NextResponse.json({
      follows: transformedResults,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching follows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follows' },
      { status: 500 }
    );
  }
}

// POST /api/follows - Create a new follow relationship
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = followSchema.parse(body);

    // Check if follow relationship already exists
    const existingFollow = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followingUserId, validatedData.followingUserId),
          eq(follows.followedUserId, validatedData.followedUserId)
        )
      )
      .limit(1);

    if (existingFollow.length > 0) {
      return NextResponse.json(
        { error: 'Follow relationship already exists' },
        { status: 400 }
      );
    }

    const [newFollow] = await db
      .insert(follows)
      .values(validatedData)
      .returning();

    // Get usernames for response
    const [followerUser, followedUser] = await Promise.all([
      db.select({ username: users.username }).from(users).where(eq(users.id, newFollow.followingUserId)).limit(1),
      db.select({ username: users.username }).from(users).where(eq(users.id, newFollow.followedUserId)).limit(1),
    ]);

    const response: FollowWithUsers = {
      id: newFollow.followingUserId * 1000000 + newFollow.followedUserId,
      followingUserId: newFollow.followingUserId,
      followedUserId: newFollow.followedUserId,
      createdAt: newFollow.createdAt,
      followerUsername: followerUser[0]?.username || 'Unknown',
      followedUsername: followedUser[0]?.username || 'Unknown',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating follow:', error);
    return NextResponse.json(
      { error: 'Failed to create follow' },
      { status: 500 }
    );
  }
}