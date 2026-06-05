import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const comments = await sql`
      SELECT rc.*, u.username, u.full_name, u.profile_picture
      FROM reel_comments rc
      JOIN users u ON rc.user_id = u.id
      WHERE rc.reel_id = ${id}
      ORDER BY rc.created_at ASC
    `;
    return Response.json({ comments });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { userId, comment } = await request.json();
    if (!userId || !comment)
      return Response.json(
        { error: "userId and comment required" },
        { status: 400 },
      );

    const [newComment] = await sql`
      INSERT INTO reel_comments (reel_id, user_id, comment) VALUES (${id}, ${userId}, ${comment})
      RETURNING *
    `;

    // Fetch with user info
    const [commentWithUser] = await sql`
      SELECT rc.*, u.username, u.full_name, u.profile_picture
      FROM reel_comments rc
      JOIN users u ON rc.user_id = u.id
      WHERE rc.id = ${newComment.id}
    `;

    return Response.json({ comment: commentWithUser });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
