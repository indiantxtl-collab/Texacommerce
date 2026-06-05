import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return Response.json({ users: [], stores: [], products: [] });
    }

    const q = query.trim();

    const [users, stores, products] = await sql.transaction([
      sql`
        SELECT u.id, u.username, u.full_name, u.profile_picture, u.verified, u.bio,
          (SELECT COUNT(*) FROM followers WHERE following_id = u.id) as followers_count
        FROM users u
        WHERE LOWER(u.username) LIKE LOWER(${"%" + q + "%"}) OR LOWER(u.full_name) LIKE LOWER(${"%" + q + "%"})
        ORDER BY followers_count DESC LIMIT 15
      `,
      sql`
        SELECT s.id, s.name, s.description, s.category, s.logo_url, s.rating, u.username
        FROM stores s JOIN users u ON s.user_id = u.id
        WHERE s.is_active = true AND (LOWER(s.name) LIKE LOWER(${"%" + q + "%"}) OR LOWER(s.category) LIKE LOWER(${"%" + q + "%"}))
        ORDER BY s.total_sales DESC LIMIT 10
      `,
      sql`
        SELECT p.id, p.name, p.price, p.thumbnail_url, p.rating, s.name as store_name
        FROM products p JOIN stores s ON p.store_id = s.id
        WHERE p.is_active = true AND LOWER(p.name) LIKE LOWER(${"%" + q + "%"})
        ORDER BY p.sold_count DESC LIMIT 10
      `,
    ]);

    return Response.json({ users, stores, products });
  } catch (error) {
    console.error("Search error:", error);
    return Response.json({ error: "Failed to search" }, { status: 500 });
  }
}
