import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { hostId, name, coverImage } = body;

    if (!hostId || !name) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO voice_rooms (host_id, name, cover_image)
      VALUES (${hostId}, ${name}, ${coverImage || null})
      RETURNING *
    `;

    // Add host as first participant
    await sql`
      INSERT INTO room_participants (room_id, user_id, seat_number, is_admin)
      VALUES (${result[0].id}, ${hostId}, 1, TRUE)
    `;

    return Response.json({ room: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Create room error:", error);
    return Response.json({ error: "Failed to create room" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rooms = await sql`
      SELECT 
        vr.*,
        u.username as host_username, u.full_name as host_name, u.profile_picture as host_picture,
        (SELECT COUNT(*) FROM room_participants WHERE room_id = vr.id) as participants_count
      FROM voice_rooms vr
      INNER JOIN users u ON vr.host_id = u.id
      WHERE vr.is_closed = FALSE
      ORDER BY vr.created_at DESC
      LIMIT 50
    `;

    return Response.json({ rooms });
  } catch (error) {
    console.error("Get rooms error:", error);
    return Response.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}
