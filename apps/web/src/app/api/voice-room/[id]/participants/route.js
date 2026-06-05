import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const { id: roomId } = params;

    const participants = await sql`
      SELECT 
        rp.id,
        rp.user_id,
        rp.seat_number,
        rp.is_muted,
        rp.is_admin,
        rp.hand_raised,
        rp.joined_at,
        u.username,
        u.full_name,
        u.profile_picture,
        u.verified
      FROM room_participants rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.room_id = ${roomId}
      ORDER BY rp.seat_number ASC, rp.joined_at ASC
    `;

    return Response.json({ participants });
  } catch (error) {
    console.error("Error fetching participants:", error);
    return Response.json(
      { error: "Failed to fetch participants" },
      { status: 500 },
    );
  }
}
