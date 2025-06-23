// 加载环境变量
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

// 服务模块
const GameStateManager = require("./services/gameState");
const AIAgent = require("./services/aiAgent");

const app = express();
const PORT = process.env.PORT || 3001;

// 初始化服务
const gameStateManager = new GameStateManager();
const aiAgent = new AIAgent();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 静态文件服务 - 提供游戏素材
app.use("/assets", express.static("assets"));

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      gameState: "active",
      aiAgent: "active",
    },
  });
});

// 获取游戏状态
app.get("/api/game/state/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const gameState = gameStateManager.getGameState(sessionId);

    res.json({
      success: true,
      gameState,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("获取游戏状态失败:", error);
    res.status(500).json({
      success: false,
      error: "获取游戏状态失败",
      fallback: gameStateManager.getGameState("default"),
    });
  }
});

// AI思维链分析 - 主要API接口
app.post("/api/ai/ask", async (req, res) => {
  try {
    const { question, gameState } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: "问题不能为空",
      });
    }

    console.log("🧠 思维链请求:", question);
    const result = await aiAgent.chainOfThought(question, gameState || {});

    res.json({
      success: true,
      thinking: result.thinking,
      answer: result.answer,
      capability: result.capability,
      raw_data: result,
    });
  } catch (error) {
    console.error("思维链分析失败:", error);
    res.status(500).json({
      success: false,
      error: "思维链服务不可用",
    });
  }
});

// AI工具选择
app.post("/api/ai/tools", async (req, res) => {
  try {
    const { question, gameState } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: "问题不能为空",
      });
    }

    console.log("🛠️ 工具选择请求:", question);

    // 从问题中提取Boss名称
    let bossName = question;
    if (question.includes("对战")) {
      bossName = question.replace("对战", "").trim();
    }

    console.log("🎯 识别目标Boss:", bossName);

    const result = await aiAgent.selectTools(bossName, gameState || {});

    if (!result) {
      return res.status(400).json({
        success: false,
        error: `未找到Boss信息: ${bossName}`,
      });
    }

    res.json({
      success: true,
      thinking: result.thinking,
      answer: result.answer,
      tools: result.tools,
      selectedTools: result.selectedTools,
      recommendedEquipment: result.recommendedEquipment,
      toolCallsUsed: result.toolCallsUsed,
      capability: result.capability,
      raw_data: result,
    });
  } catch (error) {
    console.error("工具选择失败:", error);
    res.status(500).json({
      success: false,
      error: "工具选择服务不可用",
    });
  }
});

// AI任务分解
app.post("/api/ai/tasks", async (req, res) => {
  try {
    const { question, gameState } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: "问题不能为空",
      });
    }

    console.log("📋 任务分解请求:", question);
    const result = await aiAgent.decomposeTask(question, gameState || {});

    res.json({
      success: true,
      thinking: result.thinking,
      answer: result.answer,
      tasks: result.tasks,
      capability: result.capability,
      raw_data: result,
    });
  } catch (error) {
    console.error("任务分解失败:", error);
    res.status(500).json({
      success: false,
      error: "任务分解服务不可用",
    });
  }
});

// API状态检查
app.get("/api/status", (req, res) => {
  const hasApiKey =
    process.env.DEEPSEEK_API_KEY &&
    process.env.DEEPSEEK_API_KEY !== "your_deepseek_api_key_here";

  res.json({
    success: true,
    deepseek_available: hasApiKey,
    mode: hasApiKey ? "AI模式" : "本地模式",
    timestamp: new Date().toISOString(),
  });
});

// 执行游戏动作
app.post("/api/game/action", async (req, res) => {
  try {
    const { action, sessionId = "default" } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: "动作不能为空",
      });
    }

    const result = gameStateManager.executeAction(sessionId, action);

    res.json({
      success: result.success,
      result: result.result || result.error,
      gameState: result.gameState,
      victoryCondition: result.gameState.victoryCondition,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("执行动作失败:", error);
    res.status(500).json({
      success: false,
      error: "执行动作失败",
      result: "动作执行遇到问题，请重试",
    });
  }
});

// 重置游戏
app.post("/api/game/reset/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const gameState = gameStateManager.resetGame(sessionId);

    res.json({
      success: true,
      message: "游戏已重置",
      gameState,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("重置游戏失败:", error);
    res.status(500).json({
      success: false,
      error: "重置游戏失败",
    });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error("服务器错误:", error);
  res.status(500).json({
    success: false,
    error: "服务器内部错误",
    message: "请稍后重试",
  });
});

// 404处理
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API接口不存在",
    available_endpoints: [
      "GET /api/health",
      "GET /api/game/state/:sessionId",
      "POST /api/ai/ask",
      "POST /api/ai/tools",
      "POST /api/ai/tasks",
      "POST /api/ai/reasoning",
      "POST /api/game/action",
      "POST /api/game/reset/:sessionId",
    ],
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log("🚀 勇士冒险 AI Agent Demo 服务器启动成功！");
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log("🤖 AI引擎: DeepSeek API");
  console.log("⚔️  准备开始冒险...");
  console.log("\n可用的API接口:");
  console.log("- GET  /api/health           - 健康检查");
  console.log("- GET  /api/game/state       - 获取游戏状态");
  console.log("- POST /api/ai/ask          - AI综合咨询");
  console.log("- POST /api/ai/tools        - AI装备推荐");
  console.log("- POST /api/ai/tasks        - AI任务分解");
  console.log("- POST /api/ai/reasoning    - AI思维链分析");
  console.log("- POST /api/game/action     - 执行游戏行动");
  console.log("- POST /api/game/reset      - 重置游戏");
});

// 优雅关闭
process.on("SIGINT", () => {
  console.log("\n🛑 正在关闭服务器...");
  process.exit(0);
});

module.exports = app;
