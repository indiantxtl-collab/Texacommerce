import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authId = searchParams.get("authId");
    const email = searchParams.get("email");

    if (!authId && !email) {
      return Response.json(
        { error: "Auth ID or email required" },
        { status: 400 },
      );
    }

    let users;
    if (email) {
      users = await sql`
        SELECT * FROM users WHERE email = ${email} LIMIT 1
      `;
    } else {
      // For now, we'll match by email since auth_users.id is different from users.id
      // First get email from auth_users, then find in users table
      return Response.json({ user: null });
    }

    if (users.length === 0) {
      return Response.json({ user: null });
    }

    return Response.json({ user: users[0] });
  } catch (error) {
    console.error("Get user by auth ID error:", error);
    return Response.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
