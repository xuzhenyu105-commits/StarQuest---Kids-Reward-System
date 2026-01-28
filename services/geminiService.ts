import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. 安全获取 Key，如果没有 Key，就给一个空字符串，而不是让程序崩溃
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

let genAI = null;
let model = null;

// 2. 只有当真的有 Key 的时候，才尝试初始化 AI
if (API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
  } catch (e) {
    console.log("AI 初始化跳过");
  }
}

// 3. 导出一个安全的发送函数
export const sendMessageToGemini = async (message: string) => {
  // 如果没有初始化成功（比如没有 Key），直接返回一个提示，而不是报错
  if (!model) {
    console.warn("未检测到 API Key，AI 功能已禁用。");
    return "这里是 AI 教练！目前我还没有被激活（缺少 API Key）。不过没关系，你可以继续使用任务和奖励功能哦！💪";
  }

  try {
    const result = await model.generateContent(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI 响应出错:", error);
    return "AI 暂时有点累，请稍后再试。";
  }
};
