import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "30");

    if (!userId) return Response.json({ notifications: [], unreadCount: 0 });

    const notifications = await sql`
      SELECT n.*, 
        u.username as actor_username, u.full_name as actor_name, u.profile_picture as actor_avatar, u.verified as actor_verified
      FROM notifications n
      LEFT JOIN users u ON n.actor_id = u.id
      WHERE n.user_id = ${userId}
        ${unreadOnly ? sql`AND n.is_read = false` : sql``}
      ORDER BY n.created_at DESC
      LIMIT ${limit}
    `;

    const [{ count }] =
      await sql`SELECT COUNT(*)::int as count FROM notifications WHERE user_id = ${userId} AND is_read = false`;

    return Response.json({ notifications, unreadCount: count });
  } catch (error) {
    console.error("Get notifications error:", error);
    return Response.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { userId, actorId, type, title, body, entityType, entityId, data } =
      await request.json();

    if (!userId || !type || !title) {
      return Response.json(
        { error: "userId, type, and title required" },
        { status: 400 },
      );
    }

    const [notification] = await sql`
      INSERT INTO notifications (user_id, actor_id, type, title, body, entity_type, entity_id, data)
      VALUES (${userId}, ${actorId || null}, ${type}, ${title}, ${body || null}, ${entityType || null}, ${entityId || null}, ${data ? JSON.stringify(data) : null})
      RETURNING *
    `;

    return Response.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Create notification error:", error);
    return Response.json(
      { error: "Failed to create notification" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const { userId, notificationId, markAllRead } = await request.json();

    if (!userId)
      return Response.json({ error: "userId required" }, { status: 400 });

    if (markAllRead) {
      await sql`UPDATE notifications SET is_read = true WHERE user_id = ${userId} AND is_read = false`;
    } else if (notificationId) {
      await sql`UPDATE notifications SET is_read = true WHERE id = ${notificationId} AND user_id = ${userId}`;
    }

    return Response.json({ updated: true });
  } catch (error) {
    console.error("Update notification error:", error);
    return Response.json(
      { error: "Failed to update notification" },
      { status: 500 },
    );
  }
}
