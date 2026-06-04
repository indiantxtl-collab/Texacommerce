import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const { username } = params;
    const session = await auth();
    const viewerEmail = session?.user?.email;

    // Get viewer ID if logged in
    let viewerId = null;
    if (viewerEmail) {
      const [viewer] =
        await sql`SELECT id FROM users WHERE email = ${viewerEmail}`;
      viewerId = viewer?.id;
    }

    // Support numeric ID or username
    const isId = !isNaN(parseInt(username));
    let users;
    if (isId) {
      users = await sql`
        SELECT u.id, u.username, u.full_name, u.bio, u.date_of_birth, u.profile_picture,
          u.coins, u.xp, u.level, u.verified, u.created_at,
          (SELECT COUNT(*) FROM followers WHERE following_id = u.id) as followers_count,
          (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) as following_count
        FROM users u WHERE u.id = ${parseInt(username)} LIMIT 1
      `;
    } else {
      users = await sql`
        SELECT u.id, u.username, u.full_name, u.bio, u.date_of_birth, u.profile_picture,
          u.coins, u.xp, u.level, u.verified, u.created_at,
          (SELECT COUNT(*) FROM followers WHERE following_id = u.id) as followers_count,
          (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) as following_count
        FROM users u WHERE u.username = ${username.toLowerCase()} LIMIT 1
      `;
    }

    if (users.length === 0)
      return Response.json({ error: "User not found" }, { status: 404 });

    const user = users[0];

    // Auto-verify at 1000 followers
    if (!user.verified && user.followers_count >= 1000) {
      await sql`UPDATE users SET verified = TRUE WHERE id = ${user.id}`;
      user.verified = true;
    }

    let isFollowing = false;
    if (viewerId && viewerId !== user.id) {
      const [follow] =
        await sql`SELECT id FROM followers WHERE follower_id = ${viewerId} AND following_id = ${user.id}`;
      isFollowing = !!follow;
    }

    return Response.json({ user: { ...user, isFollowing } });
  } catch (error) {
    console.error("Get profile error:", error);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
