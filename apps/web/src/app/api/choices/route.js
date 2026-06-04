import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const choices = await sql`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM choice_votes WHERE choice_id = c.id AND selected_option = c.option_a) as votes_a,
        (SELECT COUNT(*) FROM choice_votes WHERE choice_id = c.id AND selected_option = c.option_b) as votes_b,
        (SELECT SUM(coins_invested) FROM choice_votes WHERE choice_id = c.id AND selected_option = c.option_a) as coins_a,
        (SELECT SUM(coins_invested) FROM choice_votes WHERE choice_id = c.id AND selected_option = c.option_b) as coins_b
      FROM choices c
      WHERE c.end_time > NOW()
      ORDER BY c.created_at ASC
      LIMIT 10
    `;

    // Get user's votes if userId provided
    let userVotes = [];
    if (userId) {
      userVotes = await sql`
        SELECT choice_id, selected_option, coins_invested
        FROM choice_votes
        WHERE user_id = ${parseInt(userId)}
      `;
    }

    return Response.json({ choices, userVotes });
  } catch (error) {
    console.error("Get choices error:", error);
    return Response.json({ error: "Failed to fetch choices" }, { status: 500 });
  }
}
