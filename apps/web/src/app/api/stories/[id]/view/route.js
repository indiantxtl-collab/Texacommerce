import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    // Insert view (ignores duplicates due to unique constraint)
    await sql`
      INSERT INTO story_views (story_id, user_id)
      VALUES (${parseInt(id)}, ${userId})
      ON CONFLICT (story_id, user_id) DO NOTHING
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Story view error:", error);
    return Response.json({ error: "Failed to record view" }, { status: 500 });
  }
}
