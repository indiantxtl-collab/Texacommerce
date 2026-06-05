import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId)
      return Response.json({ error: "userId required" }, { status: 400 });

    // Get or create settings
    let [settings] =
      await sql`SELECT * FROM user_settings WHERE user_id = ${userId}`;

    if (!settings) {
      [settings] = await sql`
        INSERT INTO user_settings (user_id) VALUES (${userId})
        ON CONFLICT (user_id) DO NOTHING
        RETURNING *
      `;
      if (!settings) {
        [settings] =
          await sql`SELECT * FROM user_settings WHERE user_id = ${userId}`;
      }
    }

    return Response.json({ settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return Response.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId)
      return Response.json({ error: "userId required" }, { status: 400 });

    // Build dynamic update
    const validFields = [
      "account_private",
      "profile_visibility",
      "follow_requests_manual",
      "message_permissions",
      "show_online_status",
      "show_read_receipts",
      "push_notifications",
      "email_notifications",
      "like_notifications",
      "comment_notifications",
      "follow_notifications",
      "mention_notifications",
      "message_notifications",
      "order_notifications",
      "story_notifications",
      "marketing_emails",
      "autoplay_videos",
      "mute_reels_by_default",
      "story_settings",
      "feed_preferences",
      "theme",
      "language",
      "two_factor_enabled",
      "login_alerts",
      "data_saver_mode",
      "auto_download_wifi",
      "auto_download_cellular",
    ];

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([k]) => validFields.includes(k)),
    );

    if (Object.keys(filteredUpdates).length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Upsert
    await sql`
      INSERT INTO user_settings (user_id, updated_at)
      VALUES (${userId}, NOW())
      ON CONFLICT (user_id) DO NOTHING
    `;

    const setClauses = Object.keys(filteredUpdates)
      .map((k, i) => `${k} = $${i + 2}`)
      .join(", ");
    const values = [userId, ...Object.values(filteredUpdates)];
    const updateQuery = `UPDATE user_settings SET ${setClauses}, updated_at = NOW() WHERE user_id = $1`;
    await sql(updateQuery, values);

    const [settings] =
      await sql`SELECT * FROM user_settings WHERE user_id = ${userId}`;
    return Response.json({ settings, updated: true });
  } catch (error) {
    console.error("Update settings error:", error);
    return Response.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
