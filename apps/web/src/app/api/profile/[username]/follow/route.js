import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const { username } = params;
    const body = await request.json();
    const { currentUserId } = body;

    if (!currentUserId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const [targetUser] =
      await sql`SELECT id, full_name FROM users WHERE username = ${username.toLowerCase()} LIMIT 1`;
    if (!targetUser)
      return Response.json({ error: "User not found" }, { status: 404 });

    const targetUserId = targetUser.id;
    if (parseInt(currentUserId) === targetUserId)
      return Response.json(
        { error: "Cannot follow yourself" },
        { status: 400 },
      );

    const [existing] =
      await sql`SELECT id FROM followers WHERE follower_id = ${currentUserId} AND following_id = ${targetUserId}`;
    if (existing)
      return Response.json({ error: "Already following" }, { status: 409 });

    await sql`INSERT INTO followers (follower_id, following_id) VALUES (${currentUserId}, ${targetUserId})`;

    // Create follow notification
    const [follower] =
      await sql`SELECT full_name, username FROM users WHERE id = ${currentUserId}`;
    await sql`
      INSERT INTO notifications (user_id, actor_id, type, title, body, entity_type, entity_id)
      VALUES (${targetUserId}, ${currentUserId}, 'follow', 'New Follower', ${follower ? `${follower.full_name} started following you` : "Someone started following you"}, 'user', ${currentUserId})
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Follow error:", error);
    return Response.json({ error: "Failed to follow user" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { username } = params;
    const body = await request.json();
    const { currentUserId } = body;
    if (!currentUserId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const [targetUser] =
      await sql`SELECT id FROM users WHERE username = ${username.toLowerCase()} LIMIT 1`;
    if (!targetUser)
      return Response.json({ error: "User not found" }, { status: 404 });
    await sql`DELETE FROM followers WHERE follower_id = ${currentUserId} AND following_id = ${targetUser.id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Unfollow error:", error);
    return Response.json({ error: "Failed to unfollow user" }, { status: 500 });
  }
}
