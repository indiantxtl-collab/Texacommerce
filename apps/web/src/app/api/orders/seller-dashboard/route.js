import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    // Get user's store
    const store = await sql`
      SELECT * FROM stores WHERE user_id = ${userId} LIMIT 1
    `;

    if (!store || store.length === 0) {
      return Response.json({ error: "Store not found" }, { status: 404 });
    }

    const storeId = store[0].id;

    // Get orders
    const orders = await sql`
      SELECT 
        o.*,
        u.username as buyer_username,
        u.profile_picture as buyer_picture
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.store_id = ${storeId}
      ORDER BY o.created_at DESC
      LIMIT 50
    `;

    // Get revenue stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders
      FROM orders
      WHERE store_id = ${storeId}
    `;

    // Get products
    const products = await sql`
      SELECT * FROM products WHERE store_id = ${storeId} ORDER BY created_at DESC
    `;

    return Response.json({
      store: store[0],
      orders,
      stats: stats[0],
      products,
    });
  } catch (error) {
    console.error("Error fetching seller dashboard:", error);
    return Response.json(
      { error: "Failed to fetch seller dashboard" },
      { status: 500 },
    );
  }
}
