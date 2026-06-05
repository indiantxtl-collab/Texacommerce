import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      items, // [{ productId, quantity }]
      shippingName,
      shippingAddress,
      shippingPhone,
      paymentMethod,
    } = await request.json();

    if (!items || items.length === 0) {
      return Response.json({ error: "No items in cart" }, { status: 400 });
    }

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    // Get products and calculate total
    const productIds = items.map((item) => item.productId);
    const products = await sql`
      SELECT * FROM products WHERE id = ANY(${productIds})
    `;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      const itemTotal = parseFloat(product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.thumbnail_url,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
      });
    }

    // Group by store (assuming all items from same store for simplicity)
    const storeId = products[0]?.store_id;

    if (!storeId) {
      return Response.json({ error: "Invalid store" }, { status: 400 });
    }

    // Create order
    const orderResult = await sql`
      INSERT INTO orders (
        user_id, 
        store_id, 
        total_amount, 
        status, 
        payment_method, 
        shipping_name, 
        shipping_address, 
        shipping_phone,
        created_at
      )
      VALUES (
        ${userId},
        ${storeId},
        ${totalAmount},
        'pending',
        ${paymentMethod || "COD"},
        ${shippingName},
        ${shippingAddress},
        ${shippingPhone},
        NOW()
      )
      RETURNING id
    `;

    const orderId = orderResult[0].id;

    // Insert order items
    for (const item of orderItems) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, total_price)
        VALUES (${orderId}, ${item.product_id}, ${item.product_name}, ${item.product_image}, ${item.quantity}, ${item.unit_price}, ${item.total_price})
      `;

      // Update product stock
      await sql`
        UPDATE products
        SET stock_qty = stock_qty - ${item.quantity},
            sold_count = sold_count + ${item.quantity}
        WHERE id = ${item.product_id}
      `;
    }

    // Clear cart
    await sql`
      DELETE FROM cart_items WHERE user_id = ${userId}
    `;

    // Notify store owner
    await sql`
      INSERT INTO notifications (
        user_id, 
        actor_id, 
        type, 
        title, 
        body, 
        entity_type, 
        entity_id, 
        created_at
      )
      VALUES (
        (SELECT user_id FROM stores WHERE id = ${storeId}),
        ${userId},
        'order',
        'New Order',
        ${`You have a new order #${orderId}`},
        'order',
        ${orderId},
        NOW()
      )
    `;

    return Response.json({
      success: true,
      orderId,
      totalAmount,
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    return Response.json(
      { error: "Failed to process checkout" },
      { status: 500 },
    );
  }
}
