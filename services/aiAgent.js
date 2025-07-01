const fetch = require("node-fetch");

class AIAgent {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.apiUrl = "https://api.deepseek.com/v1/chat/completions";

    // 装备数据 - 严格的效果定义
    this.equipmentData = {
      基础剑: {
        description: "最基础的武器",
        effect: "对所有龙族都无效",
        strictRule: "基础剑对所有龙族完全无效，无法造成任何伤害",
      },
      火焰之剑: {
        description: "火焰附魔的神剑，能融化一切冰霜",
        effect: "【仅对冰龙有效】，对其他龙族完全无伤害",
        strictRule:
          "火焰之剑只能对冰龙造成伤害，对毒龙、雷龙、火龙大魔王完全无效",
      },
      暗黑之剑: {
        description: "充满暗黑力量的魔剑，雷电克制",
        effect: "【仅对雷龙有效】，对其他龙族完全无伤害",
        strictRule:
          "暗黑之剑只能对雷龙造成伤害，对冰龙、毒龙、火龙大魔王完全无效",
      },
      圣光盾: {
        description: "圣光护佑的盾牌，能净化毒素",
        effect: "【仅对毒龙有效】，对其他龙族完全无效",
        strictRule:
          "圣光盾只能对毒龙进行净化，对冰龙、雷龙、火龙大魔王完全无效",
      },
      寒冰之剑: {
        description: "蕴含冰霜之力的神剑",
        effect: "对所有龙族都无效，龙族对冰冻免疫",
        strictRule: "寒冰之剑对所有龙族完全无效，龙族天生对冰冻免疫",
      },
      冰钥匙: {
        description: "冰龙的钥匙，封印着冰龙的力量",
        effect: "用于封印火龙大魔王",
        strictRule: "冰钥匙是击败火龙大魔王的三把钥匙之一",
      },
      毒钥匙: {
        description: "毒龙的钥匙，封印着毒龙的力量",
        effect: "用于封印火龙大魔王",
        strictRule: "毒钥匙是击败火龙大魔王的三把钥匙之一",
      },
      雷钥匙: {
        description: "雷龙的钥匙，封印着雷龙的力量",
        effect: "用于封印火龙大魔王",
        strictRule: "雷钥匙是击败火龙大魔王的三把钥匙之一",
      },
    };

    // Boss数据 - 严格的武器克制关系
    this.bossData = {
      冰龙: {
        type: "ice",
        hp: 500,
        weakness: "火焰属性",
        abilities: ["冰霜吐息", "寒冰护甲", "冰冻攻击"],
        requiredEquipment: "火焰之剑",
        immuneTo: ["暗黑之剑", "圣光盾", "寒冰之剑", "基础剑"],
        strictRule:
          "冰龙【仅受火焰之剑伤害】，对其他所有武器完全免疫，任何其他武器都无法造成任何伤害",
        keyReward: "冰钥匙",
      },
      毒龙: {
        type: "poison",
        hp: 750,
        weakness: "圣光属性",
        abilities: ["毒雾喷射", "剧毒爪击", "毒素感染"],
        requiredEquipment: "圣光盾",
        immuneTo: ["火焰之剑", "暗黑之剑", "寒冰之剑", "基础剑"],
        strictRule:
          "毒龙【仅受圣光盾净化】，对其他所有武器完全免疫，任何其他武器都无法造成任何伤害",
        keyReward: "毒钥匙",
      },
      雷龙: {
        type: "thunder",
        hp: 600,
        weakness: "暗黑属性",
        abilities: ["雷电吐息", "电磁护盾", "闪电风暴"],
        requiredEquipment: "暗黑之剑",
        immuneTo: ["火焰之剑", "圣光盾", "寒冰之剑", "基础剑"],
        strictRule:
          "雷龙【仅受暗黑之剑伤害】，对其他所有武器完全免疫，任何其他武器都无法造成任何伤害",
        keyReward: "雷钥匙",
      },
      火龙大魔王: {
        type: "fire",
        hp: 1000,
        weakness: "三把龙族钥匙的封印力量",
        abilities: ["烈焰吐息", "火焰护甲", "炎爆术", "烈火风暴"],
        requiredEquipment: "冰钥匙、毒钥匙、雷钥匙",
        immuneTo: ["所有普通武器"],
        strictRule:
          "火龙大魔王【仅能被三把龙钥匙的封印力量击败】，对所有普通武器完全免疫",
        keyReward: null,
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

【严格的战斗规则】：
⚠️ 重要：每种龙只受特定武器伤害，对其他所有武器完全免疫！
- 冰龙：【仅火焰之剑有效】，对暗黑之剑、圣光盾、寒冰之剑、基础剑完全免疫
- 毒龙：【仅圣光盾有效】，对火焰之剑、暗黑之剑、寒冰之剑、基础剑完全免疫
- 雷龙：【仅暗黑之剑有效】，对火焰之剑、圣光盾、寒冰之剑、基础剑完全免疫
- 火龙大魔王：【仅三把钥匙同时使用才有效】，对所有普通武器完全免疫

❌ 任何未明确标注有效的武器对目标龙都完全无效
❌ 不要基于常识或其他游戏经验做推理，严格按照上述规则

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

    // 构建可用装备的tools
    const availableTools = this.buildEquipmentTools(gameState);

    const prompt = `你是一个装备专家，正在为挑战${targetBoss}选择最佳装备组合。

⚠️【重要：严格的武器克制规则】⚠️
${bossInfo.strictRule}

【挑战目标】：${targetBoss}
【Boss详细信息】：
- 类型：${bossInfo.type}
- 生命值：${bossInfo.hp}
- 唯一弱点：${bossInfo.weakness}
- 完全免疫：${bossInfo.immuneTo.join(", ")}
- 技能：${bossInfo.abilities.join(", ")}
- 【严格规则】：${bossInfo.strictRule}

【玩家当前装备详情】：
${gameState.player.equipment
  .map((eq) => {
    const data = this.equipmentData[eq] || {
      description: "特殊物品",
      effect: "未知效果",
      strictRule: "效果未知",
    };
    return `- ${eq}：${data.description}
  ├─ 效果：${data.effect}
  └─ 规则：${data.strictRule || "无特殊规则"}`;
  })
  .join("\n")}

【关键限制】：
❌ 除了${bossInfo.requiredEquipment}之外，其他所有武器对${targetBoss}完全无效
❌ 不要基于常识推理，严格按照上述规则选择
❌ 只能选择唯一有效的武器：${bossInfo.requiredEquipment}

请严格按照以上规则选择装备，不要选择无效武器。`;

    try {
      const response = await this.callDeepSeekAPIWithTools(
        prompt,
        availableTools
      );
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

⚠️【游戏核心规则 - 严格武器克制】⚠️
- 冰龙：【仅火焰之剑有效】，对暗黑之剑、圣光盾、寒冰之剑、基础剑完全免疫
- 毒龙：【仅圣光盾有效】，对火焰之剑、暗黑之剑、寒冰之剑、基础剑完全免疫
- 雷龙：【仅暗黑之剑有效】，对火焰之剑、圣光盾、寒冰之剑、基础剑完全免疫
- 火龙大魔王：【仅三把钥匙同时使用才有效】，对所有普通武器完全免疫
❌ 任何未明确标注有效的武器对目标龙都完全无效，不要基于常识推理

【当前情况】：${situation}

【玩家状态】：
- 等级：${gameState.player.level}
- 装备：${gameState.player.equipment.join(", ")}
- 钥匙：${gameState.player.keys}/3
- 位置：${gameState.player.location}
- 已击败Boss：${gameState.player.defeatedBosses?.join(", ") || "无"}

【装备效果严格定义】：
${gameState.player.equipment
  .map((eq) => {
    const data = this.equipmentData[eq] || {
      effect: "未知效果",
      strictRule: "效果未知",
    };
    return `- ${eq}：${data.effect}`;
  })
  .join("\n")}

请按照思维链的方式逐步分析，严格遵守上述武器克制规则：

【第1步 - 问题理解】：
我需要理解什么问题？
当前面临的核心问题是什么？

【第2步 - 信息收集】：
我拥有哪些关键信息？
基于严格的武器克制规则，哪些装备有效？

【第3步 - 逻辑分析】：
基于严格的游戏规则，我可以得出什么结论？
哪些选择是有效的？哪些是完全无效的？

【第4步 - 方案评估】：
每个有效选择的优缺点是什么？
最优方案是什么？

【第5步 - 行动建议】：
具体应该怎么做？
下一步的行动计划是什么？

【第6步 - 风险预案】：
可能遇到什么问题？
如何应对？

请详细展示每一步的思考过程，严格按照游戏规则分析。`;

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
    // response现在是完整的API响应数据
    const message = response.choices?.[0]?.message;
    const content = message?.content || "";
    const toolCalls = message?.tool_calls || [];

    // 英文函数名到中文装备名称的反向映射
    const functionNameMap = {
      fire_sword: "火焰之剑",
      ice_sword: "寒冰之剑",
      dark_sword: "暗黑之剑",
      normal_sword: "普通剑",
      basic_sword: "基础剑",
      holy_shield: "圣光盾",
      normal_shield: "普通盾牌",
      poison_key: "毒钥匙",
      thunder_key: "雷钥匙",
      ice_key: "冰钥匙",
      healing_potion: "治疗药水",
      magic_scroll: "魔法卷轴",
    };

    console.log("🔍 解析工具选择结果:", {
      hasContent: !!content,
      toolCallsCount: toolCalls.length,
      toolCalls: toolCalls.map((tc) => tc.function?.name),
    });

    let thinking = content || "AI正在分析装备选择...";
    let selectedTools = [];
    let recommendedEquipment = [];

    // 处理AI选择的工具
    if (toolCalls.length > 0) {
      toolCalls.forEach((toolCall) => {
        if (toolCall.function) {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments || "{}");

          // 从函数名提取装备名称 - 使用映射表
          const englishName = functionName.replace(/^use_/, "");
          const equipmentName =
            functionNameMap[englishName] || englishName.replace(/_/g, " ");

          selectedTools.push({
            name: equipmentName,
            reason: args.reason || "AI推荐使用",
            target: args.target || targetBoss,
            image: this.getEquipmentImage(equipmentName),
            isRecommended: true,
          });

          recommendedEquipment.push(equipmentName);
        }
      });
    }

    // 生成所有可用工具选项
    const allTools = this.generateToolOptions(targetBoss, gameState);

    // 标记推荐的装备
    allTools.forEach((tool) => {
      if (recommendedEquipment.includes(tool.name)) {
        tool.isRecommended = true;
        tool.aiSelected = true;
      }
    });

    return {
      capability: "工具选择",
      thinking: thinking,
      selectedTools: selectedTools, // AI选择的工具
      tools: allTools, // 所有可用工具
      recommendedEquipment: recommendedEquipment,
      toolCallsUsed: toolCalls.length > 0,
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
      暗黑之剑: "dark_sword.webp",
      圣光盾: "god_light_shield.png",
      神圣护盾: "god_light_shield.png",
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

  // 构建可用装备的tools
  buildEquipmentTools(gameState) {
    const tools = [];

    // 装备名称到英文函数名的映射
    const equipmentNameMap = {
      火焰之剑: "fire_sword",
      暗黑之剑: "dark_sword",
      寒冰之剑: "ice_sword",
      普通剑: "normal_sword",
      基础剑: "basic_sword",
      圣光盾: "holy_shield",
      神圣护盾: "holy_shield", // 添加神圣护盾的映射
      普通盾牌: "normal_shield",
      毒钥匙: "poison_key",
      雷钥匙: "thunder_key",
      冰钥匙: "ice_key",
      治疗药水: "healing_potion",
      魔法卷轴: "magic_scroll",
    };

    // 为每个装备创建一个工具
    gameState.player.equipment.forEach((equipment) => {
      const data = this.equipmentData[equipment] || {
        description: "特殊物品",
        effect: "未知效果",
        strictRule: "效果未知",
      };

      // 获取英文函数名
      const englishName =
        equipmentNameMap[equipment] ||
        equipment.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");

      tools.push({
        type: "function",
        function: {
          name: `use_${englishName}`,
          description: `使用装备：${equipment}。${
            data.description
          }。严格效果：${data.effect}。规则：${
            data.strictRule || "无特殊规则"
          }`,
          parameters: {
            type: "object",
            properties: {
              target: {
                type: "string",
                description: "使用装备的目标",
              },
              reason: {
                type: "string",
                description: "选择这个装备的理由（必须基于严格的克制规则）",
              },
            },
            required: ["target", "reason"],
          },
        },
      });
    });

    return tools;
  }

  // 调用DeepSeek API并使用tools
  async callDeepSeekAPIWithTools(prompt, tools) {
    if (!this.apiKey || this.apiKey === "your_deepseek_api_key_here") {
      throw new Error("DeepSeek API密钥未设置");
    }

    console.log("🔧 调用DeepSeek API with Tools:", {
      url: this.apiUrl,
      hasApiKey: !!this.apiKey,
      apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 10) + "..." : "无",
      toolsCount: tools.length,
    });

    const requestBody = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是一个专业的游戏AI助手，擅长分析游戏策略、装备选择和任务规划。当你需要推荐装备时，请使用提供的装备工具来表达你的选择。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
      tools: tools,
      tool_choice: "auto", // 让AI自动选择是否使用工具
    };

    console.log("📋 请求体 (Tools):", JSON.stringify(requestBody, null, 2));

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
    console.log("✅ DeepSeek API调用成功 (Tools):", {
      status: response.status,
      hasChoices: !!data.choices,
      choicesCount: data.choices?.length || 0,
      hasToolCalls: !!data.choices?.[0]?.message?.tool_calls,
    });

    return data; // 返回完整的响应数据，包含tool_calls
  }
}

module.exports = AIAgent;
