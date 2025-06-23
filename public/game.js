// 游戏状态管理
class GameState {
  constructor() {
    this.player = {
      level: 1,
      health: 100,
      maxHealth: 100,
      location: "新手村",
      equipment: ["基础剑"],
      keys: 0,
      defeatedBosses: [],
    };

    this.regions = {
      training: {
        name: "练级圣地",
        description: "升级10级并获得火焰之剑",
        reward: { level: 10, equipment: "火焰之剑" },
        completed: false,
        image: "fire_land.jpeg",
      },
      marsh: {
        name: "剧毒深渊",
        description: "获得暗黑之剑",
        reward: { equipment: "暗黑之剑" },
        completed: false,
        image: "marsh_land.jpeg",
      },
      thunder: {
        name: "雷霆内部",
        description: "获得圣光盾",
        reward: { equipment: "圣光盾" },
        completed: false,
        image: "thunder_land.jpeg",
      },
      ice: {
        name: "寒冰群峰",
        description: "获得寒冰之剑",
        reward: { equipment: "寒冰之剑" },
        completed: false,
        image: "ice_land.jpeg",
      },
    };

    this.bosses = {
      "ice-dragon": {
        name: "冰龙",
        requiredEquipment: "火焰之剑",
        keyReward: "冰钥匙",
        defeated: false,
        image: "ice_dragon.png",
        keyImage: "ice_key.webp",
      },
      "poison-dragon": {
        name: "毒龙",
        requiredEquipment: "圣光盾",
        keyReward: "毒钥匙",
        defeated: false,
        image: "green_dragon.jpeg",
        keyImage: "poison_key.jpeg",
      },
      "thunder-dragon": {
        name: "雷龙",
        requiredEquipment: "暗黑之剑",
        keyReward: "雷钥匙",
        defeated: false,
        image: "electric_dragon.png",
        keyImage: "thunder_key.avif",
      },
      "fire-dragon": {
        name: "火龙大魔王",
        requiredKeys: 3,
        requiredEquipment: "三把钥匙", // 添加这个字段用于显示
        defeated: false,
        image: "fire_dragon.webp",
      },
    };

    this.equipmentImages = {
      基础剑: "normal_sword.webp",
      火焰之剑: "fire_sword.jpg",
      暗黑之剑: "dark_sword.webp",
      圣光盾: "god_light_shield.png",
      寒冰之剑: "ice_sword.jpeg",
      冰钥匙: "ice_key.webp",
      毒钥匙: "poison_key.jpeg",
      雷钥匙: "thunder_key.avif",
    };
  }

  updateUI() {
    // 更新角色信息
    document.getElementById("player-level").textContent = this.player.level;
    document.getElementById(
      "player-health"
    ).textContent = `${this.player.health}/${this.player.maxHealth}`;
    document.getElementById("player-location").textContent =
      this.player.location;
    document.getElementById(
      "player-keys"
    ).textContent = `${this.player.keys}/3`;

    // 更新装备列表
    this.updateEquipmentDisplay();

    // 更新区域状态
    this.updateRegionsDisplay();

    // 更新Boss状态
    this.updateBossesDisplay();
  }

  updateEquipmentDisplay() {
    const equipmentList = document.getElementById("equipment-list");
    equipmentList.innerHTML = "";

    this.player.equipment.forEach((equipment) => {
      const item = document.createElement("div");
      item.className = "equipment-item";
      item.innerHTML = `
        <div class="equipment-icon" style="background-image: url('../assets/${this.equipmentImages[equipment]}')"></div>
        <span>${equipment}</span>
      `;
      equipmentList.appendChild(item);
    });
  }

  updateRegionsDisplay() {
    const regionsList = document.getElementById("regions-list");
    const regions = regionsList.querySelectorAll(".region-card");

    regions.forEach((regionCard) => {
      const regionId = regionCard.dataset.region;
      const region = this.regions[regionId];

      if (region && region.completed) {
        regionCard.classList.add("completed");
      }
    });
  }

  updateBossesDisplay() {
    const bossList = document.getElementById("boss-list");
    const bossCards = bossList.querySelectorAll(".boss-card");

    bossCards.forEach((bossCard) => {
      const bossId = bossCard.dataset.boss;
      const boss = this.bosses[bossId];

      if (boss && boss.defeated) {
        bossCard.classList.add("defeated");
        bossCard.querySelector(".boss-status").textContent = "已击败";
      }
    });
  }
}

// AI Agent 类
class AIAgent {
  constructor() {
    this.capabilities = {
      taskDecomposition: "任务拆分",
      toolSelection: "工具选择",
      chainOfThought: "思维链推理",
    };
  }

  // 任务拆分能力
  async decomposeTask(goal, gameState) {
    const thinking = [];

    thinking.push("🎯 分析目标：" + goal);
    thinking.push("📊 评估当前状态...");
    thinking.push(
      `当前等级：${
        gameState.player.level
      }，装备：${gameState.player.equipment.join(", ")}`
    );
    thinking.push(`已获得钥匙：${gameState.player.keys}/3`);

    let decomposition = {};

    if (goal.includes("火龙")) {
      thinking.push("🔍 检测到最终Boss挑战！");
      thinking.push("📋 分析前置条件：需要3把钥匙");

      const missingKeys = 3 - gameState.player.keys;
      if (missingKeys > 0) {
        thinking.push(`⚠️ 还需要 ${missingKeys} 把钥匙`);

        decomposition = {
          mainGoal: "击败火龙大魔王",
          prerequisites: [
            "获得冰钥匙（击败冰龙）",
            "获得毒钥匙（击败毒龙）",
            "获得雷钥匙（击败雷龙）",
          ].slice(0, missingKeys),
          steps: [
            "1. 准备对应装备",
            "2. 挑战相应龙族Boss",
            "3. 收集所有钥匙",
            "4. 最终决战火龙",
          ],
        };
      } else {
        thinking.push("✅ 已具备挑战火龙的条件！");
        decomposition = {
          mainGoal: "击败火龙大魔王",
          prerequisites: [],
          steps: ["直接挑战火龙大魔王"],
        };
      }
    } else {
      // 单个Boss的任务分解
      thinking.push("🐉 分析单体Boss挑战");
      const boss = Object.values(gameState.bosses).find((b) =>
        goal.includes(b.name)
      );

      if (boss) {
        thinking.push(`🎯 目标：${boss.name}`);
        thinking.push(`🛡️ 需要装备：${boss.requiredEquipment}`);

        const hasRequiredEquipment = gameState.player.equipment.includes(
          boss.requiredEquipment
        );

        if (!hasRequiredEquipment) {
          thinking.push(`❌ 缺少必需装备：${boss.requiredEquipment}`);
          decomposition = {
            mainGoal: `击败${boss.name}`,
            prerequisites: [`获得${boss.requiredEquipment}`],
            steps: ["1. 前往对应区域获得装备", "2. 返回挑战Boss"],
          };
        } else {
          thinking.push("✅ 装备齐全，可以直接挑战！");
          decomposition = {
            mainGoal: `击败${boss.name}`,
            prerequisites: [],
            steps: ["直接挑战Boss"],
          };
        }
      }
    }

    thinking.push("📝 任务分解完成！");

    return {
      capability: "任务拆分",
      thinking: thinking,
      decomposition: decomposition,
    };
  }

  // 工具选择能力
  async selectTools(target, gameState) {
    const thinking = [];

    thinking.push("🔧 启动工具选择分析...");
    thinking.push(`🎯 挑战目标：${target}`);

    const boss = Object.values(gameState.bosses).find((b) =>
      target.includes(b.name)
    );

    if (!boss) {
      thinking.push("❌ 未找到对应Boss信息");
      return null;
    }

    thinking.push(`📊 分析${boss.name}的弱点...`);
    thinking.push(`🛡️ 推荐装备：${boss.requiredEquipment}`);

    // 生成可选择的装备组合
    const availableTools = [];

    gameState.player.equipment.forEach((equipment) => {
      availableTools.push({
        name: equipment,
        image: gameState.equipmentImages[equipment],
        description: this.getEquipmentDescription(equipment),
        isRecommended: equipment === boss.requiredEquipment,
      });
    });

    // 添加一些干扰选项
    const distractors = [
      {
        name: "治疗药水",
        image: "shield.png",
        description: "恢复生命值",
        isRecommended: false,
      },
      {
        name: "普通盾牌",
        image: "shield.png",
        description: "基础防护",
        isRecommended: false,
      },
    ];

    availableTools.push(...distractors);

    thinking.push(`🎲 生成 ${availableTools.length} 个装备选项`);
    thinking.push("💡 请选择最适合的装备组合");

    return {
      capability: "工具选择",
      thinking: thinking,
      tools: availableTools,
      correctTool: boss.requiredEquipment,
    };
  }

  // 思维链推理能力
  async chainOfThought(situation, gameState) {
    const thinking = [];

    thinking.push("🧠 启动思维链推理...");
    thinking.push("1️⃣ 问题理解：我需要分析什么？");
    thinking.push(`   当前情况：${situation}`);

    thinking.push("2️⃣ 信息收集：有哪些关键信息？");
    thinking.push(`   玩家等级：${gameState.player.level}`);
    thinking.push(`   拥有装备：${gameState.player.equipment.join(", ")}`);
    thinking.push(`   钥匙数量：${gameState.player.keys}/3`);
    thinking.push(
      `   已击败Boss：${gameState.player.defeatedBosses.join(", ") || "无"}`
    );

    thinking.push("3️⃣ 逻辑推理：基于什么逻辑？");

    if (situation.includes("准备挑战")) {
      thinking.push("   - 需要检查装备是否匹配Boss弱点");
      thinking.push("   - 需要确认等级是否足够");
      thinking.push("   - 需要分析胜率和风险");
    } else if (situation.includes("装备选择")) {
      thinking.push("   - 分析各装备的特性和效果");
      thinking.push("   - 匹配Boss的弱点属性");
      thinking.push("   - 选择最优装备组合");
    }

    thinking.push("4️⃣ 结论得出：最终答案是什么？");
    thinking.push("   基于以上分析，推荐的行动方案是...");

    thinking.push("5️⃣ 验证检查：这个答案合理吗？");
    thinking.push("   ✅ 逻辑链条完整，建议可行");

    return {
      capability: "思维链推理",
      thinking: thinking,
    };
  }

  getEquipmentDescription(equipment) {
    const descriptions = {
      基础剑: "普通的剑，攻击力一般",
      火焰之剑: "火焰附魔，对冰系敌人有奇效",
      暗黑之剑: "暗黑力量，对雷系敌人有效",
      圣光盾: "圣光护佑，对毒系敌人免疫",
      寒冰之剑: "冰霜之力，对火系敌人克制",
    };
    return descriptions[equipment] || "神秘装备";
  }
}

// 主游戏控制器
class GameController {
  constructor() {
    this.gameState = new GameState();
    this.aiAgent = new AIAgent();
    this.selectedTools = [];
    this.correctTool = null;
    this.currentBattleTarget = null;
    this.isProcessing = false; // 防重复点击
    this.hasStartedAdventure = false; // 是否已开始冒险
    this.init();
  }

  init() {
    this.gameState.updateUI();
    this.setupEventListeners();
    this.updateGameStatus("welcome");
  }

  // 更新游戏状态提示
  updateGameStatus(status, data = {}) {
    const statusMessage = document.getElementById("status-message");
    const statusHint = document.getElementById("status-hint");
    const gameStatus = document.getElementById("game-status");

    gameStatus.classList.add("show");

    switch (status) {
      case "welcome":
        statusMessage.textContent = "🎮 欢迎来到龙族传说！";
        statusHint.textContent = "点击🚀 开始冒险按钮来开始你的英雄之旅";
        break;
      case "started":
        statusMessage.textContent = "🗺️ 探索世界，收集装备！";
        statusHint.textContent =
          "点击左侧的区域卡片来探索不同区域，获得装备和经验";
        break;
      case "ready_for_boss":
        statusMessage.textContent = `⚔️ 准备挑战 ${data.bossName}！`;
        statusHint.textContent = "你已具备挑战条件，点击左侧Boss卡片开始战斗";
        break;
      case "need_equipment":
        statusMessage.textContent = `🛡️ 需要更强的装备！`;
        statusHint.textContent = `挑战${data.bossName}需要先获得${data.requiredEquipment}，请先探索相应区域`;
        break;
      case "processing":
        statusMessage.textContent = "🤖 AI正在分析中...";
        statusHint.textContent = "请稍等，AI正在为你制定最佳策略";
        break;
      case "tool_selection":
        statusMessage.textContent = "🛠️ 选择你的装备！";
        statusHint.textContent = "根据AI推荐选择最适合的装备来对战Boss";
        break;
      case "victory":
        statusMessage.textContent = "🎉 恭喜通关！";
        statusHint.textContent = "你已成功击败火龙大魔王，拯救了魔法大陆！";
        break;
      case "collect_keys":
        statusMessage.textContent = `🗝️ 收集钥匙 (${data.keys}/3)`;
        statusHint.textContent =
          "继续挑战其他Boss收集钥匙，集齐3把钥匙后可挑战火龙大魔王";
        break;
    }
  }

  setupEventListeners() {
    // 区域点击事件
    document.getElementById("regions-list").addEventListener("click", (e) => {
      if (this.isProcessing) return;

      const regionCard = e.target.closest(".region-card");
      if (
        regionCard &&
        !regionCard.classList.contains("completed") &&
        !regionCard.classList.contains("disabled")
      ) {
        if (!this.hasStartedAdventure) {
          this.updateGameStatus("welcome");
          return;
        }
        this.visitRegion(regionCard.dataset.region);
      }
    });

    // Boss挑战事件
    document.getElementById("boss-list").addEventListener("click", (e) => {
      if (this.isProcessing) return;

      const bossCard = e.target.closest(".boss-card");
      if (
        bossCard &&
        !bossCard.classList.contains("defeated") &&
        !bossCard.classList.contains("disabled")
      ) {
        if (!this.hasStartedAdventure) {
          this.updateGameStatus("welcome");
          return;
        }
        this.challengeBoss(bossCard.dataset.boss);
      }
    });

    // 按钮事件
    document.getElementById("start-adventure").addEventListener("click", () => {
      if (this.isProcessing) return;

      if (!this.hasStartedAdventure) {
        this.hasStartedAdventure = true;
        this.triggerChainOfThought("开始冒险，分析当前情况");
      } else {
        // 如果已经开始，这个按钮可以用来获取当前建议
        this.triggerChainOfThought("分析当前情况，给出下一步建议");
      }
    });

    document.getElementById("reset-game").addEventListener("click", () => {
      if (this.isProcessing) return;
      this.resetGame();
    });

    document.getElementById("confirm-tools").addEventListener("click", () => {
      if (this.isProcessing) return;
      this.confirmToolSelection();
    });

    document
      .getElementById("cancel-selection")
      .addEventListener("click", () => {
        if (this.isProcessing) return;
        this.hideToolSelection();
      });
  }

  async visitRegion(regionId) {
    const region = this.gameState.regions[regionId];
    if (!region || region.completed || this.isProcessing) return;

    this.isProcessing = true;
    this.updateGameStatus("processing");

    // 显示AI思维链
    await this.showAIThinking(
      `准备前往${region.name}...`,
      "思维链推理",
      [
        `🎯 目标区域：${region.name}`,
        `📋 预期收获：${region.description}`,
        "🧭 分析路径：安全可行",
        "⚡ 开始行动：前往目的地",
      ],
      true
    ); // 清空之前的内容

    // 延迟执行访问
    setTimeout(() => {
      this.executeRegionVisit(regionId, region);
      this.isProcessing = false;
    }, 2000);
  }

  executeRegionVisit(regionId, region) {
    // 更新游戏状态
    if (region.reward.level) {
      this.gameState.player.level = region.reward.level;
    }

    if (region.reward.equipment) {
      if (!this.gameState.player.equipment.includes(region.reward.equipment)) {
        this.gameState.player.equipment.push(region.reward.equipment);
      }
    }

    this.gameState.player.location = region.name;
    region.completed = true;

    // 更新UI
    this.gameState.updateUI();

    // 显示成功消息
    this.showSuccessMessage(
      `成功探索${region.name}！获得了${region.reward.equipment || "经验"}！`
    );

    // 更新游戏状态提示
    this.checkAndUpdateGameProgress();
  }

  // 检查游戏进度并更新状态提示
  checkAndUpdateGameProgress() {
    const playerKeys = this.gameState.player.keys;

    if (playerKeys >= 3) {
      this.updateGameStatus("ready_for_boss", { bossName: "火龙大魔王" });
    } else if (playerKeys > 0) {
      this.updateGameStatus("collect_keys", { keys: playerKeys });
    } else {
      // 检查是否有可以挑战的Boss
      const availableBoss = this.findAvailableBoss();
      if (availableBoss) {
        this.updateGameStatus("ready_for_boss", {
          bossName: availableBoss.name,
        });
      } else {
        this.updateGameStatus("started");
      }
    }
  }

  // 寻找可以挑战的Boss
  findAvailableBoss() {
    for (const [bossId, boss] of Object.entries(this.gameState.bosses)) {
      if (!boss.defeated) {
        if (boss.name === "火龙大魔王") {
          if (this.gameState.player.keys >= 3) {
            return boss;
          }
        } else if (
          this.gameState.player.equipment.includes(boss.requiredEquipment)
        ) {
          return boss;
        }
      }
    }
    return null;
  }

  async challengeBoss(bossId) {
    const boss = this.gameState.bosses[bossId];
    if (!boss || boss.defeated || this.isProcessing) return;

    this.isProcessing = true;
    this.currentBattleTarget = bossId;

    // 检查能力
    const canChallenge = await this.checkBossRequirements(boss);

    if (!canChallenge) {
      // 显示需要装备的提示
      const requiredEquipment =
        boss.name === "火龙大魔王" ? "三把钥匙" : boss.requiredEquipment;
      this.updateGameStatus("need_equipment", {
        bossName: boss.name,
        requiredEquipment: requiredEquipment,
      });

      // 触发任务拆分能力
      await this.triggerTaskDecomposition(boss);
    } else {
      this.updateGameStatus("tool_selection");
      // 触发工具选择能力
      await this.triggerToolSelection(boss);
    }
  }

  async checkBossRequirements(boss) {
    if (boss.name === "火龙大魔王") {
      return this.gameState.player.keys >= 3;
    }

    return this.gameState.player.equipment.includes(boss.requiredEquipment);
  }

  async triggerTaskDecomposition(boss) {
    // 显示API加载状态
    this.showAPILoading(
      `🤖 正在分析挑战${boss.name}的策略`,
      "连接 DeepSeek API - 任务拆分"
    );

    try {
      // 调用真实的API
      const response = await fetch("/api/ai/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: `击败${boss.name}`,
          gameState: this.gameState,
        }),
      });

      const data = await response.json();

      // 隐藏API加载
      this.hideAPILoading();

      if (data.success) {
        // 显示API原始响应
        showAPIResponse(
          data.raw_data?.originalResponse || data.answer || data,
          "任务分解 API"
        );

        // 解析API返回的思维步骤
        const thinking = this.parseThinkingFromAPI(
          data.thinking || data.answer
        );

        this.showAIThinking(
          `✅ AI分析完成：挑战${boss.name}的策略`,
          "任务拆分",
          thinking,
          true // 清空之前的内容
        );

        // 显示任务分解结果
        setTimeout(() => {
          this.showTaskDecomposition({
            mainGoal: `击败${boss.name}`,
            prerequisites: this.extractPrerequisites(data.answer, boss),
            steps: this.extractSteps(data.answer),
          });
          this.isProcessing = false; // 恢复交互
        }, 4000);
      } else {
        throw new Error(data.error || "API调用失败");
      }
    } catch (error) {
      // 隐藏API加载
      this.hideAPILoading();

      console.error("任务分解API调用失败:", error);
      // 使用本地fallback
      const result = await this.aiAgent.decomposeTask(
        `击败${boss.name}`,
        this.gameState
      );

      this.showAIThinking(
        `⚠️ [本地模式] 分析挑战${boss.name}的策略`,
        result.capability,
        result.thinking,
        true // 清空之前的内容
      );

      setTimeout(() => {
        this.showTaskDecomposition(result.decomposition);
        this.isProcessing = false; // 恢复交互
      }, 3000);
    }
  }

  async triggerToolSelection(boss) {
    // 显示API加载状态
    this.showAPILoading(
      `⚔️ 正在分析对战${boss.name}的装备选择`,
      "连接 DeepSeek API - 工具选择"
    );

    try {
      // 调用真实的API
      const response = await fetch("/api/ai/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: `对战${boss.name}`,
          gameState: this.gameState,
        }),
      });

      const data = await response.json();

      // 隐藏API加载
      this.hideAPILoading();

      if (data.success) {
        // 显示API原始响应
        showAPIResponse(
          data.raw_data?.originalResponse || data.answer || data,
          "工具选择 API"
        );

        // 保存AI选择信息
        this.currentAISelection = {
          selectedTools: data.selectedTools || [],
          recommendedEquipment: data.recommendedEquipment || [],
          toolCallsUsed: data.toolCallsUsed || false,
        };

        // 解析API返回的思维步骤
        const thinking = this.parseThinkingFromAPI(
          data.thinking || data.answer
        );

        // 显示AI分析结果
        let analysisText = `✅ AI分析完成：对战${boss.name}的装备方案`;

        // 如果AI选择了工具，显示选择结果
        if (data.selectedTools && data.selectedTools.length > 0) {
          analysisText += `\n\n🎯 AI推荐装备：`;
          data.selectedTools.forEach((tool) => {
            analysisText += `\n• ${tool.name} - ${tool.reason}`;
          });
        }

        this.showAIThinking(
          analysisText,
          "工具选择",
          thinking,
          true // 清空之前的内容
        );

        // 使用API返回的工具选项，优先使用AI选择的工具
        let tools = data.tools || this.generateToolOptions(boss);

        // 如果有AI选择的工具，标记它们
        if (data.recommendedEquipment && data.recommendedEquipment.length > 0) {
          tools.forEach((tool) => {
            if (data.recommendedEquipment.includes(tool.name)) {
              tool.aiSelected = true;
              tool.isRecommended = true;
            }
          });
        }

        // 显示工具选择界面
        setTimeout(() => {
          this.showToolSelection(
            tools,
            data.recommendedEquipment || boss.requiredEquipment
          );
          this.isProcessing = false; // 恢复交互
        }, 4000);
      } else {
        throw new Error(data.error || "API调用失败");
      }
    } catch (error) {
      // 隐藏API加载
      this.hideAPILoading();

      console.error("工具选择API调用失败:", error);
      // 使用本地fallback
      const result = await this.aiAgent.selectTools(boss.name, this.gameState);

      if (!result) return;

      this.showAIThinking(
        `⚠️ [本地模式] 分析对战${boss.name}的装备选择`,
        result.capability,
        result.thinking,
        true // 清空之前的内容
      );

      setTimeout(() => {
        this.showToolSelection(result.tools, result.correctTool);
        this.isProcessing = false; // 恢复交互
      }, 3000);
    }
  }

  async triggerChainOfThought(situation) {
    if (this.isProcessing) return;

    this.isProcessing = true;

    // 显示API加载状态
    this.showAPILoading(
      "🧠 正在启动思维链分析",
      "连接 DeepSeek API - 思维链推理"
    );

    try {
      // 调用真实的API
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: situation,
          gameState: this.gameState,
        }),
      });

      const data = await response.json();

      // 隐藏API加载
      this.hideAPILoading();

      if (data.success) {
        // 显示API原始响应
        showAPIResponse(
          data.raw_data?.originalResponse || data.answer || data,
          "思维链推理 API"
        );

        // 解析API返回的思维步骤
        const thinking = this.parseThinkingFromAPI(
          data.thinking || data.answer
        );

        this.showAIThinking(
          "✅ AI思维链分析完成",
          "思维链推理",
          thinking,
          true
        );
      } else {
        throw new Error(data.error || "API调用失败");
      }
    } catch (error) {
      // 隐藏API加载
      this.hideAPILoading();

      console.error("思维链推理API调用失败:", error);
      // 使用本地fallback
      this.showAIThinking(
        "⚠️ [本地模式] 欢迎来到龙族传说！让我分析一下你的冒险之路",
        "思维链推理",
        [
          "🎯 目标确认：击败火龙大魔王，拯救大陆",
          "📊 当前状态：1级新手，装备基础",
          "🗺️ 策略分析：需要先提升实力，获得装备",
          "💡 建议行动：前往练级圣地开始冒险",
          "🚀 准备就绪：开始你的英雄之旅！",
        ]
      );
    }

    // 完成后更新状态并恢复交互
    setTimeout(() => {
      if (!this.hasStartedAdventure) {
        this.updateGameStatus("started");
        // 更新按钮文字
        document.getElementById("start-adventure").textContent = "💡 获取建议";
      } else {
        this.checkAndUpdateGameProgress();
      }
      this.isProcessing = false;
    }, 5000);
  }

  showAIThinking(title, capability, steps = null, clearPrevious = false) {
    const aiThinking = document.getElementById("ai-thinking");
    const aiCapability = document.getElementById("ai-capability");
    const thinkingContent = document.getElementById("thinking-content");

    aiCapability.textContent = `🤖 ${capability}`;

    // 只有明确要求清空时才清空，否则累积显示
    if (clearPrevious || !aiThinking.classList.contains("show")) {
      thinkingContent.innerHTML = "";
    }

    if (steps) {
      // 添加一个分隔符（如果已经有内容的话）
      if (thinkingContent.children.length > 0) {
        const separator = document.createElement("div");
        separator.className = "thinking-separator";
        separator.innerHTML = `<hr style="border: 1px solid #777; margin: 15px 0;">`;
        thinkingContent.appendChild(separator);
      }

      // 添加能力标题
      const capabilityHeader = document.createElement("div");
      capabilityHeader.className = "thinking-step capability-header";
      capabilityHeader.innerHTML = `<span class="step-number">🔥</span><span><strong>${capability}</strong></span>`;
      thinkingContent.appendChild(capabilityHeader);

      // 添加思维步骤
      steps.forEach((step, index) => {
        const stepElement = document.createElement("div");
        stepElement.className = "thinking-step";
        stepElement.innerHTML = `<span class="step-number">${
          index + 1
        }.</span><span>${step}</span>`;
        thinkingContent.appendChild(stepElement);
      });
    } else {
      const stepElement = document.createElement("div");
      stepElement.className = "thinking-step";
      stepElement.innerHTML = `
        <span class="step-number">🤔</span>
        <span>${title}</span>
      `;
      thinkingContent.appendChild(stepElement);
    }

    aiThinking.classList.add("show");

    // 滚动到最新内容
    thinkingContent.scrollTop = thinkingContent.scrollHeight;

    // 3秒后隐藏（只对简单消息）
    setTimeout(() => {
      if (!steps) {
        aiThinking.classList.remove("show");
      }
    }, 3000);
  }

  // API Loading 方法
  showAPILoading(title, status) {
    const loadingOverlay = document.getElementById("api-loading");
    const loadingTitle = document.getElementById("api-loading-title");
    const loadingStatus = document.getElementById("api-loading-status");

    loadingTitle.textContent = title;
    loadingStatus.textContent = status;
    loadingOverlay.classList.add("show");
  }

  hideAPILoading() {
    const loadingOverlay = document.getElementById("api-loading");
    loadingOverlay.classList.remove("show");
  }

  showTaskDecomposition(decomposition) {
    // 使用累积显示任务分解结果
    const steps = [];

    steps.push(`<strong>🎯 主要目标:</strong> ${decomposition.mainGoal}`);

    if (decomposition.prerequisites.length > 0) {
      steps.push(`<strong>📋 前置条件:</strong>`);
      decomposition.prerequisites.forEach((prereq, index) => {
        steps.push(`   ${index + 1}. ${prereq}`);
      });
    }

    steps.push(
      `<strong>📝 建议行动:</strong> ${decomposition.steps.join(" → ")}`
    );

    this.showAIThinking("", "任务分解结果", steps);

    // 8秒后不自动隐藏，让用户控制
    setTimeout(() => {
      // 可以选择是否自动隐藏
      // aiThinking.classList.remove("show");
    }, 8000);
  }

  showToolSelection(tools, correctTool) {
    const toolSelection = document.getElementById("tool-selection");
    const toolGrid = document.getElementById("tool-grid");

    // 更新提示文字
    const boss = this.gameState.bosses[this.currentBattleTarget];
    const selectionHint = toolSelection.querySelector("p");
    if (boss.name === "火龙大魔王") {
      selectionHint.textContent =
        "AI分析推荐以下装备组合，火龙大魔王需要选择所有三把钥匙：";
    } else {
      selectionHint.textContent =
        "AI分析推荐以下装备组合，请选择你认为最适合的装备：";
    }

    toolGrid.innerHTML = "";
    this.selectedTools = [];

    tools.forEach((tool) => {
      const toolCard = document.createElement("div");
      toolCard.className = "tool-card";
      const isKey = ["冰钥匙", "毒钥匙", "雷钥匙"].includes(tool.name);
      const isAISelected = tool.aiSelected || tool.isRecommended;

      // 构建AI推荐信息
      let aiRecommendationHTML = "";
      if (isAISelected) {
        aiRecommendationHTML = `<div style="color: #00d4ff; font-weight: bold; margin-top: 5px;">🤖 AI推荐</div>`;
      }

      if (tool.aiSelected) {
        aiRecommendationHTML += `<div style="color: #ffeb3b; font-weight: bold; margin-top: 3px; font-size: 10px;">🎯 智能选择</div>`;
      }

      // 查找AI选择的详细信息
      let aiDetailsHTML = "";
      if (this.currentAISelection && this.currentAISelection.selectedTools) {
        const aiTool = this.currentAISelection.selectedTools.find(
          (st) => st.name === tool.name
        );
        if (aiTool) {
          aiDetailsHTML = `
            <div style="background: rgba(0, 212, 255, 0.1); padding: 5px; margin-top: 5px; border-radius: 3px; font-size: 10px;">
              <div style="color: #00d4ff; font-weight: bold;">🎯 目标：${aiTool.target}</div>
              <div style="color: #ffeb3b; margin-top: 2px;">💡 理由：${aiTool.reason}</div>
            </div>
          `;
        }
      }

      toolCard.innerHTML = `
        <div class="tool-icon" style="background-image: url('../assets/${
          tool.image
        }')"></div>
        <div class="tool-name">${tool.name}${isKey ? " 🗝️" : ""}</div>
        <div class="tool-description">${tool.description}</div>
        ${aiRecommendationHTML}
        ${aiDetailsHTML}
        ${
          isKey && boss.name === "火龙大魔王"
            ? '<div style="color: #ff6b6b; font-weight: bold; margin-top: 3px; font-size: 10px;">必须选择</div>'
            : ""
        }
      `;

      // 如果AI选择了这个工具，给它特殊样式并自动选择
      if (tool.aiSelected) {
        toolCard.style.border = "2px solid #00d4ff";
        toolCard.style.boxShadow = "0 0 10px rgba(0, 212, 255, 0.3)";
        // 自动选择AI推荐的工具
        toolCard.classList.add("selected");
        this.selectedTools.push(tool.name);
      }

      toolCard.addEventListener("click", () => {
        toolCard.classList.toggle("selected");
        if (toolCard.classList.contains("selected")) {
          if (!this.selectedTools.includes(tool.name)) {
            this.selectedTools.push(tool.name);
          }
        } else {
          this.selectedTools = this.selectedTools.filter(
            (t) => t !== tool.name
          );
        }

        console.log("🖱️ 工具选择更新:", this.selectedTools);
      });

      toolGrid.appendChild(toolCard);
    });

    // 正确设置correctTool
    if (boss.name === "火龙大魔王") {
      this.correctTool = ["冰钥匙", "毒钥匙", "雷钥匙"]; // 数组形式
    } else {
      // 使用AI推荐的工具作为正确答案，如果没有则使用传统的requiredEquipment
      if (
        this.currentAISelection &&
        this.currentAISelection.recommendedEquipment &&
        this.currentAISelection.recommendedEquipment.length > 0
      ) {
        this.correctTool = this.currentAISelection.recommendedEquipment[0];
      } else {
        this.correctTool = correctTool || boss.requiredEquipment;
      }
    }

    console.log("🎯 设置正确工具:", this.correctTool);
    toolSelection.classList.add("show");
  }

  confirmToolSelection() {
    if (this.selectedTools.length === 0) {
      alert("请选择至少一个装备！");
      return;
    }

    const boss = this.gameState.bosses[this.currentBattleTarget];
    let isCorrect = false;

    console.log("🎯 确认工具选择:", {
      bossName: boss.name,
      selectedTools: this.selectedTools,
      correctTool: this.correctTool,
      requiredEquipment: boss.requiredEquipment,
      aiRecommendedEquipment: this.currentAISelection?.recommendedEquipment,
    });

    if (boss.name === "火龙大魔王") {
      // 火龙大魔王需要选择所有三把钥匙
      const requiredKeys = ["冰钥匙", "毒钥匙", "雷钥匙"];
      isCorrect = requiredKeys.every((key) => this.selectedTools.includes(key));

      console.log("🔑 火龙大魔王验证:", {
        requiredKeys,
        selectedTools: this.selectedTools,
        isCorrect,
      });

      if (
        !isCorrect &&
        this.selectedTools.some((tool) => requiredKeys.includes(tool))
      ) {
        // 如果选择了部分钥匙但不全，给出提示
        const missingKeys = requiredKeys.filter(
          (key) => !this.selectedTools.includes(key)
        );
        alert(`需要选择所有三把钥匙！你还缺少：${missingKeys.join("、")}`);
        return;
      }
    } else {
      // 其他Boss的验证逻辑：支持AI推荐多个工具的情况
      if (
        this.currentAISelection &&
        this.currentAISelection.recommendedEquipment
      ) {
        // 如果AI推荐了多个装备，只要选择了其中包含正确装备即可
        const requiredEquipment = boss.requiredEquipment;
        isCorrect = this.selectedTools.includes(requiredEquipment);

        console.log("🤖 AI多工具验证:", {
          selectedTools: this.selectedTools,
          requiredEquipment: requiredEquipment,
          aiRecommended: this.currentAISelection.recommendedEquipment,
          isCorrect,
        });
      } else {
        // 传统单选逻辑
        isCorrect = this.selectedTools.includes(this.correctTool);

        console.log("⚔️ 传统单选验证:", {
          selectedTools: this.selectedTools,
          correctTool: this.correctTool,
          isCorrect,
        });
      }
    }

    console.log("🏆 最终战斗结果:", isCorrect ? "胜利" : "失败");

    this.hideToolSelection();

    if (isCorrect) {
      this.executeBossBattle(true);
    } else {
      this.executeBossBattle(false);
    }
  }

  hideToolSelection() {
    document.getElementById("tool-selection").classList.remove("show");
    document.getElementById("ai-thinking").classList.remove("show");
  }

  executeBossBattle(success) {
    const boss = this.gameState.bosses[this.currentBattleTarget];

    if (success) {
      // 战斗胜利
      boss.defeated = true;

      if (boss.name !== "火龙大魔王") {
        this.gameState.player.keys++;
        // 将钥匙作为装备添加到装备列表
        const keyName = boss.keyReward;
        if (!this.gameState.player.equipment.includes(keyName)) {
          this.gameState.player.equipment.push(keyName);
        }
      }

      this.gameState.player.defeatedBosses.push(boss.name);
      this.gameState.updateUI();

      if (boss.name === "火龙大魔王") {
        this.updateGameStatus("victory");
        this.showVictoryScreen();
      } else {
        this.showSuccessMessage(
          `🎉 成功击败${boss.name}！获得${boss.keyReward}！`
        );
        // 更新游戏进度
        setTimeout(() => {
          this.checkAndUpdateGameProgress();
        }, 2000);
      }
    } else {
      // 战斗失败
      this.showFailureMessage(
        `❌ 装备选择错误！${boss.name}逃跑了，请重新准备后再来挑战！`
      );
      // 恢复状态提示
      setTimeout(() => {
        this.checkAndUpdateGameProgress();
      }, 3000);
    }

    this.isProcessing = false; // 恢复交互
  }

  showSuccessMessage(message) {
    this.showAIThinking(message, "任务完成", [
      "✅ 行动成功！",
      "📈 实力提升！",
      "🎯 继续下一个目标",
    ]);
  }

  showFailureMessage(message) {
    this.showAIThinking(message, "重新分析", [
      "❌ 策略需要调整",
      "🔄 重新制定计划",
      "💪 准备再次挑战",
    ]);
  }

  showVictoryScreen() {
    document.getElementById("victory-screen").style.display = "flex";
  }

  // 解析API返回的思维步骤
  parseThinkingFromAPI(apiResponse) {
    if (!apiResponse) return ["正在分析...", "分析完成"];

    const lines = apiResponse.split("\n");
    const steps = [];

    for (let line of lines) {
      line = line.trim();
      if (
        line.length > 5 &&
        (line.match(/^\d+\./) ||
          line.includes("：") ||
          line.includes("分析") ||
          line.includes("建议") ||
          line.includes("策略"))
      ) {
        steps.push(line);
        if (steps.length >= 6) break; // 限制步骤数量
      }
    }

    return steps.length > 0
      ? steps
      : ["正在分析游戏情况...", "制定最优策略中...", "分析完成！"];
  }

  // 提取前置条件
  extractPrerequisites(apiResponse, boss) {
    const prerequisites = [];

    if (boss.name === "火龙大魔王") {
      const missingKeys = 3 - this.gameState.player.keys;
      if (missingKeys > 0) {
        if (missingKeys >= 1) prerequisites.push("获得冰钥匙（击败冰龙）");
        if (missingKeys >= 2) prerequisites.push("获得毒钥匙（击败毒龙）");
        if (missingKeys >= 3) prerequisites.push("获得雷钥匙（击败雷龙）");
      }
    } else {
      if (!this.gameState.player.equipment.includes(boss.requiredEquipment)) {
        prerequisites.push(`获得${boss.requiredEquipment}`);
      }
    }

    return prerequisites;
  }

  // 提取执行步骤
  extractSteps(apiResponse) {
    const steps = [];
    const lines = apiResponse.split("\n");

    for (let line of lines) {
      line = line.trim();
      if (line.match(/^\d+\./) && line.length > 10) {
        steps.push(line);
        if (steps.length >= 4) break;
      }
    }

    return steps.length > 0
      ? steps
      : [
          "1. 分析目标弱点",
          "2. 准备必要装备",
          "3. 制定战斗策略",
          "4. 执行挑战计划",
        ];
  }

  // 生成工具选择选项
  generateToolOptions(boss) {
    const tools = [];

    // 添加玩家当前装备
    this.gameState.player.equipment.forEach((equipment) => {
      let isRecommended = false;

      // 特殊处理火龙大魔王：钥匙都是推荐装备
      if (boss.name === "火龙大魔王") {
        isRecommended = ["冰钥匙", "毒钥匙", "雷钥匙"].includes(equipment);
      } else {
        isRecommended = equipment === boss.requiredEquipment;
      }

      tools.push({
        name: equipment,
        image: this.gameState.equipmentImages[equipment],
        description: this.getEquipmentDescription(equipment),
        isRecommended: isRecommended,
      });
    });

    // 添加干扰项
    const distractors = [
      {
        name: "治疗药水",
        image: "shield.png",
        description: "恢复生命值",
        isRecommended: false,
      },
      {
        name: "普通盾牌",
        image: "shield.png",
        description: "基础防护",
        isRecommended: false,
      },
      {
        name: "魔法卷轴",
        image: "shield.png",
        description: "释放魔法攻击",
        isRecommended: false,
      },
    ];

    return [...tools, ...distractors];
  }

  // 获取装备描述
  getEquipmentDescription(equipment) {
    const descriptions = {
      基础剑: "普通的剑，攻击力一般",
      火焰之剑: "火焰附魔，对冰系敌人有奇效",
      暗黑之剑: "暗黑力量，对雷系敌人有效",
      圣光盾: "圣光护佑，对毒系敌人免疫",
      寒冰之剑: "冰霜之力，对火系敌人克制",
      冰钥匙: "冰龙的钥匙，蕴含冰霜之力",
      毒钥匙: "毒龙的钥匙，散发毒性能量",
      雷钥匙: "雷龙的钥匙，闪烁雷电光芒",
    };
    return descriptions[equipment] || "神秘装备";
  }

  resetGame() {
    this.gameState = new GameState();
    this.currentBattleTarget = null;
    this.selectedTools = [];
    this.correctTool = null;
    this.isProcessing = false;
    this.hasStartedAdventure = false;

    // 隐藏所有弹出界面
    document.getElementById("victory-screen").style.display = "none";
    document.getElementById("ai-thinking").classList.remove("show");
    document.getElementById("tool-selection").classList.remove("show");
    document.getElementById("api-response").classList.remove("show");

    // 更新UI
    this.gameState.updateUI();
    this.updateGameStatus("welcome");

    // 重置按钮文字
    document.getElementById("start-adventure").textContent = "🚀 开始冒险";
  }
}

// 全局重置函数
function resetGame() {
  if (window.gameController) {
    window.gameController.resetGame();
  }
}

// 清空AI分析结果
function clearAIAnalysis() {
  const aiThinking = document.getElementById("ai-thinking");
  const thinkingContent = document.getElementById("thinking-content");
  const aiCapability = document.getElementById("ai-capability");

  thinkingContent.innerHTML = "";
  aiCapability.textContent = "🤖 AI 能力展示";
  aiThinking.classList.remove("show");
}

// 显示API响应
function showAPIResponse(response, apiType = "DeepSeek API") {
  const apiResponseDiv = document.getElementById("api-response");
  const apiResponseContent = document.getElementById("api-response-content");
  const apiResponseHeader = apiResponseDiv.querySelector("h3");
  const toggleBtn = document.getElementById("toggle-api-response");

  apiResponseHeader.textContent = `🤖 ${apiType} 原始响应`;

  // 格式化响应内容
  let formattedResponse;
  if (typeof response === "string") {
    formattedResponse = response;
  } else {
    // 美化JSON显示
    formattedResponse = JSON.stringify(response, null, 2);
  }

  apiResponseContent.textContent = formattedResponse;
  apiResponseDiv.classList.add("show");

  // 更新按钮状态
  if (toggleBtn) {
    toggleBtn.textContent = "📋 隐藏响应";
  }
}

// 隐藏API响应
function hideAPIResponse() {
  const apiResponseDiv = document.getElementById("api-response");
  apiResponseDiv.classList.remove("show");
}

// 切换API响应显示
function toggleAPIResponse() {
  const apiResponseDiv = document.getElementById("api-response");
  const toggleBtn = document.getElementById("toggle-api-response");

  if (apiResponseDiv.classList.contains("show")) {
    apiResponseDiv.classList.remove("show");
    toggleBtn.textContent = "📋 原始响应";
  } else {
    // 如果没有内容，显示提示
    const apiResponseContent = document.getElementById("api-response-content");
    if (!apiResponseContent.textContent.trim()) {
      apiResponseContent.textContent =
        "暂无API响应内容。\n\n请先执行一次AI分析（任务分解、工具选择或思维链推理）来获取DeepSeek API的原始响应。";
    }
    apiResponseDiv.classList.add("show");
    toggleBtn.textContent = "📋 隐藏响应";
  }
}

// 初始化游戏
document.addEventListener("DOMContentLoaded", () => {
  window.gameController = new GameController();
  console.log("Game starting...");
});
