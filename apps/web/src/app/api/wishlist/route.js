import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return Response.json({ items: [] });

    const items = await sql`
      SELECT w.*, p.name, p.price, p.thumbnail_url, p.rating, s.name as store_name
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      JOIN stores s ON p.store_id = s.id
      WHERE w.user_id = ${userId}
      ORDER BY w.created_at DESC
    `;
    return Response.json({ items });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, productId } = await request.json();
    const [item] = await sql`
      INSERT INTO wishlists (user_id, product_id) VALUES (${userId}, ${productId})
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING *
    `;
    return Response.json({ item, added: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { userId, productId } = await request.json();
    await sql`DELETE FROM wishlists WHERE user_id = ${userId} AND product_id = ${productId}`;
    return Response.json({ deleted: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
