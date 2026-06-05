import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, count } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      // Fallback hashtags if no API key
      const fallbackTags = [
        "#viral",
        "#trending",
        "#fyp",
        "#foryou",
        "#explore",
        "#instagood",
        "#reels",
        "#video",
      ];
      return Response.json({
        hashtags: fallbackTags.slice(0, count || 5),
      });
    }

    const prompt = `Generate ${count || 5} trending hashtags for a social media post about: ${topic}. 
    Return only the hashtags separated by spaces, starting with #.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a social media hashtag expert." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 60,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API request failed");
    }

    const data = await response.json();
    const hashtagString =
      data.choices[0]?.message?.content || "#viral #trending #fyp";
    const hashtags = hashtagString
      .split(/\s+/)
      .filter((tag) => tag.startsWith("#"));

    return Response.json({ hashtags });
  } catch (error) {
    console.error("Error generating hashtags:", error);
    return Response.json(
      { error: "Failed to generate hashtags" },
      { status: 500 },
    );
  }
}
