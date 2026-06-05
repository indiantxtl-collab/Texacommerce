import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reelId } = params;
    const { caption } = await request.json();

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    // Check if reel exists
    const reel = await sql`
      SELECT id, user_id, video_url, thumbnail_url FROM reels WHERE id = ${reelId} LIMIT 1
    `;

    if (!reel || reel.length === 0) {
      return Response.json({ error: "Reel not found" }, { status: 404 });
    }

    // Create repost as a new post
    const result = await sql`
      INSERT INTO posts (user_id, content, media_urls, media_type, original_post_id, is_repost, created_at)
      VALUES (
        ${userId}, 
        ${caption || `Reposted a reel`}, 
        ARRAY[${reel[0].video_url}], 
        'video', 
        ${reelId}, 
        true, 
        NOW()
      )
      RETURNING id
    `;

    // Notify original creator
    if (reel[0].user_id !== userId) {
      await sql`
        INSERT INTO notifications (user_id, actor_id, type, title, body, entity_type, entity_id, created_at)
        VALUES (${reel[0].user_id}, ${userId}, 'repost', 'Reposted your reel', ${caption || "Check it out!"}, 'reel', ${reelId}, NOW())
      `;
    }

    return Response.json({ success: true, postId: result[0].id });
  } catch (error) {
    console.error("Error reposting reel:", error);
    return Response.json({ error: "Failed to repost reel" }, { status: 500 });
  }
}
