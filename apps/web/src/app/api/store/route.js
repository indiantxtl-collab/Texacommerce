import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = `
      SELECT p.*, s.name as store_name, s.logo_url as store_logo,
        (SELECT json_agg(pi.image_url ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id) as images
      FROM products p
      JOIN stores s ON p.store_id = s.id
      WHERE p.is_active = true AND s.is_active = true
    `;
    const values = [];
    let idx = 1;

    if (storeId) {
      query += ` AND p.store_id = $${idx++}`;
      values.push(storeId);
    }
    if (category) {
      query += ` AND p.category = $${idx++}`;
      values.push(category);
    }
    if (search) {
      query += ` AND (LOWER(p.name) LIKE LOWER($${idx++}) OR LOWER(p.description) LIKE LOWER($${idx++}))`;
      values.push(`%${search}%`);
      values.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const products = await sql(query, values);
    return Response.json({ products, total: products.length });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      store_id,
      name,
      description,
      price,
      original_price,
      category,
      stock_qty,
      thumbnail_url,
      images,
    } = body;

    if (!store_id || !name || !price) {
      return Response.json(
        { error: "store_id, name, and price are required" },
        { status: 400 },
      );
    }

    const [product] = await sql`
      INSERT INTO products (store_id, name, description, price, original_price, category, stock_qty, thumbnail_url)
      VALUES (${store_id}, ${name}, ${description || null}, ${price}, ${original_price || null}, ${category || null}, ${stock_qty || 0}, ${thumbnail_url || null})
      RETURNING *
    `;

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await sql`INSERT INTO product_images (product_id, image_url, sort_order) VALUES (${product.id}, ${images[i]}, ${i})`;
      }
    }

    return Response.json({ product });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
