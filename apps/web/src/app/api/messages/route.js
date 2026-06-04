import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const sender_id = body.sender_id || body.senderId;
    const receiver_id = body.receiver_id || body.receiverId;
    const message = body.message;
    const image_url = body.image_url || body.imageUrl;

    if (!sender_id || !receiver_id || (!message && !image_url)) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const [msg] = await sql`
      INSERT INTO messages (sender_id, receiver_id, message, image_url, delivered_at)
      VALUES (${sender_id}, ${receiver_id}, ${message || null}, ${image_url || null}, NOW())
      RETURNING *
    `;

    // Create message notification for receiver
    try {
      const [sender] =
        await sql`SELECT full_name, username FROM users WHERE id = ${sender_id}`;
      if (sender) {
        await sql`
          INSERT INTO notifications (user_id, actor_id, type, title, body, entity_type, entity_id)
          VALUES (${receiver_id}, ${sender_id}, 'message', 'New Message', ${`${sender.full_name} sent you a message`}, 'user', ${sender_id})
        `;
      }
    } catch {}

    return Response.json({ message: msg }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return Response.json({ conversations: [] });

    const conversations = await sql`
      WITH ranked_messages AS (
        SELECT *,
          CASE WHEN sender_id = ${parseInt(userId)} THEN receiver_id ELSE sender_id END as other_user_id,
          ROW_NUMBER() OVER (
            PARTITION BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
            ORDER BY created_at DESC
          ) as rn
        FROM messages
        WHERE sender_id = ${parseInt(userId)} OR receiver_id = ${parseInt(userId)}
      )
      SELECT 
        rm.other_user_id as user_id,
        u.username, u.full_name, u.profile_picture, u.verified,
        rm.message as last_message, rm.image_url,
        rm.created_at as last_message_time,
        rm.read as is_read,
        (SELECT COUNT(*) FROM messages m2 WHERE m2.sender_id = rm.other_user_id AND m2.receiver_id = ${parseInt(userId)} AND m2.read = false) as unread_count
      FROM ranked_messages rm
      JOIN users u ON u.id = rm.other_user_id
      WHERE rm.rn = 1
      ORDER BY rm.created_at DESC
    `;

    const formatted = conversations.map((c) => ({
      user_id: c.user_id,
      username: c.username,
      full_name: c.full_name,
      profile_picture: c.profile_picture,
      verified: c.verified,
      last_message: c.last_message || (c.image_url ? "Image" : ""),
      last_message_time: c.last_message_time,
      unread_count: parseInt(c.unread_count || 0),
      is_read: c.is_read,
    }));

    return Response.json({ conversations: formatted });
  } catch (error) {
    console.error("Get conversations error:", error);
    return Response.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}
