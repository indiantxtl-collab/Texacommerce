import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const session = await auth();
    const userId = session?.user?.id;

    const [product] = await sql`
      SELECT p.*, s.name as store_name, s.logo_url as store_logo, s.id as store_id,
        u.username as seller_username, u.full_name as seller_name,
        (SELECT json_agg(pi.image_url ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id) as images,
        (SELECT COUNT(*) FROM product_reviews pr WHERE pr.product_id = p.id) as review_count,
        (SELECT AVG(pr.rating) FROM product_reviews pr WHERE pr.product_id = p.id) as avg_rating
      FROM products p
      JOIN stores s ON p.store_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE p.id = ${id}
    `;

    if (!product)
      return Response.json({ error: "Product not found" }, { status: 404 });

    const reviews = await sql`
      SELECT pr.*, u.username, u.full_name, u.profile_picture
      FROM product_reviews pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.product_id = ${id}
      ORDER BY pr.created_at DESC
      LIMIT 10
    `;

    let inWishlist = false;
    let inCart = false;
    if (userId) {
      const [wl] =
        await sql`SELECT id FROM wishlists WHERE user_id = ${userId} AND product_id = ${id}`;
      inWishlist = !!wl;
      const [cart] =
        await sql`SELECT id, quantity FROM cart_items WHERE user_id = ${userId} AND product_id = ${id}`;
      inCart = !!cart;
    }

    return Response.json({
      product: { ...product, reviews, inWishlist, inCart },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
