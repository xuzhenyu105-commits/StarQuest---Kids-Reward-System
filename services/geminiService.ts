/**
 * ⚠️ 终极模拟模式：修复所有 Build Error
 * 包含了所有组件可能调用的函数名称，彻底解决报错。
 */

// 1. 模拟聊天 (对应 sendMessageToGemini)
export const sendMessageToGemini = async (message: string) => {
  console.log("【模拟聊天】:", message);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `🎉 恭喜！AI 模拟服务已连接。
  
目前处于【离线模式】，无需 API Key 即可运行。
核心功能（任务、奖励）完全正常！`;
};

// 2. 模拟育儿建议 (对应 Coach.tsx 里的 getParentingAdvice) - 就是缺了这个！
export const getParentingAdvice = async (message: string) => {
  console.log("【模拟建议】:", message);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `🤖 这里是 AI 教练（模拟版）：
  
我收到了你的问题：“${message}”
  
因为现在没有配置 Google API Key，我只能暂时这样回复你。
不过别担心，只要能看到这段话，说明你的 App 已经修好了！快去给孩子布置任务吧！🌟`;
};

// 3. 模拟任务拆解 (对应 TaskList.tsx 里的 breakDownTask)
export const breakDownTask = async (taskTitle: string) => {
  console.log("【模拟拆解】:", taskTitle);
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    `第一步：准备好做"${taskTitle}"的心情`,
    `第二步：开始认真执行`,
    `第三步：坚持到底`,
    `第四步：完成啦！给自己加星星！`
  ];
};
