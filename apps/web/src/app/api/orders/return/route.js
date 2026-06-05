import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, reason, details } = await request.json();

    if (!orderId || !reason) {
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

    // Verify order belongs to user
    const order = await sql`
      SELECT * FROM orders WHERE id = ${orderId} AND user_id = ${userId} LIMIT 1
    `;

    if (!order || order.length === 0) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    // Store return request in order notes
    await sql`
      UPDATE orders
      SET notes = ${`Return requested: ${reason}. Details: ${details || "None"}`},
          status = 'return_requested'
      WHERE id = ${orderId}
    `;

    // Notify store owner
    await sql`
      INSERT INTO notifications (user_id, actor_id, type, title, body, entity_type, entity_id, created_at)
      VALUES (
        (SELECT user_id FROM stores WHERE id = ${order[0].store_id}),
        ${userId},
        'return',
        'Return Request',
        ${`Customer requested return for order #${orderId}: ${reason}`},
        'order',
        ${orderId},
        NOW()
      )
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error submitting return request:", error);
    return Response.json(
      { error: "Failed to submit return request" },
      { status: 500 },
    );
  }
}
