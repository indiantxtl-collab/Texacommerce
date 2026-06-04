import sql from "@/app/api/utils/sql";
import { hash } from "argon2";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      username,
      fullName,
      bio,
      dateOfBirth,
      phone,
      profilePicture,
    } = body;

    // Validate required fields
    if (!email || !password || !username || !fullName || !dateOfBirth) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if email or username already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} OR username = ${username.toLowerCase()}
    `;

    if (existing.length > 0) {
      return Response.json(
        { error: "Email or username already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hash(password);

    // Create user
    const result = await sql`
      INSERT INTO users (
        email, password, username, full_name, bio, date_of_birth, phone, profile_picture, coins, xp, level, verified
      ) VALUES (
        ${email}, ${hashedPassword}, ${username.toLowerCase()}, ${fullName}, ${bio || null}, ${dateOfBirth}, ${phone || null}, ${profilePicture || null}, 300, 0, 1, ${username.toLowerCase() === "kashyap"}
      )
      RETURNING id, username, full_name, email, coins, xp, level, verified
    `;

    return Response.json({ user: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
