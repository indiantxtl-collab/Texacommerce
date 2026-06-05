import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reelId } = params;
    const { targetUserId, targetType, message } = await request.json(); // targetType: 'dm' | 'story'

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    if (targetType === "dm" && targetUserId) {
      // Share to DM
      await sql`
        INSERT INTO messages (sender_id, receiver_id, message, created_at)
        VALUES (${userId}, ${targetUserId}, ${message || `Shared a reel: /reel/${reelId}`}, NOW())
      `;

      // Create notification
      await sql`
        INSERT INTO notifications (user_id, actor_id, type, title, body, entity_type, entity_id, created_at)
        VALUES (${targetUserId}, ${userId}, 'share', 'Shared a reel', ${message || "Check out this reel!"}, 'reel', ${reelId}, NOW())
      `;
    } else if (targetType === "story") {
      // Share to story
      const reel =
        await sql`SELECT video_url, thumbnail_url FROM reels WHERE id = ${reelId} LIMIT 1`;
      if (reel && reel.length > 0) {
        await sql`
          INSERT INTO stories (user_id, media_url, media_type, caption, created_at, expires_at)
          VALUES (${userId}, ${reel[0].video_url}, 'video', ${message || "Shared a reel"}, NOW(), NOW() + INTERVAL '24 hours')
        `;
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error sharing reel:", error);
    return Response.json({ error: "Failed to share reel" }, { status: 500 });
  }
}
