import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Get user's profile to access user_id
    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    const userId = userProfile[0].id;

    // Get following list for priority boost
    const following = await sql`
      SELECT following_id FROM followers WHERE follower_id = ${userId}
    `;
    const followingIds = following.map((f) => f.following_id);

    // Smart feed algorithm:
    // 1. Following content gets 2x boost
    // 2. Recent content (last 7 days) gets priority
    // 3. Engagement score = (likes * 2) + (comments * 3) + (views * 0.1)
    // 4. Trending boost for high engagement in last 24h
    const reels = await sql`
      WITH engagement_scores AS (
        SELECT 
          r.id,
          r.user_id,
          r.video_url,
          r.caption,
          r.thumbnail_url,
          r.music_url,
          r.views,
          r.created_at,
          u.username,
          u.full_name,
          u.profile_picture,
          u.verified,
          (SELECT COUNT(*) FROM reel_likes WHERE reel_id = r.id) as like_count,
          (SELECT COUNT(*) FROM reel_comments WHERE reel_id = r.id) as comment_count,
          (SELECT COUNT(*) FROM reel_likes WHERE reel_id = r.id) * 2 + 
          (SELECT COUNT(*) FROM reel_comments WHERE reel_id = r.id) * 3 + 
          r.views * 0.1 as engagement_score,
          CASE WHEN r.user_id = ANY(${followingIds.length > 0 ? followingIds : [-1]}) THEN 2.0 ELSE 1.0 END as following_boost,
          CASE WHEN r.created_at > NOW() - INTERVAL '24 hours' THEN 1.5 ELSE 1.0 END as recency_boost,
          EXISTS(SELECT 1 FROM reel_likes WHERE reel_id = r.id AND user_id = ${userId}) as user_liked
        FROM reels r
        JOIN users u ON r.user_id = u.id
        WHERE r.created_at > NOW() - INTERVAL '30 days'
        ORDER BY (engagement_score * following_boost * recency_boost) DESC, r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      )
      SELECT * FROM engagement_scores
    `;

    return Response.json({
      reels,
      page,
      hasMore: reels.length === limit,
    });
  } catch (error) {
    console.error("Error fetching reel feed:", error);
    return Response.json(
      { error: "Failed to fetch reel feed" },
      { status: 500 },
    );
  }
}
