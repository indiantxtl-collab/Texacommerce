import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { username } = params;
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get("currentUserId");

    if (!currentUserId) {
      return Response.json({ isFollowing: false });
    }

    const targetUser = await sql`
      SELECT id FROM users WHERE username = ${username.toLowerCase()} LIMIT 1
    `;

    if (targetUser.length === 0) {
      return Response.json({ isFollowing: false });
    }

    const result = await sql`
      SELECT id FROM followers 
      WHERE follower_id = ${parseInt(currentUserId)} AND following_id = ${targetUser[0].id}
    `;

    return Response.json({ isFollowing: result.length > 0 });
  } catch (error) {
    console.error("Check following error:", error);
    return Response.json({ isFollowing: false });
  }
}
