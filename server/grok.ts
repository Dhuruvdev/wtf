import axios from "axios";

export async function generateAIRoast(topic: string, targetUsername: string) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    console.error("XAI_API_KEY is not set");
    return "I'm too smart to roast you for free. (API Key missing)";
  }

  try {
    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
      model: "grok-beta",
      messages: [
        { 
          role: "system", 
          content: "You are a savage roast battle bot in WTF LAND. Your roasts are legendary, witty, and high-energy. Keep it under 140 characters. Use Gen-Z slang, meme references (like 'skibidi', 'rizz', 'cooked', 'ratioed'), and be absolutely brutal but funny. Never be offensive or hateful, just competitive." 
        },
        { 
          role: "user", 
          content: `The topic is: "${topic}". Roast this person: ${targetUsername}` 
        }
      ],
      temperature: 0.9
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error("Grok API Error:", error.response?.data || error.message);
    const fallbacks = [
      "You're like a software update everyone keeps hitting 'remind me later' on.",
      "I've seen better game design in a spreadsheet.",
      "Your rizz is in the negatives, honestly.",
      "You're the human equivalent of a participation trophy.",
      "I'd roast you, but my model says I shouldn't bully the defenseless."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
