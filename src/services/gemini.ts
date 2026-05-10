import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function analyzeMotherMessage(message: string) {
  const prompt = `
    You are an expert in family communication, specifically East Asian mother-daughter relationships.
    Analyze the following message from a mother to her daughter.
    
    1. Identify the anxiety level (score 1-10).
    2. Suggest a "Gentle/Soft" version that keeps the love/care but removes the pressure/anxiety.
    3. Identify "Anxiety Words" (e.g., "又", "万一", "怎么办").
    4. Briefly explain why the daughter might feel pressured by the original message.

    Message: "${message}"

    Return JSON in this format:
    {
      "anxietyScore": number,
      "gentleVersion": "string",
      "anxietyWords": ["string"],
      "explanation": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    const text = response.text || "";
    // Simple JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      anxietyScore: 5,
      gentleVersion: message,
      anxietyWords: [],
      explanation: "AI analysis failed."
    };
  }
}

export async function summarizeForDaughter(messages: string[]) {
  const prompt = `
    Summarize these messages from a mother to her daughter into 3 concise points focused on her core needs and care.
    Messages: ${messages.join(' | ')}
    Keep it warm and non-pressuring.
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Core need: Care and safety.";
  } catch (error) {
    return "Core need: Care and safety.";
  }
}
export async function enhanceDaughterMessage(message: string, style: 'gentle' | 'humorous') {
  const prompt = `
    你是一个擅长处理东亚母女关系的专家。
    女儿想给妈妈发一段话，但担心表达得太生硬或者不知道怎么开口。
    
    请将以下信息转译为 ${style === 'gentle' ? '温柔且充满关心' : '海绵宝宝风格（幽默风趣且充满活力）'} 的版本。
    
    原话: "${message}"

    返回 JSON 格式:
    {
      "enhancedMessage": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response");
  } catch (error) {
    return { enhancedMessage: message };
  }
}
