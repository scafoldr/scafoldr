import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { follows, users } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { FollowWithUsers } from '@/features/follows/types';

// GET /api/follows/[id] - Get a specific follow relationship
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const syntheticId = parseInt(params.id);
    
    // Decode the synthetic ID back to the composite key
    const followingUserId = Math.floor(syntheticId / 1000000);
    const followedUserId = syntheticId % 1000000;

    const follow = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followingUserId, followingUserId),
          eq(follows.followedUserId, followedUserId)
        )
      )
      .limit(1);

    if (follow.length === 0) {
      return NextResponse.json(
        { error: 'Follow relationship not found' },
        { status: 404 }
      );
    }

    // Get usernames
    const [followerUser, followedUser] = await Promise.all([
      db.select({ username: users.username }).from(users).where(eq(users.id, followingUserId)).limit(1),
      db.select({ username: users.username }).from(users).where(eq(users.id, followedUserId)).limit(1),
    ]);

    const response: FollowWithUsers = {
      id: syntheticId,
      followingUserId: follow[0].followingUserId,
      followedUserId: follow[0].followedUserId,
      createdAt: follow[0].createdAt,
      followerUsername: followerUser[0]?.username || 'Unknown',
      followedUsername: followedUser[0]?.username || 'Unknown',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching follow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follow' },
      { status: 500 }
    );
  }
}

// DELETE /api/follows/[id] - Delete a follow relationship
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const syntheticId = parseInt(params.id);
    
    // Decode the synthetic ID back to the composite key
    const followingUserId = Math.floor(syntheticId / 1000000);
    const followedUserId = syntheticId % 1000000;

    const deletedFollow = await db
      .delete(follows)
      .where(
        and(
          eq(follows.followingUserId, followingUserId),
          eq(follows.followedUserId, followedUserId)
        )
      )
      .returning();

    if (deletedFollow.length === 0) {
      return NextResponse.json(
        { error: 'Follow relationship not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Follow relationship deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting follow:', error);
    return NextResponse.json(
      { error: 'Failed to delete follow' },
      { status: 500 }
    );
  }
}