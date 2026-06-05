import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoDescription, tone } = await request.json(); // tone: 'casual' | 'professional' | 'funny' | 'motivational'

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error:
            "OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.",
        },
        { status: 500 },
      );
    }

    const toneMap = {
      casual: "casual and friendly",
      professional: "professional and informative",
      funny: "humorous and engaging",
      motivational: "inspiring and uplifting",
    };

    const prompt = `Generate a compelling social media caption for a video about: ${videoDescription}. 
    Tone should be ${toneMap[tone] || "casual and friendly"}. 
    Include 3-5 relevant hashtags at the end. 
    Keep it under 150 characters.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a social media caption expert." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API request failed");
    }

    const data = await response.json();
    const caption = data.choices[0]?.message?.content || "Check this out! 🔥";

    return Response.json({ caption });
  } catch (error) {
    console.error("Error generating caption:", error);
    return Response.json(
      { error: "Failed to generate caption" },
      { status: 500 },
    );
  }
}
