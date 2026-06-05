import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reelId } = params;
    const { note } = await request.json();

    if (!note || note.trim().length === 0) {
      return Response.json({ error: "Note cannot be empty" }, { status: 400 });
    }

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    // Add note as a comment with special flag (you could add a 'is_note' column or use JSON metadata)
    const result = await sql`
      INSERT INTO reel_comments (reel_id, user_id, comment, created_at)
      VALUES (${reelId}, ${userId}, ${note.trim()}, NOW())
      RETURNING id
    `;

    // Update reel creator notification
    const reel =
      await sql`SELECT user_id FROM reels WHERE id = ${reelId} LIMIT 1`;
    if (reel && reel.length > 0 && reel[0].user_id !== userId) {
      await sql`
        INSERT INTO notifications (user_id, actor_id, type, title, body, entity_type, entity_id, created_at)
        VALUES (${reel[0].user_id}, ${userId}, 'comment', 'New note on your reel', ${note.slice(0, 50)}, 'reel', ${reelId}, NOW())
      `;
    }

    return Response.json({ success: true, noteId: result[0].id });
  } catch (error) {
    console.error("Error adding note:", error);
    return Response.json({ error: "Failed to add note" }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id: reelId } = params;

    const notes = await sql`
      SELECT 
        rc.id,
        rc.comment as note,
        rc.created_at,
        u.id as user_id,
        u.username,
        u.profile_picture
      FROM reel_comments rc
      JOIN users u ON rc.user_id = u.id
      WHERE rc.reel_id = ${reelId}
      ORDER BY rc.created_at DESC
    `;

    return Response.json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return Response.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}
