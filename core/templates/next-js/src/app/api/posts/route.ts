import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users } from '@/drizzle/schema';
import { postSchema } from '@/lib/validations';
import { eq, ilike, or, count, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (query) {
      conditions.push(
        or(
          ilike(posts.title, `%${query}%`),
          ilike(posts.body, `%${query}%`)
        )
      );
    }
    if (status) {
      conditions.push(eq(posts.status, status));
    }
    if (userId) {
      conditions.push(eq(posts.userId, parseInt(userId)));
    }

    // Get posts with author information
    const postsWithAuthor = await db
      .select({
        id: posts.id,
        title: posts.title,
        body: posts.body,
        userId: posts.userId,
        status: posts.status,
        createdAt: posts.createdAt,
        authorName: users.username,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(conditions.length > 0 ? or(...conditions) : undefined)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(posts)
      .where(conditions.length > 0 ? or(...conditions) : undefined);

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      posts: postsWithAuthor,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = postSchema.parse(body);

    const [newPost] = await db
      .insert(posts)
      .values(validatedData)
      .returning();

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}