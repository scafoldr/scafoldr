import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, posts, follows } from '@/drizzle/schema';
import { count, sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get total counts for each entity
    const [usersCount, postsCount, followsCount] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(posts),
      db.select({ count: count() }).from(follows),
    ]);

    // Calculate growth rate (new users in last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [recentUsers, previousUsers] = await Promise.all([
      db
        .select({ count: count() })
        .from(users)
        .where(sql`${users.createdAt} >= ${thirtyDaysAgo.toISOString()}`),
      db
        .select({ count: count() })
        .from(users)
        .where(sql`${users.createdAt} >= ${sixtyDaysAgo.toISOString()} AND ${users.createdAt} < ${thirtyDaysAgo.toISOString()}`),
    ]);

    const recentCount = recentUsers[0]?.count || 0;
    const previousCount = previousUsers[0]?.count || 0;
    
    let growthRate = 0;
    if (previousCount > 0) {
      growthRate = ((recentCount - previousCount) / previousCount) * 100;
    } else if (recentCount > 0) {
      growthRate = 100; // 100% growth if no previous users
    }

    return NextResponse.json({
      totalUsers: usersCount[0]?.count || 0,
      totalPosts: postsCount[0]?.count || 0,
      totalFollows: followsCount[0]?.count || 0,
      growthRate: Math.round(growthRate * 10) / 10, // Round to 1 decimal place
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}