import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const rooms = await sql`
      SELECT 
        vr.*,
        u.username as host_username, u.full_name as host_name, u.profile_picture as host_picture
      FROM voice_rooms vr
      INNER JOIN users u ON vr.host_id = u.id
      WHERE vr.id = ${parseInt(id)}
      LIMIT 1
    `;

    if (rooms.length === 0) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    const participants = await sql`
      SELECT 
        rp.*, 
        u.username, u.full_name, u.profile_picture, u.verified
      FROM room_participants rp
      INNER JOIN users u ON rp.user_id = u.id
      WHERE rp.room_id = ${parseInt(id)}
      ORDER BY rp.seat_number ASC
    `;

    return Response.json({ room: rooms[0], participants });
  } catch (error) {
    console.error("Get room error:", error);
    return Response.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}
