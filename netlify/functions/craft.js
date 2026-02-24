const fetch = require('node-fetch');

exports.handler = async (event) => {
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
      })
    });

    const data = await response.json();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: data.choices[0].message.content
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Fail" }) };
  }
};
