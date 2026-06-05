import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return Response.json({ users: [] });

    const users = await sql`
      SELECT bu.id, u.id as user_id, u.username, u.full_name, u.profile_picture
      FROM blocked_users bu
      JOIN users u ON bu.blocked_id = u.id
      WHERE bu.blocker_id = ${userId}
      ORDER BY bu.created_at DESC
    `;

    return Response.json({ users });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { blockerId, blockedId } = await request.json();
    await sql`
      INSERT INTO blocked_users (blocker_id, blocked_id) VALUES (${blockerId}, ${blockedId})
      ON CONFLICT (blocker_id, blocked_id) DO NOTHING
    `;
    return Response.json({ blocked: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { blockerId, blockedId } = await request.json();
    await sql`DELETE FROM blocked_users WHERE blocker_id = ${blockerId} AND blocked_id = ${blockedId}`;
    return Response.json({ unblocked: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
