import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import {
  encryptMessage,
  generateConversationKey,
} from "@/app/api/utils/encryption";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, message, imageUrl } = await request.json();

    const userProfile = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;

    // Generate encryption key for this conversation
    const key = generateConversationKey(userId, receiverId);

    // Encrypt message
    const encryptedMessage = message ? encryptMessage(message, key) : null;

    // Store encrypted message
    const result = await sql`
      INSERT INTO messages (sender_id, receiver_id, message, image_url, created_at)
      VALUES (${userId}, ${receiverId}, ${encryptedMessage}, ${imageUrl || null}, NOW())
      RETURNING id, created_at
    `;

    // Create notification
    await sql`
      INSERT INTO notifications (user_id, actor_id, type, title, body, entity_type, entity_id, created_at)
      VALUES (${receiverId}, ${userId}, 'message', 'New message', 'sent you a message', 'message', ${result[0].id}, NOW())
    `;

    return Response.json({
      success: true,
      messageId: result[0].id,
      createdAt: result[0].created_at,
    });
  } catch (error) {
    console.error("Error sending encrypted message:", error);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
