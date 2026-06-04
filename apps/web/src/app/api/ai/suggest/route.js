export async function POST(request) {
  try {
    const { type, context } = await request.json();

    let systemPrompt =
      "You are a creative social media AI assistant for Texa, a vibrant social commerce platform.";
    let userPrompt = "";

    if (type === "caption") {
      systemPrompt +=
        " Generate engaging, trendy captions for social media content.";
      userPrompt = `Generate 3 creative captions for a ${context?.mediaType || "post"} about: ${context?.description || "lifestyle content"}. Keep each under 150 characters. Include relevant emojis. Format as JSON array.`;
    } else if (type === "reel-idea") {
      systemPrompt += " Generate viral reel ideas for social media creators.";
      userPrompt = `Generate 5 trending reel ideas for the topic: ${context?.topic || "general lifestyle"}. Include hook, content, and trending sound suggestion. Format as JSON array with fields: title, hook, steps, soundtrack.`;
    } else if (type === "product-description") {
      systemPrompt +=
        " Generate compelling product descriptions for e-commerce.";
      userPrompt = `Write a compelling product description for: ${context?.productName}. Category: ${context?.category || "general"}. Price: ${context?.price || "N/A"}. Make it persuasive, include benefits, and end with a call-to-action. Keep under 200 words.`;
    } else if (type === "hashtags") {
      systemPrompt += " Generate relevant hashtags to maximize reach.";
      userPrompt = `Generate 15 trending and relevant hashtags for content about: ${context?.description}. Mix popular and niche tags. Format as JSON array of strings starting with #.`;
    } else {
      userPrompt = context?.message || "Help me create engaging content.";
    }

    const response = await fetch("/integrations/openai-o3/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) throw new Error("AI request failed");
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON if expected
    let result = content;
    if (["caption", "reel-idea", "hashtags"].includes(type)) {
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) result = JSON.parse(jsonMatch[0]);
      } catch {}
    }

    return Response.json({ result, raw: content });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "AI suggestion failed" }, { status: 500 });
  }
}
