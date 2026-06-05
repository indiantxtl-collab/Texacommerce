import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: roomId } = params;
    const { targetUserId } = await request.json();

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    // Only host can promote
    const room = await sql`
      SELECT host_id FROM voice_rooms WHERE id = ${roomId} LIMIT 1
    `;

    if (!room || room.length === 0) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    if (room[0].host_id !== userId) {
      return Response.json(
        { error: "Only host can promote participants" },
        { status: 403 },
      );
    }

    // Promote to admin
    await sql`
      UPDATE room_participants
      SET is_admin = true
      WHERE room_id = ${roomId} AND user_id = ${targetUserId}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error promoting participant:", error);
    return Response.json(
      { error: "Failed to promote participant" },
      { status: 500 },
    );
  }
}
