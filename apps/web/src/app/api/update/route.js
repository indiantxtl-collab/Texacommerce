import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function PUT(request) {
  try {
    const { userId, full_name, username, bio, phone, profile_picture } =
      await request.json();

    if (!userId)
      return Response.json({ error: "userId required" }, { status: 400 });
    if (!full_name)
      return Response.json({ error: "Full name required" }, { status: 400 });

    // Check username uniqueness if changed
    if (username) {
      const [existing] = await sql`
        SELECT id FROM users WHERE username = ${username.toLowerCase()} AND id != ${userId}
      `;
      if (existing)
        return Response.json(
          { error: "Username already taken" },
          { status: 400 },
        );
    }

    const setClauses = ["full_name = $2"];
    const values = [userId, full_name.trim()];
    let idx = 3;

    if (username) {
      setClauses.push(`username = $${idx++}`);
      values.push(username.toLowerCase().trim());
    }
    if (bio !== undefined) {
      setClauses.push(`bio = $${idx++}`);
      values.push(bio || null);
    }
    if (phone !== undefined) {
      setClauses.push(`phone = $${idx++}`);
      values.push(phone || null);
    }
    if (profile_picture !== undefined) {
      setClauses.push(`profile_picture = $${idx++}`);
      values.push(profile_picture || null);
    }

    const query = `UPDATE users SET ${setClauses.join(", ")} WHERE id = $1 RETURNING id, username, full_name, bio, phone, profile_picture, verified, coins, xp, level`;
    const result = await sql(query, values);

    return Response.json({ user: result[0] });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
