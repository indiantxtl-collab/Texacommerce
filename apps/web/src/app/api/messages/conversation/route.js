import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const otherUserId = searchParams.get("otherUserId");

    if (!userId || !otherUserId) {
      return Response.json({ messages: [], otherUser: null });
    }

    const messages = await sql`
      SELECT m.*, 
        s.username as sender_username, s.full_name as sender_name, s.profile_picture as sender_picture,
        r.username as receiver_username
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE (m.sender_id = ${parseInt(userId)} AND m.receiver_id = ${parseInt(otherUserId)})
         OR (m.sender_id = ${parseInt(otherUserId)} AND m.receiver_id = ${parseInt(userId)})
      ORDER BY m.created_at ASC
      LIMIT 100
    `;

    const [otherUser] = await sql`
      SELECT id, username, full_name, profile_picture, verified, bio
      FROM users WHERE id = ${parseInt(otherUserId)}
    `;

    // Mark as seen
    await sql`
      UPDATE messages SET read = true, seen_at = NOW()
      WHERE sender_id = ${parseInt(otherUserId)} AND receiver_id = ${parseInt(userId)} AND read = false
    `;

    // Check if other user is typing
    let otherTyping = false;
    try {
      const [typingStatus] = await sql`
        SELECT is_typing FROM typing_indicators
        WHERE sender_id = ${parseInt(otherUserId)} AND receiver_id = ${parseInt(userId)}
          AND updated_at > NOW() - INTERVAL '5 seconds'
      `;
      otherTyping = typingStatus?.is_typing || false;
    } catch {}

    return Response.json({ messages, otherUser, otherTyping });
  } catch (error) {
    console.error("Get conversation error:", error);
    return Response.json(
      { error: "Failed to fetch conversation" },
      { status: 500 },
    );
  }
}
