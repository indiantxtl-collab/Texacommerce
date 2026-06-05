import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return Response.json({ activity: [] });

    const activity = await sql`
      SELECT * FROM login_activity WHERE user_id = ${userId}
      ORDER BY logged_in_at DESC LIMIT 20
    `;

    return Response.json({ activity });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
