import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

function calculateTier(xp) {
  if (xp < 1000) return { tier: "Bronze", level: 1, color: "#CD7F32" };
  if (xp < 5000) return { tier: "Silver", level: 2, color: "#C0C0C0" };
  if (xp < 15000) return { tier: "Gold", level: 3, color: "#FFD700" };
  if (xp < 50000) return { tier: "Diamond", level: 4, color: "#B9F2FF" };
  return { tier: "Legend", level: 5, color: "#FF6B6B" };
}

function getBenefits(tier) {
  const benefits = {
    Bronze: [
      "Basic profile badge",
      "Access to public rooms",
      "Standard support",
    ],
    Silver: [
      "Silver profile badge",
      "Priority in voice rooms",
      "Early access to features",
      "Custom profile theme",
    ],
    Gold: [
      "Gold profile badge",
      "VIP voice room access",
      "Exclusive filters",
      "Priority support",
      "Verified checkmark",
    ],
    Diamond: [
      "Diamond profile badge",
      "Host unlimited rooms",
      "Custom stickers",
      "Ad-free experience",
      "Revenue share 10%",
    ],
    Legend: [
      "Legend animated badge",
      "All premium features",
      "Personal account manager",
      "Revenue share 25%",
      "Exclusive events access",
    ],
  };
  return benefits[tier] || [];
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await sql`
      SELECT id, xp, level, coins FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userProfile || userProfile.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = userProfile[0];
    const tierInfo = calculateTier(user.xp);
    const benefits = getBenefits(tierInfo.tier);

    // Get XP history
    const xpHistory = await sql`
      SELECT amount, reason, created_at
      FROM xp_transactions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return Response.json({
      xp: user.xp,
      coins: user.coins,
      tier: tierInfo.tier,
      tierLevel: tierInfo.level,
      tierColor: tierInfo.color,
      benefits,
      xpHistory,
      nextTier:
        tierInfo.level < 5
          ? ["Silver", "Gold", "Diamond", "Legend"][tierInfo.level]
          : null,
      xpToNextTier:
        tierInfo.level < 5
          ? [1000, 5000, 15000, 50000][tierInfo.level] - user.xp
          : 0,
    });
  } catch (error) {
    console.error("Error fetching prestige card:", error);
    return Response.json(
      { error: "Failed to fetch prestige card" },
      { status: 500 },
    );
  }
}
