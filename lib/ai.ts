import { GoogleGenAI } from "@google/genai";

export async function generateAIResponse(
  prompt: string, 
  modelName: string, 
  apiKey: string
) {
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
