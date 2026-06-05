import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    // Get reel analytics
    const reels = await sql`
      SELECT 
        r.id,
        r.caption,
        r.views,
        r.created_at,
        r.thumbnail_url,
        (SELECT COUNT(*) FROM reel_likes WHERE reel_id = r.id) as likes,
        (SELECT COUNT(*) FROM reel_comments WHERE reel_id = r.id) as comments,
        (SELECT COUNT(*) FROM notifications WHERE entity_type = 'reel_save' AND entity_id = r.id) as saves
      FROM reels r
      WHERE r.user_id = ${userId}
      ORDER BY r.created_at DESC
      LIMIT 50
    `;

    // Calculate totals
    const totals = reels.reduce(
      (acc, reel) => ({
        views: acc.views + reel.views,
        likes: acc.likes + parseInt(reel.likes),
        comments: acc.comments + parseInt(reel.comments),
        saves: acc.saves + parseInt(reel.saves),
      }),
      { views: 0, likes: 0, comments: 0, saves: 0 },
    );

    // Get followers count
    const followers = await sql`
      SELECT COUNT(*) as count FROM followers WHERE following_id = ${userId}
    `;

    // Get engagement rate (likes + comments) / views
    const engagementRate =
      totals.views > 0
        ? (((totals.likes + totals.comments) / totals.views) * 100).toFixed(2)
        : 0;

    return Response.json({
      reels,
      totals,
      followerCount: parseInt(followers[0]?.count || 0),
      engagementRate: parseFloat(engagementRate),
      averageViews:
        reels.length > 0 ? Math.round(totals.views / reels.length) : 0,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return Response.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
