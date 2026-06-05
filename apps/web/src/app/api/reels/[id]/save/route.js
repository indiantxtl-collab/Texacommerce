import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Using wishlist table for saved reels (can repurpose or create reel_saves table)
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

    // Check if already saved (using a JSON field or separate table)
    // For now, store in notifications data field as saved marker
    const existing = await sql`
      SELECT id FROM notifications 
      WHERE user_id = ${userId} 
      AND entity_type = 'reel_save' 
      AND entity_id = ${reelId}
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      // Unsave
      await sql`
        DELETE FROM notifications 
        WHERE user_id = ${userId} 
        AND entity_type = 'reel_save' 
        AND entity_id = ${reelId}
      `;
      return Response.json({ success: true, saved: false });
    } else {
      // Save
      await sql`
        INSERT INTO notifications (user_id, type, title, entity_type, entity_id, is_read, created_at)
        VALUES (${userId}, 'save', 'Saved reel', 'reel_save', ${reelId}, true, NOW())
      `;
      return Response.json({ success: true, saved: true });
    }
  } catch (error) {
    console.error("Error saving reel:", error);
    return Response.json({ error: "Failed to save reel" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    const saved = await sql`
      SELECT 
        r.id,
        r.video_url,
        r.caption,
        r.thumbnail_url,
        r.views,
        r.created_at,
        u.username,
        u.profile_picture
      FROM notifications n
      JOIN reels r ON n.entity_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE n.user_id = ${userId} AND n.entity_type = 'reel_save'
      ORDER BY n.created_at DESC
    `;

    return Response.json({ saved });
  } catch (error) {
    console.error("Error fetching saved reels:", error);
    return Response.json(
      { error: "Failed to fetch saved reels" },
      { status: 500 },
    );
  }
}
