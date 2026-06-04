import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { senderId, receiverId, isTyping } = await request.json();
    if (!senderId || !receiverId)
      return Response.json(
        { error: "senderId and receiverId required" },
        { status: 400 },
      );

    await sql`
      INSERT INTO typing_indicators (sender_id, receiver_id, is_typing, updated_at)
      VALUES (${senderId}, ${receiverId}, ${isTyping}, NOW())
      ON CONFLICT (sender_id, receiver_id) DO UPDATE SET is_typing = ${isTyping}, updated_at = NOW()
    `;

    return Response.json({ updated: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
