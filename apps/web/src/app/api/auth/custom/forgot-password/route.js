import sql from "@/app/api/utils/sql";
import { randomBytes } from "crypto";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email)
      return Response.json({ error: "Email required" }, { status: 400 });

    // Find user
    const [user] =
      await sql`SELECT id, email, full_name FROM users WHERE LOWER(email) = LOWER(${email}) AND is_active = true LIMIT 1`;

    // Always return success to prevent email enumeration
    if (!user) {
      return Response.json({
        message:
          "If an account exists with this email, you will receive a reset link.",
      });
    }

    // Generate reset token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Invalidate old tokens
    await sql`UPDATE password_reset_tokens SET used = true WHERE user_id = ${user.id} AND used = false`;

    // Create new token
    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `;

    // In production, send an email with the reset link
    // For now, just log the token (the email would be sent via Resend or similar)
    console.log(`Password reset token for ${email}: ${token}`);
    console.log(
      `Reset URL: ${process.env.NEXT_PUBLIC_CREATE_APP_URL}/account/reset-password?token=${token}`,
    );

    return Response.json({
      message:
        "If an account exists with this email, you will receive a reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
