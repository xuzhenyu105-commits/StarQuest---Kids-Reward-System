/**
 * ⚠️ 紧急修复模式：模拟 AI 服务
 * 原来的 Google AI 代码已被移除，防止因为没有 API Key 导致白屏。
 */

// 注意：这里绝对不能有 import { ... } from "@google/generative-ai";
// 只要那行代码存在，它就会尝试加载 SDK 并可能报错。

export const sendMessageToGemini = async (message: string) => {
  console.log("【模拟模式】接收到消息:", message);
  
  // 1. 假装思考 1 秒钟
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 2. 返回一个固定的回复，确保不会报错
  return `🎉 恭喜！你的应用已经成功复活了！
  
目前 AI 处于【模拟模式】（为了防止白屏，暂时断开了与 Google 的连接）。
  
你可以放心地去使用“做任务”和“兑礼品”功能了！它们都能完美工作！`;
};
