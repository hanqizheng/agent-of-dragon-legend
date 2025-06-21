const fetch = require("node-fetch");

class AIAgent {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.apiUrl = "https://api.deepseek.com/v1/chat/completions";

    // 游戏装备数据
    this.equipmentData = {
      火焰之剑: {
        type: "weapon",
        damage: 45,
        effect: "对冰系敌人造成额外伤害",
        weakness_target: ["ice"],
        description: "火焰附魔的神剑，能融化一切冰霜",
      },
      黑暗之剑: {
        type: "weapon",
        damage: 40,
        effect: "对雷系敌人造成额外伤害",
        weakness_target: ["thunder"],
        description: "暗黑力量凝聚的利剑，能吸收雷电",
      },
      圣光盾: {
        type: "armor",
        defense: 35,
        effect: "对毒系敌人免疫",
        weakness_target: ["poison"],
        description: "圣光护佑的盾牌，能净化毒素",
      },
      寒冰之剑: {
        type: "weapon",
        damage: 42,
        effect: "对火系敌人造成额外伤害",
        weakness_target: ["fire"],
        description: "冰霜之力的神剑，能冻结火焰",
      },
      基础剑: {
        type: "weapon",
        damage: 20,
        effect: "普通攻击",
        weakness_target: [],
        description: "新手使用的基础武器",
      },
      冰钥匙: {
        type: "key",
        damage: 0,
        effect: "开启火龙大魔王封印",
        weakness_target: ["fire"],
        description: "冰龙的钥匙，蕴含冰霜之力",
      },
      毒钥匙: {
        type: "key",
        damage: 0,
        effect: "开启火龙大魔王封印",
        weakness_target: ["fire"],
        description: "毒龙的钥匙，散发毒性能量",
      },
      雷钥匙: {
        type: "key",
        damage: 0,
        effect: "开启火龙大魔王封印",
        weakness_target: ["fire"],
        description: "雷龙的钥匙，闪烁雷电光芒",
      },
    };

    // 龙族Boss数据
    this.bossData = {
      冰龙: {
        type: "ice",
        hp: 800,
        weakness: ["fire"],
        abilities: ["冰霜吐息", "冰冷领域", "冰封攻击"],
        location: "寒冰群峰",
        requiredEquipment: "火焰之剑",
        keyReward: "冰钥匙",
      },
      毒龙: {
        type: "poison",
        hp: 750,
        weakness: ["holy"],
        abilities: ["毒雾喷射", "剧毒爪击", "毒素感染"],
        location: "剧毒深渊",
        requiredEquipment: "圣光盾",
        keyReward: "毒钥匙",
      },
      雷龙: {
        type: "thunder",
        hp: 850,
        weakness: ["dark"],
        abilities: ["雷电风暴", "电击冲撞", "雷鸣咆哮"],
        location: "雷霆内部",
        requiredEquipment: "黑暗之剑",
        keyReward: "雷钥匙",
      },
      火龙大魔王: {
        type: "fire",
        hp: 1500,
        weakness: ["ice"],
        abilities: ["地狱烈焰", "火焰风暴", "炽热冲击", "火焰护盾"],
        location: "火龙宫殿",
        requiredKeys: 3,
        requiredEquipment: "三把钥匙",
        special: "最终Boss，需要集齐三把钥匙",
      },
    };
  }

  // 核心能力1：任务拆分 (Task Decomposition)
  async decomposeTask(goal, gameState) {
    console.log("🧩 启动任务拆分能力...");

    const prompt = `你是一个专业的任务规划师，请分析以下游戏情况并制定详细的任务分解方案。

【当前目标】：${goal}

【玩家状态】：
- 等级：${gameState.player.level}
- 当前装备：${gameState.player.equipment.join(", ")}
- 钥匙数量：${gameState.player.keys}/3
- 已击败Boss：${gameState.player.defeatedBosses.join(", ") || "无"}

【游戏规则】：
- 冰龙：需要火焰之剑才能击败，击败后获得冰钥匙
- 毒龙：需要圣光盾才能击败，击败后获得毒钥匙  
- 雷龙：需要黑暗之剑才能击败，击败后获得雷钥匙
- 火龙大魔王：需要集齐3把钥匙才能挑战

请按照以下格式输出任务分解：

【思维过程】：
1. 目标分析：...
2. 现状评估：...
3. 差距识别：...
4. 策略制定：...

【任务分解】：
主要目标：...
前置条件：
- 条件1：...
- 条件2：...
执行步骤：
1. ...
2. ...
3. ...

【优先级建议】：...`;

    try {
      const response = await this.callDeepSeekAPI(prompt);
      return this.parseTaskDecomposition(response, goal);
    } catch (error) {
      console.error("任务分解API调用失败:", error);
      return this.getFallbackTaskDecomposition(goal, gameState);
    }
  }

  // 核心能力2：工具选择 (Tool Selection)
  async selectTools(targetBoss, gameState) {
    console.log("🛠️ 启动工具选择能力...");

    const bossInfo = this.bossData[targetBoss];
    if (!bossInfo) {
      console.error("未找到Boss信息:", targetBoss);
      return null;
    }

    const prompt = `你是一个装备专家，请分析以下战斗情况并推荐最佳装备选择。

【挑战目标】：${targetBoss}
【Boss特性】：
- 类型：${bossInfo.type}
- 生命值：${bossInfo.hp}
- 弱点：${bossInfo.weakness.join(", ")}
- 技能：${bossInfo.abilities.join(", ")}

【玩家装备】：
${gameState.player.equipment
  .map((eq) => {
    const data = this.equipmentData[eq];
    if (!data) {
      return `- ${eq}：特殊物品`;
    }
    return `- ${eq}：${data.description}（${data.effect}）`;
  })
  .join("\n")}

【可选装备详情】：
${Object.entries(this.equipmentData)
  .map(([name, data]) => `- ${name}：${data.description}，效果：${data.effect}`)
  .join("\n")}

请按照以下格式分析：

【思维过程】：
1. 敌人分析：...
2. 装备匹配：...
3. 策略选择：...
4. 风险评估：...

【推荐装备】：
最佳选择：...
理由：...
备选方案：...

【战斗建议】：...`;

    try {
      const response = await this.callDeepSeekAPI(prompt);
      return this.parseToolSelection(response, targetBoss, gameState);
    } catch (error) {
      console.error("工具选择API调用失败:", error);
      return this.getFallbackToolSelection(targetBoss, gameState);
    }
  }

  // 核心能力3：思维链推理 (Chain of Thought)
  async chainOfThought(situation, gameState) {
    console.log("🧠 启动思维链推理能力...");

    const prompt = `你是一个智能游戏助手，请用思维链的方式分析以下情况。

【当前情况】：${situation}

【玩家状态】：
- 等级：${gameState.player.level}
- 装备：${gameState.player.equipment.join(", ")}
- 钥匙：${gameState.player.keys}/3
- 位置：${gameState.player.location}

请按照思维链的方式逐步分析：

【第1步 - 问题理解】：
我需要理解什么问题？
当前面临的核心问题是什么？

【第2步 - 信息收集】：
我拥有哪些关键信息？
还缺少什么信息？

【第3步 - 逻辑分析】：
基于已有信息，我可以得出什么结论？
有哪些可能的选择？

【第4步 - 方案评估】：
每个选择的优缺点是什么？
最优方案是什么？

【第5步 - 行动建议】：
具体应该怎么做？
下一步的行动计划是什么？

【第6步 - 风险预案】：
可能遇到什么问题？
如何应对？

请详细展示每一步的思考过程。`;

    try {
      const response = await this.callDeepSeekAPI(prompt);
      return this.parseChainOfThought(response);
    } catch (error) {
      console.error("思维链推理API调用失败:", error);
      return this.getFallbackChainOfThought(situation, gameState);
    }
  }

  // 调用DeepSeek API
  async callDeepSeekAPI(prompt) {
    if (!this.apiKey || this.apiKey === "your_deepseek_api_key_here") {
      throw new Error("DeepSeek API密钥未设置");
    }

    console.log("🔧 调用DeepSeek API:", {
      url: this.apiUrl,
      hasApiKey: !!this.apiKey,
      apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 10) + "..." : "无",
    });

    const requestBody = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是一个专业的游戏AI助手，擅长分析游戏策略、装备选择和任务规划。请用中文回答，并保持逻辑清晰、分析深入。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
      tool_choice: "none", // 明确指定不使用工具
    };

    console.log("📋 请求体:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API错误:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`API请求失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ DeepSeek API调用成功:", {
      status: response.status,
      hasChoices: !!data.choices,
      choicesCount: data.choices?.length || 0,
    });

    return data.choices[0].message.content;
  }

  // 解析任务分解结果
  parseTaskDecomposition(response, goal) {
    const thinking = this.extractThinkingSteps(response);
    const decomposition = this.extractTaskStructure(response);

    return {
      capability: "任务拆分",
      thinking: thinking,
      decomposition: decomposition,
      originalResponse: response,
    };
  }

  // 解析工具选择结果
  parseToolSelection(response, targetBoss, gameState) {
    const thinking = this.extractThinkingSteps(response);
    const tools = this.generateToolOptions(targetBoss, gameState);
    const recommendedTool = this.extractRecommendedTool(response);

    return {
      capability: "工具选择",
      thinking: thinking,
      tools: tools,
      correctTool: this.bossData[targetBoss].requiredEquipment,
      aiRecommendation: recommendedTool,
      originalResponse: response,
    };
  }

  // 解析思维链推理结果
  parseChainOfThought(response) {
    const steps = this.extractChainOfThoughtSteps(response);

    return {
      capability: "思维链推理",
      thinking: steps,
      originalResponse: response,
    };
  }

  // 提取思维步骤
  extractThinkingSteps(response) {
    const steps = [];
    const lines = response.split("\n");

    for (let line of lines) {
      if (line.match(/^\d+\./)) {
        steps.push(line.trim());
      } else if (line.includes("：") && line.length > 10) {
        steps.push(line.trim());
      }
    }

    return steps.length > 0
      ? steps
      : ["正在分析游戏情况...", "制定最优策略中...", "分析完成！"];
  }

  // 提取任务结构
  extractTaskStructure(response) {
    const mainGoalMatch = response.match(/主要目标[：:]\s*([^\n]+)/);
    const prerequisitesMatch = response.match(/前置条件[：:]([^执行步骤]*)/);
    const stepsMatch = response.match(/执行步骤[：:]([^优先级]*)/);

    return {
      mainGoal: mainGoalMatch ? mainGoalMatch[1].trim() : "完成当前挑战",
      prerequisites: prerequisitesMatch
        ? prerequisitesMatch[1]
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .map((line) => line.trim())
        : [],
      steps: stepsMatch
        ? stepsMatch[1]
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .map((line) => line.trim())
        : ["执行战斗计划"],
    };
  }

  // 生成工具选项
  generateToolOptions(targetBoss, gameState) {
    const tools = [];

    // 添加玩家当前装备
    gameState.player.equipment.forEach((equipment) => {
      const data = this.equipmentData[equipment];
      tools.push({
        name: equipment,
        image: this.getEquipmentImage(equipment),
        description: data.description,
        isRecommended:
          equipment === this.bossData[targetBoss].requiredEquipment,
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
        description: "释放魔法",
        isRecommended: false,
      },
    ];

    return [...tools, ...distractors];
  }

  // 提取推荐工具
  extractRecommendedTool(response) {
    const recommendMatch = response.match(/最佳选择[：:]\s*([^\n]+)/);
    return recommendMatch ? recommendMatch[1].trim() : "火焰之剑";
  }

  // 提取思维链步骤
  extractChainOfThoughtSteps(response) {
    const steps = [];
    const stepMatches = response.match(/【第\d+步[^】]*】[：:]([^【]*)/g);

    if (stepMatches) {
      stepMatches.forEach((match) => {
        const content = match.replace(/【第\d+步[^】]*】[：:]/, "").trim();
        if (content) {
          steps.push(content);
        }
      });
    }

    return steps.length > 0
      ? steps
      : [
          "分析当前情况和可用选项",
          "评估每个选择的优缺点",
          "制定最优行动方案",
          "预测可能的结果",
        ];
  }

  // 获取装备图片
  getEquipmentImage(equipment) {
    const imageMap = {
      基础剑: "normal_sword.webp",
      火焰之剑: "fire_sword.jpg",
      黑暗之剑: "dark_sword.webp",
      圣光盾: "god_light_shield.png",
      寒冰之剑: "ice_sword.jpeg",
      冰钥匙: "ice_key.webp",
      毒钥匙: "poison_key.jpeg",
      雷钥匙: "thunder_key.avif",
    };
    return imageMap[equipment] || "shield.png";
  }

  // 降级处理 - 任务分解
  getFallbackTaskDecomposition(goal, gameState) {
    const thinking = [
      "🎯 分析目标：" + goal,
      "📊 评估当前状态：等级" +
        gameState.player.level +
        "，装备" +
        gameState.player.equipment.length +
        "件",
      "🔍 识别差距：分析所需条件",
      "📋 制定计划：逐步完成前置任务",
    ];

    let decomposition = {
      mainGoal: goal,
      prerequisites: [],
      steps: ["制定战斗计划", "准备必要装备", "执行挑战"],
    };

    if (goal.includes("火龙")) {
      const needKeys = 3 - gameState.player.keys;
      if (needKeys > 0) {
        decomposition.prerequisites = [
          "获得冰钥匙（击败冰龙）",
          "获得毒钥匙（击败毒龙）",
          "获得雷钥匙（击败雷龙）",
        ].slice(0, needKeys);
      }
    }

    return {
      capability: "任务拆分",
      thinking: thinking,
      decomposition: decomposition,
    };
  }

  // 降级处理 - 工具选择
  getFallbackToolSelection(targetBoss, gameState) {
    const bossInfo = this.bossData[targetBoss];
    const thinking = [
      "🔧 分析目标：" + targetBoss,
      "📊 评估装备：检查可用装备",
      "🎯 匹配弱点：寻找克制装备",
      "💡 推荐方案：选择最佳装备",
    ];

    const tools = this.generateToolOptions(targetBoss, gameState);

    return {
      capability: "工具选择",
      thinking: thinking,
      tools: tools,
      correctTool: bossInfo.requiredEquipment,
      aiRecommendation: bossInfo.requiredEquipment,
    };
  }

  // 降级处理 - 思维链推理
  getFallbackChainOfThought(situation, gameState) {
    const thinking = [
      "🧠 问题理解：" + situation,
      "📊 信息收集：当前等级" +
        gameState.player.level +
        "，装备" +
        gameState.player.equipment.join(","),
      "🔍 逻辑分析：基于游戏规则进行推理",
      "💡 方案评估：比较各种可能的行动",
      "🎯 行动建议：制定最优策略",
      "⚠️ 风险预案：准备应对措施",
    ];

    return {
      capability: "思维链推理",
      thinking: thinking,
    };
  }
}

module.exports = AIAgent;
