import sql from "@/app/api/utils/sql";
import { verify } from "argon2";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user
    const [user] = await sql`
      SELECT id, email, username, full_name, password, is_active, coins, xp, level, verified, profile_picture
      FROM users
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;

    if (!user) {
      return Response.json(
        { error: "No account found with this email address" },
        { status: 401 },
      );
    }

    if (!user.is_active) {
      return Response.json(
        { error: "Your account has been deactivated. Please contact support." },
        { status: 403 },
      );
    }

    // Verify password
    const isValid = await verify(user.password, password);
    if (!isValid) {
      return Response.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Update last login
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;

    // Record login activity
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "Unknown";
    await sql`
      INSERT INTO login_activity (user_id, device, ip_address, user_agent, is_current)
      VALUES (${user.id}, ${"Mobile App"}, ${ip}, ${userAgent.substring(0, 200)}, true)
    `;

    // Update auth_users record if needed for session
    try {
      const [authUser] =
        await sql`SELECT id FROM auth_users WHERE email = ${email.toLowerCase()} LIMIT 1`;
      if (!authUser) {
        const [newAuthUser] = await sql`
          INSERT INTO auth_users (name, email) VALUES (${user.full_name}, ${email.toLowerCase()}) RETURNING id
        `;
        await sql`
          INSERT INTO auth_accounts ("userId", type, provider, "providerAccountId", password)
          VALUES (${newAuthUser.id}, 'credentials', 'credentials-signup', ${email.toLowerCase()}, ${user.password})
          ON CONFLICT DO NOTHING
        `;
      } else {
        // Update password in auth_accounts to stay in sync
        await sql`
          UPDATE auth_accounts SET password = ${user.password}
          WHERE "userId" = ${authUser.id} AND provider = 'credentials-signup'
        `;
      }
    } catch (authErr) {
      console.error("Auth sync error:", authErr);
    }

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        coins: user.coins,
        level: user.level,
        verified: user.verified,
        profile_picture: user.profile_picture,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}
