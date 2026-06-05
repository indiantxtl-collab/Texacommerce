import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const { storeId } = params;
    const session = await auth();
    const userId = session?.user?.id;

    const [store] = await sql`
      SELECT s.*, u.username, u.full_name, u.profile_picture,
        (SELECT COUNT(*) FROM products p WHERE p.store_id = s.id AND p.is_active = true) as product_count,
        (SELECT COUNT(*) FROM store_followers sf WHERE sf.store_id = s.id) as follower_count,
        (SELECT COUNT(*) FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE p.store_id = s.id) as order_count
      FROM stores s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ${storeId}
    `;

    if (!store)
      return Response.json({ error: "Store not found" }, { status: 404 });

    const products = await sql`
      SELECT p.*,
        (SELECT json_agg(pi.image_url ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id) as images
      FROM products p WHERE p.store_id = ${storeId} AND p.is_active = true
      ORDER BY p.sold_count DESC, p.created_at DESC LIMIT 30
    `;

    let isFollowing = false;
    if (userId) {
      const [follow] =
        await sql`SELECT id FROM store_followers WHERE store_id = ${storeId} AND user_id = ${userId}`;
      isFollowing = !!follow;
    }

    return Response.json({ store: { ...store, isFollowing }, products });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch store" }, { status: 500 });
  }
}
