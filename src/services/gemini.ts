import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function analyzeMessage(message: string, role: 'mother' | 'child' = 'mother', style: 'gentle' | 'humorous' = 'gentle') {
  const prompt = `
    你是一个擅长处理东亚母女关系的专家。
    一位【${role === 'mother' ? '母亲' : '女儿'}】给${role === 'mother' ? '女儿' : '母亲'}写了一段话。
    
    1. 识别这封信展示出的焦虑/压力指数 (score 1-10)。
    2. 提供一个【${style === 'gentle' ? '温柔/克制' : '海绵宝宝风格（幽默风趣且充满活力）'}】的版本，保留初衷但让内容更${style === 'gentle' ? '柔和' : '有趣'}。
    3. 识别出可能引起对方压力或反感的“焦虑关键词”。
    4. 简要解释为什么这封信可能会给对方压力。

    信息内容: "${message}"

    返回 JSON 格式:
    {
      "anxietyScore": number,
      "enhancedMessage": "string",
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
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      anxietyScore: 5,
      enhancedMessage: message,
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

export async function generateEncouragementCard(message: string, role: 'mother' | 'child') {
  const prompt = `
    你是一个温暖细腻的【情绪疗愈师】。
    
    背景：${role === 'mother' ? '一位妈妈' : '一位女儿'}刚刚在《懂懂·Wo men》应用中记录了一段话。
    ${role === 'mother' ? '这段话可能是对女儿的牵挂、教育、或者是一段无法直接开口的深爱。' : '这段话是她尝试跨越沟通鸿沟，给妈妈的一份关怀、理解或情绪回馈。'}
    
    原始信息内容: "${message}"

    任务：请为这位【发送者】生成一张极简的疗愈小卡片。
    
    要求：
    1. 【视角】：禁止以“女儿”或“妈妈”的第一人称说话。请以第三方疗愈者、或者“时间”的温柔语调。
    2. 【极致精简】：字数严格控制在 30-50 字以内。只说一句最能击中内心、最能让她感到“被看见”的话。
    3. 【语气】：留白、像诗、像微风。不讲道理，只传递温度。
    4. 【美学】：描述一种能给发送者带来平静的具体意向。

    返回 JSON 格式:
    {
      "feedback": "一句话文案",
      "atmosphere": "意向/氛围描述",
      "colorTheme": "hex代码"
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
    return { 
      feedback: role === 'mother' ? "记录下这些爱，也是在给自己一个拥抱。辛苦了，妈妈。" : "这一份小小的关心，会在妈妈心里开出花来。你做得很棒。",
      atmosphere: "晚霞",
      colorTheme: "#FAD0C4"
    };
  }
}
