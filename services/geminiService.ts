/**
 * ⚠️ 紧急修复模式：模拟 AI 服务
 * 已移除 Google SDK 依赖，确保 Vercel 构建成功且不白屏。
 */

// 1. 模拟聊天回复 (Coach 功能)
export const sendMessageToGemini = async (message: string) => {
  console.log("【模拟模式】接收到消息:", message);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `🎉 恭喜！应用已修复！
  
目前 AI 处于【模拟模式】，断开了与 Google 的连接以防止报错。
核心功能（任务、奖励）现在都可以正常使用了！`;
};

// 2. 模拟任务拆解 (TaskList 功能) - 刚才缺的就是这个！
export const breakDownTask = async (taskTitle: string) => {
  console.log("【模拟模式】拆解任务:", taskTitle);
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 返回一些固定的假步骤，骗过调用者，防止报错
  return [
    `准备：开始"${taskTitle}"的第一步`,
    `执行：专注完成任务内容`,
    `检查：确认做得怎么样了`,
    `完成：给自己一个大大的赞！`
  ];
};
