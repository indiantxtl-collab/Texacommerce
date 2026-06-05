import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    // Support both naming conventions
    const userId = body.userId || body.user_id;
    const mediaUrl = body.mediaUrl || body.media_url;
    const mediaType = body.mediaType || body.media_type;
    const caption = body.caption;
    const musicUrl = body.musicUrl || body.music_url;

    if (!userId || !mediaUrl || !mediaType) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const [story] = await sql`
      INSERT INTO stories (user_id, media_url, media_type, caption, music_url, expires_at)
      VALUES (${userId}, ${mediaUrl}, ${mediaType}, ${caption || null}, ${musicUrl || null}, ${expiresAt.toISOString()})
      RETURNING *
    `;

    await sql`INSERT INTO xp_transactions (user_id, amount, reason) VALUES (${userId}, 5, 'Posted a story')`;
    await sql`UPDATE users SET xp = xp + 5 WHERE id = ${userId}`;

    return Response.json({ story }, { status: 201 });
  } catch (error) {
    console.error("Create story error:", error);
    return Response.json({ error: "Failed to create story" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const specificUserId = searchParams.get("userId");

    let stories;
    if (userId) {
      // Get stories for feed (following + own)
      stories = await sql`
        SELECT DISTINCT
          s.*,
          u.username, u.full_name, u.profile_picture, u.verified,
          json_build_object('username', u.username, 'full_name', u.full_name, 'profile_picture', u.profile_picture, 'verified', u.verified) as user,
          (SELECT COUNT(*) FROM story_views WHERE story_id = s.id) as views_count
        FROM stories s
        INNER JOIN users u ON s.user_id = u.id
        LEFT JOIN followers f ON (f.following_id = s.user_id AND f.follower_id = ${parseInt(userId)})
        WHERE s.expires_at > NOW()
          AND (s.user_id = ${parseInt(userId)} OR f.id IS NOT NULL)
        ORDER BY s.created_at DESC
      `;
    } else {
      // Public feed - all recent stories
      stories = await sql`
        SELECT DISTINCT ON (s.user_id)
          s.*,
          u.username, u.full_name, u.profile_picture, u.verified,
          json_build_object('id', u.id, 'username', u.username, 'full_name', u.full_name, 'profile_picture', u.profile_picture, 'verified', u.verified) as user,
          (SELECT COUNT(*) FROM story_views WHERE story_id = s.id) as views_count
        FROM stories s
        INNER JOIN users u ON s.user_id = u.id
        WHERE s.expires_at > NOW()
        ORDER BY s.user_id, s.created_at DESC
        LIMIT 30
      `;
    }

    return Response.json({ stories });
  } catch (error) {
    console.error("Get stories error:", error);
    return Response.json({ error: "Failed to fetch stories" }, { status: 500 });
  }
}
