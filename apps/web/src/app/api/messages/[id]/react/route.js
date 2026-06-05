import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: messageId } = params;
    const { reaction } = await request.json(); // emoji string

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    // Store reaction in story_reactions table (repurposing for messages)
    // Or add to data JSONB field in notifications
    // For simplicity, let's use a comment-like approach
    await sql`
      INSERT INTO notifications (user_id, type, title, body, entity_type, entity_id, data, created_at)
      VALUES (${userId}, 'reaction', 'Message reaction', ${reaction}, 'message', ${messageId}, '{"reaction": "${reaction}"}', NOW())
      ON CONFLICT DO NOTHING
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error reacting to message:", error);
    return Response.json(
      { error: "Failed to react to message" },
      { status: 500 },
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id: messageId } = params;

    const reactions = await sql`
      SELECT 
        n.body as reaction,
        n.user_id,
        u.username,
        u.profile_picture
      FROM notifications n
      JOIN users u ON n.user_id = u.id
      WHERE n.entity_type = 'message' AND n.entity_id = ${messageId} AND n.type = 'reaction'
    `;

    return Response.json({ reactions });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return Response.json(
      { error: "Failed to fetch reactions" },
      { status: 500 },
    );
  }
}
