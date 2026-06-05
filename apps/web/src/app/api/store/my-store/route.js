import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) return Response.json({ store: null });

    const [store] = await sql`
      SELECT s.*,
        (SELECT COUNT(*) FROM products p WHERE p.store_id = s.id AND p.is_active = true) as product_count,
        (SELECT COALESCE(SUM(oi.total_price), 0) FROM order_items oi JOIN orders o ON oi.order_id = o.id JOIN products p ON oi.product_id = p.id WHERE p.store_id = s.id AND o.payment_status = 'paid') as total_revenue
      FROM stores s
      WHERE s.user_id = ${userId}
    `;

    if (!store) return Response.json({ store: null });

    const products = await sql`
      SELECT p.*,
        (SELECT json_agg(pi.image_url ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id) as images
      FROM products p WHERE p.store_id = ${store.id} AND p.is_active = true
      ORDER BY p.created_at DESC LIMIT 20
    `;

    return Response.json({ store, products });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch store" }, { status: 500 });
  }
}
