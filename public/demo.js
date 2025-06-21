class GameClient {
  constructor() {
    this.serverUrl = "";
    this.isProcessing = false;
    this.startTime = null;
    this.timer = null;

    // 游戏状态
    this.gameState = {
      level: 1,
      location: "新手村",
      equipment: ["基础剑", "布甲"],
      keys: [],
      defeatedBosses: [],
      experience: 0,
    };

    // 装备配置
    this.equipmentByLevel = {
      10: {
        name: "抗毒装备套装",
        items: ["毒龙克星剑", "抗毒护甲", "解毒药剂"],
        description: "专门对付毒龙的装备",
      },
      20: {
        name: "雷电抗性装备",
        items: ["雷电法杖", "绝缘护甲", "雷电盾牌"],
        description: "能够抵御雷电攻击的装备",
      },
      30: {
        name: "寒冰克制装备",
        items: ["火焰剑", "保温斗篷", "热血药剂"],
        description: "在冰雪环境中战斗的装备",
      },
    };

    // Boss配置
    this.bossConfig = {
      poison: {
        name: "毒龙",
        requiredLevel: 10,
        keyType: "poison_key",
        location: "毒龙巢穴",
        weakness: "抗毒装备",
      },
      thunder: {
        name: "雷龙",
        requiredLevel: 20,
        keyType: "thunder_key",
        location: "雷龙山峰",
        weakness: "雷电抗性装备",
      },
      ice: {
        name: "冰龙",
        requiredLevel: 30,
        keyType: "ice_key",
        location: "冰龙洞穴",
        weakness: "寒冰克制装备",
      },
      fire: {
        name: "火龙大魔王",
        requiredLevel: 30,
        requiredKeys: 3,
        location: "火山口",
        weakness: "三龙之力合一",
      },
    };
  }

  async init() {
    console.log("🎮 AI Agent 勇士冒险游戏初始化中...");
    await this.checkApiStatus();
    this.startTimer();
    this.updateUI();
    this.log("system", "🌟 欢迎来到艾泽拉斯大陆！");
    this.log("system", "🎯 你的使命：击败火龙大魔王，拯救大陆！");
    this.log("thinking", "💡 建议：先到练级圣地提升等级，获得更强的装备");
  }

  async checkApiStatus() {
    try {
      const response = await fetch("/api/status");
      const data = await response.json();

      const statusEl = document.getElementById("apiStatus");
      if (data.deepseek_available) {
        statusEl.textContent = "API状态: DeepSeek AI 已连接";
        statusEl.className = "api-status connected";
      } else {
        statusEl.textContent = "API状态: 本地智能模式";
        statusEl.className = "api-status local";
      }
    } catch (error) {
      console.error("API状态检查失败:", error);
      document.getElementById("apiStatus").textContent = "API状态: 连接失败";
    }
  }

  // 访问地点
  async visitLocation(location) {
    if (this.isProcessing) return;

    this.setProcessing(true);

    switch (location) {
      case "training":
        await this.visitTrainingGround();
        break;
      case "poison_lair":
        await this.visitBossLocation("poison");
        break;
      case "thunder_peak":
        await this.visitBossLocation("thunder");
        break;
      case "ice_cave":
        await this.visitBossLocation("ice");
        break;
      default:
        this.log("system", "❌ 未知的地点");
    }

    this.setProcessing(false);
  }

  // 访问练级圣地
  async visitTrainingGround() {
    this.log("player", "🏃‍♂️ 前往练级圣地...");
    this.updateCurrentAction("正在练级圣地训练...");

    // AI思维链：分析当前状态
    await this.aiThinking("分析当前训练需求", [
      "当前等级：" + this.gameState.level,
      "每次训练可获得10级经验",
      "不同等级将解锁对应装备",
      "训练是提升实力的最佳方式",
    ]);

    // 模拟训练时间
    await this.delay(1500);

    // 升级
    const oldLevel = this.gameState.level;
    this.gameState.level += 10;
    this.gameState.experience += 100;
    this.gameState.location = "练级圣地";

    this.log("success", `⬆️ 等级提升！${oldLevel} → ${this.gameState.level}`);
    this.log(
      "system",
      `💪 获得经验值：+100 (总计：${this.gameState.experience})`
    );

    // 检查是否获得新装备
    if (this.equipmentByLevel[this.gameState.level]) {
      const newEquipment = this.equipmentByLevel[this.gameState.level];
      this.gameState.equipment = [
        ...this.gameState.equipment,
        ...newEquipment.items,
      ];

      this.log("success", `🎁 获得新装备：${newEquipment.name}`);
      newEquipment.items.forEach((item) => {
        this.log("system", `  + ${item}`);
      });
      this.log("thinking", `💡 ${newEquipment.description}`);
    }

    this.updateUI();
    this.updateCurrentAction("训练完成，实力大幅提升！");
  }

  // 访问Boss地点
  async visitBossLocation(bossType) {
    const boss = this.bossConfig[bossType];

    this.log("player", `🏃‍♂️ 前往${boss.location}...`);
    this.updateCurrentAction(`正在前往${boss.location}...`);

    if (this.gameState.level < boss.requiredLevel) {
      this.log(
        "battle",
        `⚠️ 等级不足！需要${boss.requiredLevel}级才能挑战${boss.name}`
      );
      this.log("thinking", "💡 建议：先到练级圣地提升等级");
      return;
    }

    this.gameState.location = boss.location;
    this.log("system", `📍 到达${boss.location}`);
    this.log("thinking", `💭 这里是${boss.name}的领域，准备战斗...`);

    this.updateUI();
    this.updateCurrentAction(`已到达${boss.location}，可以挑战Boss`);
  }

  // 挑战Boss
  async challengeBoss(bossType) {
    if (this.isProcessing) return;

    const boss = this.bossConfig[bossType];

    // 检查是否已击败
    if (this.gameState.defeatedBosses.includes(bossType)) {
      this.log("thinking", `💭 ${boss.name}已经被击败了`);
      return;
    }

    this.setProcessing(true);
    this.log("player", `⚔️ 挑战${boss.name}！`);
    this.updateCurrentAction(`正在挑战${boss.name}...`);

    // 特殊处理火龙大魔王
    if (bossType === "fire") {
      await this.challengeFireDragon();
      this.setProcessing(false);
      return;
    }

    // AI思维链：战斗力分析
    const canDefeat = await this.aiAnalyzeBattle(boss);

    if (canDefeat) {
      await this.defeatBoss(bossType);
    } else {
      await this.aiTaskDecomposition(boss);
    }

    this.setProcessing(false);
  }

  // AI分析战斗力
  async aiAnalyzeBattle(boss) {
    this.log("ai", "🤖 AI正在分析战斗力...");

    const thinkingSteps = [
      `分析目标：${boss.name}`,
      `当前等级：${this.gameState.level} (需要：${boss.requiredLevel})`,
      `当前装备：${this.gameState.equipment.join(", ")}`,
      `敌人弱点：${boss.weakness}`,
      "计算胜率...",
    ];

    await this.aiThinking("战斗力分析", thinkingSteps);

    // 调用AI工具选择能力
    const canDefeat =
      this.gameState.level >= boss.requiredLevel &&
      this.hasRequiredEquipment(boss);

    if (canDefeat) {
      this.log("ai", "✅ 分析结果：具备击败条件！");
      this.log(
        "thinking",
        `💡 你拥有${boss.weakness}，可以有效对抗${boss.name}`
      );
    } else {
      this.log("ai", "❌ 分析结果：当前实力不足");
      this.log("thinking", `💡 需要提升等级或获得${boss.weakness}`);
    }

    return canDefeat;
  }

  // 检查是否有必要装备
  hasRequiredEquipment(boss) {
    const requiredEquipment = this.equipmentByLevel[boss.requiredLevel];
    if (!requiredEquipment) return true;

    return requiredEquipment.items.some((item) =>
      this.gameState.equipment.includes(item)
    );
  }

  // 击败Boss
  async defeatBoss(bossType) {
    const boss = this.bossConfig[bossType];

    this.log("battle", `⚔️ 与${boss.name}展开激烈战斗...`);
    await this.delay(2000);

    this.log("success", `🎉 成功击败${boss.name}！`);
    this.log("system", `🗝️ 获得${boss.name}的钥匙`);

    // 更新游戏状态
    this.gameState.defeatedBosses.push(bossType);
    this.gameState.keys.push(boss.keyType);

    // 更新UI
    this.updateBossStatus(bossType, true);
    this.updateUI();

    // 检查是否可以挑战火龙
    if (this.gameState.keys.length === 3) {
      this.log("success", "🔥 集齐三把钥匙！现在可以挑战火龙大魔王了！");
      this.log("thinking", "💡 最终决战即将开始...");
    }

    this.updateCurrentAction(`击败${boss.name}，获得钥匙！`);
  }

  // AI任务分解
  async aiTaskDecomposition(boss) {
    this.log("ai", "🤖 AI正在制定提升计划...");
    this.updateCurrentAction("AI正在分析并制定计划...");

    const currentLevel = this.gameState.level;
    const requiredLevel = boss.requiredLevel;
    const levelGap = requiredLevel - currentLevel;

    const thinkingSteps = [
      `目标：击败${boss.name}`,
      `当前等级：${currentLevel}`,
      `需要等级：${requiredLevel}`,
      `等级差距：${levelGap}`,
      "制定提升计划...",
    ];

    await this.aiThinking("任务分解分析", thinkingSteps);

    // 调用AI任务分解能力
    try {
      const response = await fetch("/api/ai/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: `我想击败${boss.name}，但是等级不够。当前等级${currentLevel}，需要${requiredLevel}级。请制定提升计划。`,
          gameState: this.getDetailedGameState(),
        }),
      });

      const data = await response.json();

      if (data.success && data.tasks) {
        this.log("ai", "📋 AI制定的提升计划：");
        this.displayTaskList(data.tasks);
      } else {
        // 本地备用计划
        this.displayLocalTaskPlan(boss, levelGap);
      }
    } catch (error) {
      this.displayLocalTaskPlan(boss, levelGap);
    }

    this.updateCurrentAction("AI已制定提升计划");
  }

  // 显示任务列表
  displayTaskList(tasks) {
    const taskContainer = document.createElement("div");
    taskContainer.className = "task-list";

    tasks.forEach((task, index) => {
      const taskEl = document.createElement("div");
      taskEl.className = "task-item";
      taskEl.textContent = `${index + 1}. ${task}`;
      taskContainer.appendChild(taskEl);
    });

    document.getElementById("gameLog").appendChild(taskContainer);
    this.scrollToBottom();
  }

  // 本地备用任务计划
  displayLocalTaskPlan(boss, levelGap) {
    const tasks = [
      `前往练级圣地训练 ${Math.ceil(levelGap / 10)} 次`,
      `提升等级到 ${boss.requiredLevel} 级`,
      `获得${boss.weakness}`,
      `返回${boss.location}`,
      `挑战并击败${boss.name}`,
    ];

    this.log("ai", "📋 提升计划：");
    this.displayTaskList(tasks);
  }

  // 挑战火龙大魔王
  async challengeFireDragon() {
    const boss = this.bossConfig.fire;

    if (this.gameState.keys.length < 3) {
      this.log("battle", "❌ 需要集齐三把钥匙才能挑战火龙大魔王！");
      this.log("thinking", `💡 当前钥匙：${this.gameState.keys.length}/3`);

      // AI分析剩余任务
      const remainingBosses = ["poison", "thunder", "ice"].filter(
        (type) => !this.gameState.defeatedBosses.includes(type)
      );

      if (remainingBosses.length > 0) {
        this.log("ai", "🤖 AI分析剩余任务：");
        remainingBosses.forEach((type) => {
          const remainingBoss = this.bossConfig[type];
          this.log("thinking", `• 击败${remainingBoss.name}获得钥匙`);
        });
      }

      return;
    }

    // 最终决战
    this.log("battle", "🔥 最终决战开始！");
    this.log("system", "🗝️ 使用三把钥匙打开火龙封印...");

    await this.aiThinking("最终决战分析", [
      "三把钥匙已齐全",
      "火龙封印正在解除",
      "准备最终决战",
      "集合所有力量",
      "为了艾泽拉斯大陆！",
    ]);

    await this.delay(3000);

    this.log("battle", "⚔️ 与火龙大魔王展开史诗级战斗...");
    await this.delay(3000);

    this.log("success", "🎉🎉🎉 恭喜！成功击败火龙大魔王！");
    this.log("success", "🌟 艾泽拉斯大陆得救了！");
    this.log("system", "🏆 你成为了传奇英雄！");

    // 游戏完成
    this.gameState.defeatedBosses.push("fire");
    this.updateBossStatus("fire", true);
    this.updateCurrentAction("游戏胜利！成为传奇英雄！");
  }

  // AI思维过程展示
  async aiThinking(title, steps) {
    this.log("thinking", `🧠 AI思维链：${title}`);

    const thinkingContainer = document.createElement("div");
    thinkingContainer.className = "thinking-process";

    for (let i = 0; i < steps.length; i++) {
      const stepEl = document.createElement("div");
      stepEl.className = "thinking-step";
      stepEl.textContent = steps[i];
      thinkingContainer.appendChild(stepEl);

      // 逐步显示思维过程
      document.getElementById("gameLog").appendChild(thinkingContainer);
      this.scrollToBottom();
      await this.delay(500);
    }
  }

  // 获取详细游戏状态
  getDetailedGameState() {
    return {
      player_level: this.gameState.level,
      current_location: this.gameState.location,
      equipment: this.gameState.equipment,
      keys: this.gameState.keys.length,
      defeated_dragons: this.gameState.defeatedBosses,
      available_tools: this.gameState.equipment,
      experience: this.gameState.experience,
    };
  }

  // 更新UI
  updateUI() {
    document.getElementById("playerLevel").textContent = this.gameState.level;
    document.getElementById("playerLocation").textContent =
      this.gameState.location;
    document.getElementById("keyCount").textContent =
      this.gameState.keys.length;

    // 更新装备列表
    const equipmentList = document.getElementById("equipmentList");
    equipmentList.innerHTML = "";
    this.gameState.equipment.forEach((item) => {
      const li = document.createElement("li");
      li.className = "equipment-item";
      li.textContent = item;
      equipmentList.appendChild(li);
    });
  }

  // 更新Boss状态
  updateBossStatus(bossType, defeated) {
    const bossCard = document.querySelector(`.boss-${bossType}`);
    if (bossCard) {
      if (defeated) {
        bossCard.classList.add("defeated");
        const statusEl = bossCard.querySelector(".status");
        statusEl.textContent = "已击败";

        // 添加钥匙图标
        const keyIcon = document.createElement("div");
        keyIcon.className = `key-icon key-${bossType}`;
        bossCard.appendChild(keyIcon);
      }
    }
  }

  // 设置处理状态
  setProcessing(processing) {
    this.isProcessing = processing;

    // 可以添加加载状态的UI反馈
    if (processing) {
      this.log("system", "🤖 AI正在处理...");
    }
  }

  // 更新当前行动
  updateCurrentAction(action) {
    document.getElementById("currentAction").textContent = action;
    document.getElementById("currentTask").textContent = action;
  }

  // 记录日志
  log(type, message) {
    const timestamp = new Date().toLocaleTimeString();

    const logEl = document.getElementById("gameLog");
    const messageEl = document.createElement("div");
    messageEl.className = `log-message log-${type}`;
    messageEl.innerHTML = `[${timestamp}] ${message}`;

    logEl.appendChild(messageEl);
    this.scrollToBottom();
  }

  // 滚动到底部
  scrollToBottom() {
    const logArea = document.getElementById("gameLog");
    setTimeout(() => {
      logArea.scrollTop = logArea.scrollHeight;
    }, 100);
  }

  // 清空日志
  clearLog() {
    document.getElementById("gameLog").innerHTML = "";
    this.log("system", "📜 日志已清空");
  }

  // 启动计时器
  startTimer() {
    this.startTime = Date.now();
    this.timer = setInterval(() => {
      if (this.startTime) {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById("gameTimer").textContent = `${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
    }, 1000);
  }

  // 停止计时器
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // 延迟函数
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// 全局错误处理
window.addEventListener("error", (e) => {
  console.error("游戏错误:", e.error);
});

// 防止页面刷新时丢失状态
window.addEventListener("beforeunload", (e) => {
  if (window.gameClient && window.gameClient.isProcessing) {
    e.preventDefault();
    e.returnValue = "游戏正在进行中，确定要离开吗？";
  }
});
