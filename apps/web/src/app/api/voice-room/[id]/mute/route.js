import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: roomId } = params;
    const { targetUserId, muted } = await request.json();

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    // Check if user is admin or host
    const room = await sql`
      SELECT host_id FROM voice_rooms WHERE id = ${roomId} LIMIT 1
    `;

    if (!room || room.length === 0) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    const participant = await sql`
      SELECT is_admin FROM room_participants 
      WHERE room_id = ${roomId} AND user_id = ${userId}
      LIMIT 1
    `;

    const isHost = room[0].host_id === userId;
    const isAdmin =
      participant && participant.length > 0 && participant[0].is_admin;

    if (!isHost && !isAdmin && targetUserId !== userId) {
      return Response.json(
        { error: "Only host/admin can mute others" },
        { status: 403 },
      );
    }

    // Mute/unmute
    await sql`
      UPDATE room_participants
      SET is_muted = ${muted}
      WHERE room_id = ${roomId} AND user_id = ${targetUserId}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error muting participant:", error);
    return Response.json(
      { error: "Failed to mute participant" },
      { status: 500 },
    );
  }
}
