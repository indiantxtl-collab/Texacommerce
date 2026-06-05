import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, status, trackingNumber } = await request.json();

    if (!orderId || !status) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    // Verify user owns the store
    const order = await sql`
      SELECT o.*, s.user_id as store_owner_id
      FROM orders o
      JOIN stores s ON o.store_id = s.id
      WHERE o.id = ${orderId}
      LIMIT 1
    `;

    if (!order || order.length === 0) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    if (order[0].store_owner_id !== userId) {
      return Response.json(
        { error: "Unauthorized to update this order" },
        { status: 403 },
      );
    }

    // Update order
    await sql`
      UPDATE orders
      SET status = ${status},
          tracking_number = ${trackingNumber || null},
          updated_at = NOW()
      WHERE id = ${orderId}
    `;

    // Notify buyer
    await sql`
      INSERT INTO notifications (user_id, type, title, body, entity_type, entity_id, created_at)
      VALUES (${order[0].user_id}, 'order', 'Order Update', ${`Your order is now ${status}`}, 'order', ${orderId}, NOW())
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating order status:", error);
    return Response.json(
      { error: "Failed to update order status" },
      { status: 500 },
    );
  }
}
