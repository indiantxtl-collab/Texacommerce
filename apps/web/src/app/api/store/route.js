import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = `
      SELECT s.*, u.username, u.profile_picture,
        (SELECT COUNT(*) FROM products p WHERE p.store_id = s.id AND p.is_active = true) as product_count,
        (SELECT COUNT(*) FROM store_followers sf WHERE sf.store_id = s.id) as follower_count
      FROM stores s
      JOIN users u ON s.user_id = u.id
      WHERE s.is_active = true
    `;
    const values = [];
    let idx = 1;

    if (category) {
      query += ` AND s.category = $${idx++}`;
      values.push(category);
    }
    if (search) {
      query += ` AND (LOWER(s.name) LIKE LOWER($${idx++}) OR LOWER(s.description) LIKE LOWER($${idx++}))`;
      values.push(`%${search}%`);
      values.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY s.total_sales DESC, s.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const stores = await sql(query, values);
    return Response.json({ stores });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      userId,
      name,
      description,
      category,
      logo_url,
      banner_url,
      location,
      phone,
      website,
    } = body;

    if (!userId || !name)
      return Response.json(
        { error: "userId and name are required" },
        { status: 400 },
      );

    const existing = await sql`SELECT id FROM stores WHERE user_id = ${userId}`;
    if (existing.length > 0)
      return Response.json(
        { error: "You already have a store" },
        { status: 400 },
      );

    const [store] = await sql`
      INSERT INTO stores (user_id, name, description, category, logo_url, banner_url, location, phone, website)
      VALUES (${userId}, ${name}, ${description || null}, ${category || null}, ${logo_url || null}, ${banner_url || null}, ${location || null}, ${phone || null}, ${website || null})
      RETURNING *
    `;

    return Response.json({ store });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create store" }, { status: 500 });
  }
}
