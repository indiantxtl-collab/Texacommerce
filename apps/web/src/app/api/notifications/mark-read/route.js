import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, markAll } = await request.json();

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    if (markAll) {
      await sql`
        UPDATE notifications
        SET is_read = true
        WHERE user_id = ${userId} AND is_read = false
      `;
    } else if (notificationId) {
      await sql`
        UPDATE notifications
        SET is_read = true
        WHERE id = ${notificationId} AND user_id = ${userId}
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return Response.json(
      { error: "Failed to mark notification as read" },
      { status: 500 },
    );
  }
}
