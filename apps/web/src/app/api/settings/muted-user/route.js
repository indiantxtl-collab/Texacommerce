import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return Response.json({ users: [] });

    const users = await sql`
      SELECT mu.id, u.id as user_id, u.username, u.full_name, u.profile_picture
      FROM muted_users mu
      JOIN users u ON mu.muted_id = u.id
      WHERE mu.muter_id = ${userId}
      ORDER BY mu.created_at DESC
    `;
    return Response.json({ users });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { muterId, mutedId } = await request.json();
    await sql`INSERT INTO muted_users (muter_id, muted_id) VALUES (${muterId}, ${mutedId}) ON CONFLICT (muter_id, muted_id) DO NOTHING`;
    return Response.json({ muted: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { muterId, mutedId } = await request.json();
    await sql`DELETE FROM muted_users WHERE muter_id = ${muterId} AND muted_id = ${mutedId}`;
    return Response.json({ unmuted: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
