exports.handler = async (event) => {
  try {
    const { item1, item2 } = JSON.parse(event.body);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { 
            role: "system", 
            content: "You are an Alchemy Game. Combine two items. Logic: Fire+Earth=Lava. Rocket+Mars=Elon Musk. Output ONLY valid JSON: {\"n\": \"Name\", \"e\": \"Emoji\"}. No prose." 
          },
          { role: "user", content: `Combine ${item1} + ${item2}` }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    
    // Safety check: If AI fails or returns empty, don't return Goo yet
    if (!data.choices || !data.choices[0].message.content) {
        throw new Error("AI Empty Response");
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: data.choices[0].message.content
    };

  } catch (error) {
    console.error("Craft Error:", error);
    return {
      statusCode: 200, // Return 200 so the app doesn't crash
      body: JSON.stringify({ n: "Dust", e: "☁️" }) // Default to Dust instead of Goo
    };
  }
};
