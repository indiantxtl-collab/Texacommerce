import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return Response.json({ items: [] });

    const items = await sql`
      SELECT ci.*, p.name, p.price, p.thumbnail_url, p.stock_qty, s.name as store_name, s.id as store_id
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN stores s ON p.store_id = s.id
      WHERE ci.user_id = ${userId}
      ORDER BY ci.created_at DESC
    `;

    const total = items.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );
    return Response.json({
      items,
      total: total.toFixed(2),
      count: items.length,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, productId, quantity = 1 } = await request.json();
    if (!userId || !productId)
      return Response.json(
        { error: "userId and productId required" },
        { status: 400 },
      );

    const [existing] =
      await sql`SELECT * FROM cart_items WHERE user_id = ${userId} AND product_id = ${productId}`;
    let item;
    if (existing) {
      [item] =
        await sql`UPDATE cart_items SET quantity = quantity + ${quantity} WHERE id = ${existing.id} RETURNING *`;
    } else {
      [item] =
        await sql`INSERT INTO cart_items (user_id, product_id, quantity) VALUES (${userId}, ${productId}, ${quantity}) RETURNING *`;
    }
    return Response.json({ item, added: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { userId, productId, quantity } = await request.json();
    if (quantity <= 0) {
      await sql`DELETE FROM cart_items WHERE user_id = ${userId} AND product_id = ${productId}`;
    } else {
      await sql`UPDATE cart_items SET quantity = ${quantity} WHERE user_id = ${userId} AND product_id = ${productId}`;
    }
    return Response.json({ updated: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { userId, productId } = await request.json();
    await sql`DELETE FROM cart_items WHERE user_id = ${userId} AND product_id = ${productId}`;
    return Response.json({ deleted: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to remove from cart" },
      { status: 500 },
    );
  }
}
