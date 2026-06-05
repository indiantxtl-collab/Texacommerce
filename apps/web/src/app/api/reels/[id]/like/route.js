import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId } = body;

    if (!userId)
      return Response.json({ error: "User ID required" }, { status: 400 });

    // Get reel info
    const [reel] =
      await sql`SELECT user_id FROM reels WHERE id = ${parseInt(id)}`;

    const [existing] =
      await sql`SELECT id FROM reel_likes WHERE reel_id = ${parseInt(id)} AND user_id = ${userId}`;

    if (!existing) {
      await sql`INSERT INTO reel_likes (reel_id, user_id) VALUES (${parseInt(id)}, ${userId}) ON CONFLICT (reel_id, user_id) DO NOTHING`;

      // Create notification if liking someone else's reel
      if (reel && reel.user_id !== parseInt(userId)) {
        const [liker] =
          await sql`SELECT full_name, username FROM users WHERE id = ${userId}`;
        await sql`
          INSERT INTO notifications (user_id, actor_id, type, title, body, entity_type, entity_id)
          VALUES (${reel.user_id}, ${userId}, 'like', 'New Like', ${liker ? `${liker.full_name} liked your reel` : "Someone liked your reel"}, 'reel', ${parseInt(id)})
        `;
      }
    } else {
      await sql`DELETE FROM reel_likes WHERE reel_id = ${parseInt(id)} AND user_id = ${userId}`;
    }

    const [{ count }] =
      await sql`SELECT COUNT(*)::int as count FROM reel_likes WHERE reel_id = ${parseInt(id)}`;
    const userLiked = !existing;

    return Response.json({
      success: true,
      liked: userLiked,
      likes_count: count,
    });
  } catch (error) {
    console.error("Like reel error:", error);
    return Response.json({ error: "Failed to like reel" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId } = body;
    if (!userId)
      return Response.json({ error: "User ID required" }, { status: 400 });
    await sql`DELETE FROM reel_likes WHERE reel_id = ${parseInt(id)} AND user_id = ${userId}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Unlike reel error:", error);
    return Response.json({ error: "Failed to unlike reel" }, { status: 500 });
  }
}
