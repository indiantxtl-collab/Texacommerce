import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const { storeId } = params;
    const { userId } = await request.json();
    if (!userId)
      return Response.json({ error: "userId required" }, { status: 400 });

    await sql`
      INSERT INTO store_followers (store_id, user_id) VALUES (${storeId}, ${userId})
      ON CONFLICT (store_id, user_id) DO NOTHING
    `;
    return Response.json({ following: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { storeId } = params;
    const { userId } = await request.json();
    await sql`DELETE FROM store_followers WHERE store_id = ${storeId} AND user_id = ${userId}`;
    return Response.json({ following: false });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
