import sql from "@/app/api/utils/sql";
import { hash } from "argon2";

export async function POST(request) {
  try {
    const body = await request.json();
    const { fullName, username, email, dateOfBirth, password } = body;

    // Validate required fields
    if (!fullName || !username || !email || !dateOfBirth || !password) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return Response.json(
        {
          error:
            "Username must be 3-30 characters and contain only letters, numbers and underscores",
        },
        { status: 400 },
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Validate date of birth (must be 13+)
    const dob = new Date(dateOfBirth);
    const age = (new Date() - dob) / (1000 * 60 * 60 * 24 * 365.25);
    if (isNaN(dob.getTime()) || age < 13) {
      return Response.json(
        { error: "You must be at least 13 years old to join" },
        { status: 400 },
      );
    }

    // Check uniqueness
    const existing = await sql`
      SELECT id, email, username FROM users 
      WHERE LOWER(email) = LOWER(${email}) OR LOWER(username) = LOWER(${username})
      LIMIT 1
    `;

    if (existing.length > 0) {
      const conflict = existing[0];
      if (conflict.email.toLowerCase() === email.toLowerCase()) {
        return Response.json(
          { error: "An account with this email already exists" },
          { status: 409 },
        );
      }
      return Response.json(
        { error: "This username is already taken" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hash(password, {
      timeCost: 3,
      memoryCost: 65536,
    });

    // Create user
    const [user] = await sql`
      INSERT INTO users (email, password, username, full_name, date_of_birth, coins, xp, level, verified, is_active, last_login)
      VALUES (
        ${email.toLowerCase()}, ${hashedPassword}, ${username.toLowerCase()},
        ${fullName}, ${dateOfBirth}, 300, 0, 1, false, true, NOW()
      )
      RETURNING id, email, username, full_name, coins, xp, level, verified, created_at
    `;

    // Create default settings for user
    await sql`
      INSERT INTO user_settings (user_id) VALUES (${user.id})
      ON CONFLICT (user_id) DO NOTHING
    `;

    // Also create auth_users record for session compatibility
    try {
      const authUserExists =
        await sql`SELECT id FROM auth_users WHERE email = ${email.toLowerCase()} LIMIT 1`;
      if (authUserExists.length === 0) {
        const [authUser] = await sql`
          INSERT INTO auth_users (name, email) VALUES (${fullName}, ${email.toLowerCase()}) RETURNING id
        `;
        // Link the account with credentials
        await sql`
          INSERT INTO auth_accounts ("userId", type, provider, "providerAccountId", password)
          VALUES (${authUser.id}, 'credentials', 'credentials-signup', ${email.toLowerCase()}, ${hashedPassword})
          ON CONFLICT DO NOTHING
        `;
      }
    } catch (authErr) {
      // Non-critical - user is created in users table
      console.error("Auth linking error:", authErr);
    }

    return Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          coins: user.coins,
          level: user.level,
        },
        message: "Account created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 },
    );
  }
}
