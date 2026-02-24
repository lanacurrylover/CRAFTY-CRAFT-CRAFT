const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { item1, item2 } = JSON.parse(event.body);
  
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are an alchemy engine. Combine two items into ONE new logical item. Use emojis. Respond ONLY with JSON: {\"n\": \"Name\", \"e\": \"Emoji\"}" },
          { role: "user", content: `Combine ${item1} + ${item2}` }
        ],
        response_format: { type: "json_object" }
      }),
      timeout: 10000 // 10 second limit
    });

    const data = await response.json();
    
    // Safety check: ensure the AI actually gave us JSON
    const result = typeof data.choices[0].message.content === 'string' 
      ? JSON.parse(data.choices[0].message.content) 
      : data.choices[0].message.content;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    };
  } catch (err) {
    console.error("AI Error:", err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ n: "Strange Goo", e: "🫠", error: "AI took too long" }) 
    };
  }
};
