import { GoogleGenAI, Type } from "@google/genai";
import { AIAdviceResponse, TaskModule } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-3-flash-preview"; // 升级模型以获得更好的拆解建议

const moduleNames: Record<TaskModule, string> = {
  chinese: '语文 (Chinese Reading/Writing)',
  math: '数学 (Math Logic/Practice)',
  english: '英语 (English Vocabulary/Listening)',
  sports: '体育 (PE/Exercise)',
  general: '通用 (Daily Habits)'
};

export const breakDownTask = async (bigTask: string, module: TaskModule): Promise<AIAdviceResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `我有一个 8 岁的孩子，我需要将“${moduleNames[module]}”模块下的任务“${bigTask}”拆解为 3-4 个具体、细小且具有成就感的子任务。
      
      拆解原则：
      1. 难度分阶：从简单到进阶（例如：从读准到理解，最后到背诵）。
      2. 奖励引导：每个子任务分值在 1-5 分之间。
      3. 鼓励语：提供一句针对家长的建议，如何陪伴孩子完成。
      
      请以 JSON 格式返回。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advice: { type: Type.STRING, description: "给家长的鼓励和陪伴建议" },
            suggestedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "具体的子任务名称" },
                  points: { type: Type.INTEGER, description: "对应的星星积分 (1-5)" },
                },
                required: ["title", "points"]
              }
            }
          },
          required: ["advice", "suggestedTasks"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAdviceResponse;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini breakdown error:", error);
    return { advice: "没关系，我们可以手动设定一些小目标来开始。", suggestedTasks: [] };
  }
};

export const getParentingAdvice = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: query,
      config: {
        systemInstruction: "你是一位温和、专业的儿童心理专家。你正在协助一位家长管理 8 岁孩子的积分奖励系统。该系统包含语文、数学、英语、体育等模块。你的建议应简洁、实用且充满鼓励。如果家长问到积分设置，5分兑换小礼品是非常合适的起点。",
      }
    });
    return response.text || "我正在思考更好的建议，请稍后再问我。";
  } catch (error) {
    console.error("Gemini advice error:", error);
    return "连接育儿教练时出了一点小状况，稍后再聊吧。";
  }
};
