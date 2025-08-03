import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, posts, follows } from '@/drizzle/schema';
import { userSchema } from '@/lib/validations';
import { eq, ilike, or, sql, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (query) {
      conditions.push(ilike(users.username, `%${query}%`));
    }
    if (role) {
      conditions.push(eq(users.role, role));
    }

    // Get users with stats
    const usersWithStats = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
        postsCount: sql<number>`COALESCE(${count(posts.id)}, 0)`,
        followersCount: sql<number>`COALESCE(followers_count.count, 0)`,
        followingCount: sql<number>`COALESCE(following_count.count, 0)`,
      })
      .from(users)
      .leftJoin(posts, eq(users.id, posts.userId))
      .leftJoin(
        sql`(
          SELECT followed_user_id, COUNT(*) as count 
          FROM follows 
          GROUP BY followed_user_id
        ) as followers_count`,
        sql`followers_count.followed_user_id = ${users.id}`
      )
      .leftJoin(
        sql`(
          SELECT following_user_id, COUNT(*) as count 
          FROM follows 
          GROUP BY following_user_id
        ) as following_count`,
        sql`following_count.following_user_id = ${users.id}`
      )
      .where(conditions.length > 0 ? or(...conditions) : undefined)
      .groupBy(users.id, sql`followers_count.count`, sql`following_count.count`)
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(users)
      .where(conditions.length > 0 ? or(...conditions) : undefined);

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      users: usersWithStats,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = userSchema.parse(body);

    const [newUser] = await db
      .insert(users)
      .values(validatedData)
      .returning();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}