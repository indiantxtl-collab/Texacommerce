import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: roomId } = params;
    const { receiverId, giftId } = await request.json();

    const userProfile = await sql`
      SELECT id, coins FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile[0].id;
    const userCoins = userProfile[0].coins;

    // Get gift cost
    const gift = await sql`
      SELECT coin_cost FROM gifts WHERE id = ${giftId} LIMIT 1
    `;

    if (!gift || gift.length === 0) {
      return Response.json({ error: "Gift not found" }, { status: 404 });
    }

    const cost = gift[0].coin_cost;

    if (userCoins < cost) {
      return Response.json({ error: "Insufficient coins" }, { status: 400 });
    }

    // Deduct coins from sender
    await sql`
      UPDATE users SET coins = coins - ${cost} WHERE id = ${userId}
    `;

    // Add coins to receiver (50% conversion rate)
    const receiverAmount = Math.floor(cost * 0.5);
    await sql`
      UPDATE users SET coins = coins + ${receiverAmount} WHERE id = ${receiverId}
    `;

    // Record gift history
    await sql`
      INSERT INTO gift_history (room_id, sender_id, receiver_id, gift_id, created_at)
      VALUES (${roomId}, ${userId}, ${receiverId}, ${giftId}, NOW())
    `;

    // Create notification
    await sql`
      INSERT INTO notifications (user_id, actor_id, type, title, body, entity_type, entity_id, created_at)
      VALUES (${receiverId}, ${userId}, 'gift', 'Received a gift', 'sent you a gift in voice room', 'voice_room', ${roomId}, NOW())
    `;

    return Response.json({ success: true, remainingCoins: userCoins - cost });
  } catch (error) {
    console.error("Error sending gift:", error);
    return Response.json({ error: "Failed to send gift" }, { status: 500 });
  }
}
