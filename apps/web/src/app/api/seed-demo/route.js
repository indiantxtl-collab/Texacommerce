/**
 * POST /api/auth/seed-demo
 *
 * Creates the Texa demo account if it does not already exist.
 * Safe to call multiple times — idempotent.
 *
 * Demo credentials:
 *   Name     : Texa
 *   Username : texacommerce
 *   Email    : maurya.pvt.ltd.tm@gmail.com
 *   Password : check123456
 */
import sql from "@/app/api/utils/sql";
import { hash } from "argon2";

export async function POST() {
  try {
    const DEMO_EMAIL = "maurya.pvt.ltd.tm@gmail.com";
    const DEMO_USERNAME = "texacommerce";
    const DEMO_FULL_NAME = "Texa";
    const DEMO_PASSWORD = "check123456";
    const DEMO_DOB = "2000-01-01";

    // Check if demo user already exists
    const [existing] = await sql`
      SELECT id, email, username, verified FROM users
      WHERE LOWER(email) = LOWER(${DEMO_EMAIL})
      LIMIT 1
    `;

    if (existing) {
      // Ensure verified flag is set
      if (!existing.verified) {
        await sql`UPDATE users SET verified = true WHERE id = ${existing.id}`;
      }
      // Ensure settings exist
      await sql`
        INSERT INTO user_settings (user_id)
        VALUES (${existing.id})
        ON CONFLICT (user_id) DO NOTHING
      `;
      return Response.json({
        created: false,
        message: "Demo user already exists",
        userId: existing.id,
        verified: true,
      });
    }

    // Hash the password
    const hashedPassword = await hash(DEMO_PASSWORD, {
      timeCost: 3,
      memoryCost: 65536,
    });

    // Create main user record
    const [user] = await sql`
      INSERT INTO users (
        email, password, username, full_name,
        date_of_birth, coins, xp, level,
        verified, is_active, last_login,
        bio
      )
      VALUES (
        ${DEMO_EMAIL}, ${hashedPassword}, ${DEMO_USERNAME}, ${DEMO_FULL_NAME},
        ${DEMO_DOB}, 10000, 5000, 10,
        true, true, NOW(),
        ${"Official Texa account. Social. Commerce. Voice. Reels."}
      )
      RETURNING id, email, username, full_name, verified
    `;

    // Create default settings
    await sql`
      INSERT INTO user_settings (user_id)
      VALUES (${user.id})
      ON CONFLICT (user_id) DO NOTHING
    `;

    // Create / sync auth_users for platform session compatibility
    let authUserId = null;
    const [existingAuthUser] = await sql`
      SELECT id FROM auth_users WHERE email = ${DEMO_EMAIL} LIMIT 1
    `;

    if (!existingAuthUser) {
      const [authUser] = await sql`
        INSERT INTO auth_users (name, email)
        VALUES (${DEMO_FULL_NAME}, ${DEMO_EMAIL})
        RETURNING id
      `;
      authUserId = authUser.id;
    } else {
      authUserId = existingAuthUser.id;
    }

    // Link credentials in auth_accounts
    await sql`
      INSERT INTO auth_accounts (
        "userId", type, provider, "providerAccountId", password
      )
      VALUES (
        ${authUserId}, 'credentials', 'credentials-signup',
        ${DEMO_EMAIL}, ${hashedPassword}
      )
      ON CONFLICT DO NOTHING
    `;

    return Response.json({
      created: true,
      message: "Demo user created successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error("Seed demo error:", error);
    return Response.json(
      { error: "Failed to seed demo user", detail: error.message },
      { status: 500 },
    );
  }
}

// Allow GET for easy browser testing
export async function GET() {
  return POST();
}
