import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const { productId, userId, storeId, rating, reviewText } =
      await request.json();
    if (!productId || !userId || !rating) {
      return Response.json(
        { error: "productId, userId, and rating required" },
        { status: 400 },
      );
    }

    const [review] = await sql`
      INSERT INTO product_reviews (product_id, user_id, store_id, rating, review_text)
      VALUES (${productId}, ${userId}, ${storeId || null}, ${rating}, ${reviewText || null})
      ON CONFLICT (product_id, user_id) DO UPDATE SET rating = ${rating}, review_text = ${reviewText || null}
      RETURNING *
    `;

    // Update product rating
    await sql`
      UPDATE products SET 
        rating = (SELECT AVG(rating) FROM product_reviews WHERE product_id = ${productId}),
        review_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = ${productId})
      WHERE id = ${productId}
    `;

    return Response.json({ review });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
