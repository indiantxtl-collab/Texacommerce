import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reelId } = params;

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    // Get reel creator
    const reel = await sql`
      SELECT user_id FROM reels WHERE id = ${reelId} LIMIT 1
    `;

    if (!reel || reel.length === 0) {
      return Response.json({ error: "Reel not found" }, { status: 404 });
    }

    const creatorId = reel[0].user_id;

    if (creatorId === userId) {
      return Response.json(
        { error: "Cannot follow yourself" },
        { status: 400 },
      );
    }

    // Check if already following
    const existing = await sql`
      SELECT id FROM followers WHERE follower_id = ${userId} AND following_id = ${creatorId} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      // Unfollow
      await sql`
        DELETE FROM followers WHERE follower_id = ${userId} AND following_id = ${creatorId}
      `;
      return Response.json({ success: true, following: false });
    } else {
      // Follow
      await sql`
        INSERT INTO followers (follower_id, following_id, created_at)
        VALUES (${userId}, ${creatorId}, NOW())
      `;

      // Create notification
      await sql`
        INSERT INTO notifications (user_id, actor_id, type, title, body, created_at)
        VALUES (${creatorId}, ${userId}, 'follow', 'New follower', 'started following you', NOW())
      `;

      return Response.json({ success: true, following: true });
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    return Response.json({ error: "Failed to toggle follow" }, { status: 500 });
  }
}
