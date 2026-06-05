import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import {
  decryptMessage,
  generateConversationKey,
} from "@/app/api/utils/encryption";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("otherUserId");

    if (!otherUserId) {
      return Response.json({ error: "Missing otherUserId" }, { status: 400 });
    }

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    // Get messages
    const messages = await sql`
      SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.message,
        m.image_url,
        m.read,
        m.created_at,
        u.username as sender_username,
        u.profile_picture as sender_picture
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ${userId} AND m.receiver_id = ${otherUserId})
         OR (m.sender_id = ${otherUserId} AND m.receiver_id = ${userId})
      ORDER BY m.created_at ASC
    `;

    // Generate decryption key
    const key = generateConversationKey(userId, parseInt(otherUserId));

    // Decrypt messages
    const decryptedMessages = messages.map((msg) => ({
      ...msg,
      message: msg.message ? decryptMessage(msg.message, key) : null,
    }));

    return Response.json({ messages: decryptedMessages });
  } catch (error) {
    console.error("Error fetching encrypted messages:", error);
    return Response.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}
