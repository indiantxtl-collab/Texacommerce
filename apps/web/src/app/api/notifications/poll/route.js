import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lastCheck = searchParams.get("lastCheck");

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    let notifications;

    if (lastCheck) {
      // Get new notifications since last check
      notifications = await sql`
        SELECT 
          n.*,
          u.username as actor_username,
          u.profile_picture as actor_picture
        FROM notifications n
        LEFT JOIN users u ON n.actor_id = u.id
        WHERE n.user_id = ${userId} 
        AND n.created_at > ${lastCheck}
        ORDER BY n.created_at DESC
      `;
    } else {
      // Get all unread notifications
      notifications = await sql`
        SELECT 
          n.*,
          u.username as actor_username,
          u.profile_picture as actor_picture
        FROM notifications n
        LEFT JOIN users u ON n.actor_id = u.id
        WHERE n.user_id = ${userId} 
        AND n.is_read = false
        ORDER BY n.created_at DESC
        LIMIT 50
      `;
    }

    const unreadCount = await sql`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ${userId} AND is_read = false
    `;

    return Response.json({
      notifications,
      unreadCount: parseInt(unreadCount[0]?.count || 0),
    });
  } catch (error) {
    console.error("Error polling notifications:", error);
    return Response.json(
      { error: "Failed to poll notifications" },
      { status: 500 },
    );
  }
}
