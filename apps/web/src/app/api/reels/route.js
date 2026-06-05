import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    // Support both naming conventions
    const userId = body.userId || body.user_id;
    const videoUrl = body.videoUrl || body.video_url;
    const caption = body.caption;
    const musicUrl = body.musicUrl || body.music_url;
    const thumbnailUrl = body.thumbnailUrl || body.thumbnail_url;

    if (!userId || !videoUrl) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const [reel] = await sql`
      INSERT INTO reels (user_id, video_url, caption, music_url, thumbnail_url)
      VALUES (${userId}, ${videoUrl}, ${caption || null}, ${musicUrl || null}, ${thumbnailUrl || null})
      RETURNING *
    `;

    await sql`INSERT INTO xp_transactions (user_id, amount, reason) VALUES (${userId}, 10, 'Posted a reel')`;
    await sql`UPDATE users SET xp = xp + 10 WHERE id = ${userId}`;

    return Response.json({ reel }, { status: 201 });
  } catch (error) {
    console.error("Create reel error:", error);
    return Response.json({ error: "Failed to create reel" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const reels = await sql`
      SELECT r.*, u.username, u.full_name, u.profile_picture, u.verified,
        (SELECT COUNT(*) FROM reel_likes WHERE reel_id = r.id) as likes_count,
        (SELECT COUNT(*) FROM reel_comments WHERE reel_id = r.id) as comments_count
      FROM reels r
      INNER JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 50
    `;
    return Response.json({ reels });
  } catch (error) {
    console.error("Get reels error:", error);
    return Response.json({ error: "Failed to fetch reels" }, { status: 500 });
  }
}
