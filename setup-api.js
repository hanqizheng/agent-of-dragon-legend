#!/usr/bin/env node
const fs = require("fs");
const readline = require("readline");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🐉 勇士传说 - AI Agent Demo API配置");
console.log("=====================================");
console.log("");
console.log("要启用真正的AI功能，请配置DeepSeek API密钥：");
console.log("1. 访问 https://platform.deepseek.com/");
console.log("2. 注册账号并获取API密钥");
console.log("3. 在下面输入你的API密钥");
console.log("");

rl.question("请输入你的DeepSeek API密钥 (或按回车跳过): ", (apiKey) => {
  if (!apiKey || apiKey.trim() === "") {
    console.log("");
    console.log("⚠️  未设置API密钥，游戏将使用本地模拟响应");
    console.log("💡 你可以稍后通过设置环境变量 DEEPSEEK_API_KEY 来启用AI功能");
    console.log("");
    console.log("示例：");
    console.log('export DEEPSEEK_API_KEY="your_api_key_here"');
    console.log("npm start");
    rl.close();
    return;
  }

  // 创建或更新 .env 文件
  const envPath = path.join(__dirname, ".env");
  const envContent = `# 勇士传说 - AI Agent Demo 环境变量
DEEPSEEK_API_KEY=${apiKey.trim()}
PORT=3001
DEBUG=false
API_TIMEOUT=30000
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log("");
    console.log("✅ API密钥配置成功！");
    console.log("🚀 现在可以启动游戏体验真正的AI功能：");
    console.log("");
    console.log("npm start");
    console.log("");
  } catch (error) {
    console.error("❌ 配置文件写入失败:", error.message);
    console.log("");
    console.log("请手动设置环境变量：");
    console.log(`export DEEPSEEK_API_KEY="${apiKey.trim()}"`);
  }

  rl.close();
});
