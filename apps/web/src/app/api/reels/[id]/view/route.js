import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const { id } = params;

    await sql`
      UPDATE reels SET views = views + 1 WHERE id = ${parseInt(id)}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Reel view error:", error);
    return Response.json({ error: "Failed to record view" }, { status: 500 });
  }
}
