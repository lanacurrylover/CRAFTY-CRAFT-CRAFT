const { Groq } = require("groq-sdk");

exports.handler = async (event) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const { item1, item2 } = JSON.parse(event.body);

    // NEW LOGIC: Context-Aware Prompting
    const systemPrompt = `You are a Logical Alchemy Engine. 
    Your task: Combine "${item1}" and "${item2}".
    
    Logic Rules:
    1. If the items are basic (Earth, Fire, Water, Air), the result must be a foundational element (e.g., Lava, Mud, Steam, Dust).
    2. Be literal: Heat + Metal = Liquid Metal. Plant + Time = Tree.
    3. If the user sends "Random" + "Goal", suggest a target word that can be reached in 4-6 combinations.
    4. Respond ONLY with this JSON format: {"n": "Name", "e": "Emoji"}.
    5. Avoid abstract or nonsensical results.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Combine ${item1} + ${item2}` }
      ],
      model: "llama3-8b-8192", 
      temperature: 0.2, // Lower temperature = more logical, less "random"
      response_format: { type: "json_object" },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: chatCompletion.choices[0].message.content,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ n: "Strange Goo", e: "🫠" }),
    };
  }
};
