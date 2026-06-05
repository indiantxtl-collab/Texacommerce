import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return Response.json({ error: "Missing orderId" }, { status: 400 });
    }

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    const order = await sql`
      SELECT 
        o.*,
        s.name as store_name,
        s.logo_url as store_logo
      FROM orders o
      JOIN stores s ON o.store_id = s.id
      WHERE o.id = ${orderId} AND o.user_id = ${userId}
      LIMIT 1
    `;

    if (!order || order.length === 0) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const items = await sql`
      SELECT * FROM order_items WHERE order_id = ${orderId}
    `;

    // Generate timeline
    const timeline = [
      {
        status: "pending",
        label: "Order Placed",
        completed: true,
        timestamp: order[0].created_at,
      },
      {
        status: "processing",
        label: "Processing",
        completed: ["processing", "shipped", "delivered"].includes(
          order[0].status,
        ),
      },
      {
        status: "shipped",
        label: "Shipped",
        completed: ["shipped", "delivered"].includes(order[0].status),
      },
      {
        status: "delivered",
        label: "Delivered",
        completed: order[0].status === "delivered",
      },
    ];

    return Response.json({
      order: order[0],
      items,
      timeline,
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    return Response.json({ error: "Failed to track order" }, { status: 500 });
  }
}
