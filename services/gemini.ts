import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
let genAI: GoogleGenAI | null = null;

if (apiKey) {
  genAI = new GoogleGenAI({ apiKey });
}

export const generateSystemMessage = async (
  batteryLevel: number,
  isCharging: boolean,
  context: 'connect' | 'disconnect' | 'alert' | 'status'
): Promise<string> => {
  if (!genAI) {
    return "AI Module Offline. Check API Key.";
  }

  const model = "gemini-2.5-flash";
  
  let prompt = `You are the AI interface of a futuristic sci-fi charging guardian named 'On Cheyyada'. 
  Current Battery Status: ${Math.round(batteryLevel * 100)}%.
  Charging State: ${isCharging ? 'CHARGING' : 'NOT CHARGING'}.
  Context Event: ${context}.
  
  Keep the response short (max 20 words). Use techno-babble, sci-fi terminology (fusion, quantum, capacitors, flux).
  
  If Context is 'alert' (User says it's plugged in, but it's not charging): Be aggressive, urgent, and sarcastic. Tell them to flip the switch. Use uppercase for emphasis.
  If Context is 'connect': Acknowledge power source.
  If Context is 'disconnect': Warn about power loss.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Communication relay disrupted.";
  }
};
