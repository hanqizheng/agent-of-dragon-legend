// 游戏状态管理服务
class GameStateManager {
  constructor() {
    this.sessions = new Map();
    this.defaultState = this.createDefaultState();
  }

  createDefaultState() {
    return {
      player: {
        name: "勇敢的冒险者",
        level: 1,
        health: 100,
        maxHealth: 100,
        gold: 1000,
        location: "新手村",
        equipment: [],
        items: [],
        keys: 0, // 龙之钥匙数量
        defeatedDragons: [], // 已击败的龙
        availableRegions: ["冰原", "毒沼", "雷鸣山"], // 可前往的地区
      },
      gameProgress: {
        currentObjective: "收集装备，准备挑战第一条龙",
        phase: "preparation", // preparation, dragon_hunting, final_boss
        nextTarget: null, // 下一个目标龙
        completedTasks: [],
        availableTasks: [
          "前往冰原收集火焰装备",
          "前往毒沼收集净化装备",
          "前往雷鸣山收集绝缘装备",
        ],
      },
      world: {
        regions: {
          冰原: {
            dragon: "冰龙",
            requiredEquipment: ["火焰剑", "防火盾牌", "火焰抗性药水"],
            available: true,
            description: "寒冷的冰雪世界，冰龙在此守护着第一把钥匙",
          },
          毒沼: {
            dragon: "毒龙",
            requiredEquipment: ["净化法球", "防毒面具", "毒抗性药水"],
            available: true,
            description: "充满毒气的沼泽地，毒龙隐藏在毒雾深处",
          },
          雷鸣山: {
            dragon: "雷龙",
            requiredEquipment: ["雷电法杖", "绝缘护甲", "雷电抗性药水"],
            available: true,
            description: "雷电交加的高山，雷龙控制着天空的力量",
          },
          火龙宫殿: {
            dragon: "火龙大魔王",
            requiredEquipment: ["冰霜剑", "抗寒斗篷", "冰霜抗性药水"],
            available: false, // 需要3把钥匙才能解锁
            description: "最终的决战之地，火龙大魔王等待着最后的挑战",
          },
        },
      },
      victoryCondition: null,
    };
  }

  getGameState(sessionId = "default") {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(
        sessionId,
        JSON.parse(JSON.stringify(this.defaultState))
      );
    }
    return this.sessions.get(sessionId);
  }

  updateGameState(sessionId, updates) {
    const state = this.getGameState(sessionId);

    // 深度合并更新
    this.deepMerge(state, updates);

    // 检查游戏进度和胜利条件
    this.checkGameProgress(state);

    return state;
  }

  // 执行游戏动作 - 简化版本
  executeAction(sessionId, action) {
    const state = this.getGameState(sessionId);

    try {
      if (action.startsWith("前往")) {
        return this.handleTravelAction(state, action);
      } else if (action.startsWith("挑战") || action.startsWith("击败")) {
        return this.handleCombatAction(state, action);
      } else if (action.startsWith("收集") || action.startsWith("获取")) {
        return this.handleCollectAction(state, action);
      } else {
        return this.handleGeneralAction(state, action);
      }
    } catch (error) {
      return {
        success: false,
        error: `执行动作失败: ${error.message}`,
        gameState: state,
      };
    }
  }

  // 处理前往地区的动作
  handleTravelAction(state, action) {
    const regions = ["冰原", "毒沼", "雷鸣山", "火龙宫殿"];
    const targetRegion = regions.find((region) => action.includes(region));

    if (!targetRegion) {
      return {
        success: false,
        error: "未找到目标地区",
        gameState: state,
      };
    }

    // 检查火龙宫殿是否可访问
    if (targetRegion === "火龙宫殿" && state.player.keys < 3) {
      return {
        success: false,
        error: "需要收集3把龙之钥匙才能进入火龙宫殿！",
        gameState: state,
      };
    }

    state.player.location = targetRegion;
    const regionInfo = state.world.regions[targetRegion];

    // 自动获取该地区的推荐装备
    const obtainedEquipment = [];
    regionInfo.requiredEquipment.forEach((equipment) => {
      if (!state.player.equipment.includes(equipment)) {
        state.player.equipment.push(equipment);
        obtainedEquipment.push(equipment);
      }
    });

    // 更新游戏进度
    this.updateProgressAfterTravel(state, targetRegion);

    return {
      success: true,
      result: `成功前往${targetRegion}！${
        obtainedEquipment.length > 0
          ? `获得装备：${obtainedEquipment.join(", ")}`
          : "你已经拥有所需装备"
      }`,
      gameState: state,
      obtainedEquipment,
    };
  }

  // 处理战斗动作
  handleCombatAction(state, action) {
    const dragons = ["冰龙", "毒龙", "雷龙", "火龙大魔王"];
    const targetDragon = dragons.find((dragon) => action.includes(dragon));

    if (!targetDragon) {
      return {
        success: false,
        error: "未找到目标敌人",
        gameState: state,
      };
    }

    // 检查是否有足够装备
    const requiredRegion = Object.keys(state.world.regions).find(
      (region) => state.world.regions[region].dragon === targetDragon
    );

    const requiredEquipment =
      state.world.regions[requiredRegion].requiredEquipment;
    const hasAllEquipment = requiredEquipment.every((eq) =>
      state.player.equipment.includes(eq)
    );

    if (!hasAllEquipment) {
      const missingEquipment = requiredEquipment.filter(
        (eq) => !state.player.equipment.includes(eq)
      );
      return {
        success: false,
        error: `装备不足！还需要：${missingEquipment.join(", ")}`,
        gameState: state,
      };
    }

    // 击败龙
    if (!state.player.defeatedDragons.includes(targetDragon)) {
      state.player.defeatedDragons.push(targetDragon);

      if (targetDragon !== "火龙大魔王") {
        state.player.keys++;
        state.player.level += 10;
        state.player.gold += 500;
      }
    }

    // 检查胜利条件
    if (targetDragon === "火龙大魔王") {
      state.victoryCondition = {
        achieved: true,
        message: "🎉 恭喜！你成功击败了火龙大魔王，拯救了世界！",
        suggestedActions: ["重新开始冒险"],
      };
      state.gameProgress.phase = "completed";
    } else {
      // 解锁火龙宫殿
      if (state.player.keys >= 3) {
        state.world.regions["火龙宫殿"].available = true;
        state.gameProgress.currentObjective = "前往火龙宫殿，挑战最终BOSS！";
        state.gameProgress.phase = "final_boss";
      }
    }

    return {
      success: true,
      result: `🎉 成功击败${targetDragon}！${
        targetDragon !== "火龙大魔王"
          ? `获得龙之钥匙 (${state.player.keys}/3)`
          : ""
      }`,
      gameState: state,
    };
  }

  // 处理收集动作
  handleCollectAction(state, action) {
    return {
      success: true,
      result: "请先前往对应地区获取装备！",
      gameState: state,
    };
  }

  // 处理一般动作
  handleGeneralAction(state, action) {
    return {
      success: true,
      result: `执行了动作：${action}`,
      gameState: state,
    };
  }

  // 更新前往地区后的进度
  updateProgressAfterTravel(state, region) {
    const regionDragon = state.world.regions[region].dragon;

    if (!state.player.defeatedDragons.includes(regionDragon)) {
      state.gameProgress.nextTarget = regionDragon;
      state.gameProgress.currentObjective = `挑战${regionDragon}，获取龙之钥匙`;
    }

    // 更新可用任务
    state.gameProgress.availableTasks =
      state.gameProgress.availableTasks.filter(
        (task) => !task.includes(region)
      );
  }

  // 检查游戏进度
  checkGameProgress(state) {
    const defeatedCount = state.player.defeatedDragons.length;

    if (defeatedCount === 0) {
      state.gameProgress.phase = "preparation";
      state.gameProgress.currentObjective = "收集装备，准备挑战第一条龙";
    } else if (defeatedCount < 3) {
      state.gameProgress.phase = "dragon_hunting";
      state.gameProgress.currentObjective = `已击败${defeatedCount}/3条龙，继续收集钥匙`;
    } else if (defeatedCount === 3) {
      state.gameProgress.phase = "final_boss";
      state.gameProgress.currentObjective = "前往火龙宫殿，挑战最终BOSS！";
      state.world.regions["火龙宫殿"].available = true;
    }
  }

  // 重置游戏
  resetGame(sessionId) {
    this.sessions.set(sessionId, JSON.parse(JSON.stringify(this.defaultState)));
    return this.getGameState(sessionId);
  }

  // 深度合并对象
  deepMerge(target, source) {
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        if (!target[key]) target[key] = {};
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
}

module.exports = GameStateManager;
