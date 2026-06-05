import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, reaction } = body;

    if (!userId || !reaction) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await sql`
      INSERT INTO story_reactions (story_id, user_id, reaction)
      VALUES (${parseInt(id)}, ${userId}, ${reaction})
      ON CONFLICT (story_id, user_id) DO UPDATE SET reaction = ${reaction}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Story reaction error:", error);
    return Response.json({ error: "Failed to add reaction" }, { status: 500 });
  }
}
