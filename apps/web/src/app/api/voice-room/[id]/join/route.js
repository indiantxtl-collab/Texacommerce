import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, seatNumber } = body;

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    // Check if user is already in room
    const existing = await sql`
      SELECT id FROM room_participants 
      WHERE room_id = ${parseInt(id)} AND user_id = ${userId}
    `;

    if (existing.length > 0) {
      return Response.json({ error: "Already in room" }, { status: 409 });
    }

    await sql`
      INSERT INTO room_participants (room_id, user_id, seat_number)
      VALUES (${parseInt(id)}, ${userId}, ${seatNumber || null})
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Join room error:", error);
    return Response.json({ error: "Failed to join room" }, { status: 500 });
  }
}
