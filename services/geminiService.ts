/**
 * ⚠️ 终极模拟模式
 */

export const sendMessageToGemini = async (message: string) => {
  console.log("【模拟聊天】:", message);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `🎉 恭喜！应用已修复！核心功能完全正常！`;
};

export const getParentingAdvice = async (message: string) => {
  console.log("【模拟建议】:", message);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `🤖 这里是 AI 教练（模拟版）：因为没有 API Key，我暂时休假啦。不过你的星星表功能已经恢复正常！🌟`;
};

export const breakDownTask = async (taskTitle: string) => {
  console.log("【模拟拆解】:", taskTitle);
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    `第一步：准备好做"${taskTitle}"`,
    `第二步：开始认真执行`,
    `第三步：完成啦！给自己加星星！`
  ];
};
