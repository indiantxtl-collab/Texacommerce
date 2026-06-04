import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, selectedOption, coinsInvested } = body;

    if (!userId || !selectedOption) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const coinsToInvest = coinsInvested || 0;

    // Check if user has enough coins
    if (coinsToInvest > 0) {
      const userResult = await sql`
        SELECT coins FROM users WHERE id = ${userId}
      `;

      if (userResult.length === 0 || userResult[0].coins < coinsToInvest) {
        return Response.json({ error: "Insufficient coins" }, { status: 400 });
      }

      // Deduct coins
      await sql`
        UPDATE users SET coins = coins - ${coinsToInvest} WHERE id = ${userId}
      `;
    }

    // Record vote
    await sql`
      INSERT INTO choice_votes (choice_id, user_id, selected_option, coins_invested)
      VALUES (${parseInt(id)}, ${userId}, ${selectedOption}, ${coinsToInvest})
      ON CONFLICT (choice_id, user_id) DO UPDATE 
      SET selected_option = ${selectedOption}, coins_invested = choice_votes.coins_invested + ${coinsToInvest}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Vote error:", error);
    return Response.json({ error: "Failed to record vote" }, { status: 500 });
  }
}
