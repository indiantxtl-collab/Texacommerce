import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const storeId = searchParams.get("storeId");
    if (!userId && !storeId) return Response.json({ orders: [] });

    let orders;
    if (userId) {
      orders = await sql`
        SELECT o.*, s.name as store_name, s.logo_url as store_logo,
          (SELECT json_agg(json_build_object('name', oi.product_name, 'qty', oi.quantity, 'price', oi.unit_price, 'image', oi.product_image))
           FROM order_items oi WHERE oi.order_id = o.id) as items
        FROM orders o
        JOIN stores s ON o.store_id = s.id
        WHERE o.user_id = ${userId}
        ORDER BY o.created_at DESC
      `;
    } else {
      orders = await sql`
        SELECT o.*, u.username, u.full_name, u.profile_picture,
          (SELECT json_agg(json_build_object('name', oi.product_name, 'qty', oi.quantity, 'price', oi.unit_price, 'image', oi.product_image))
           FROM order_items oi WHERE oi.order_id = o.id) as items
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.store_id = ${storeId}
        ORDER BY o.created_at DESC
      `;
    }

    return Response.json({ orders });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      storeId,
      items,
      shippingName,
      shippingPhone,
      shippingAddress,
      paymentMethod,
      notes,
    } = body;

    if (!userId || !storeId || !items?.length) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );

    const [order] = await sql`
      INSERT INTO orders (user_id, store_id, total_amount, status, payment_method, shipping_name, shipping_phone, shipping_address, notes)
      VALUES (${userId}, ${storeId}, ${totalAmount.toFixed(2)}, 'pending', ${paymentMethod || "cod"}, ${shippingName}, ${shippingPhone || null}, ${shippingAddress}, ${notes || null})
      RETURNING *
    `;

    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, total_price)
        VALUES (${order.id}, ${item.productId || null}, ${item.name}, ${item.image || null}, ${item.quantity}, ${item.unit_price}, ${(item.unit_price * item.quantity).toFixed(2)})
      `;
      if (item.productId) {
        await sql`UPDATE products SET sold_count = sold_count + ${item.quantity}, stock_qty = GREATEST(stock_qty - ${item.quantity}, 0) WHERE id = ${item.productId}`;
      }
    }

    // Clear cart
    for (const item of items) {
      if (item.productId) {
        await sql`DELETE FROM cart_items WHERE user_id = ${userId} AND product_id = ${item.productId}`;
      }
    }

    return Response.json({ order });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
