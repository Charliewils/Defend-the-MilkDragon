import { TOWER_ORDER } from '../config/constants.js';
import { TOWER_CONFIGS } from '../config/towers.js';

const DIFFICULTY_TRAIN_OPTS = {
  iterations: 2000,
  errorThresh: 0.005,
  learningRate: 0.3
};

const TOWER_TRAIN_OPTS = {
  iterations: 2000,
  errorThresh: 0.005,
  learningRate: 0.3
};

const TOWER_DISPLAY_NAMES = {
  normal: '普通炮台',
  ice: '冷冻炮台',
  titan: '擎天炮台',
  hell: '地狱炮台',
  lava: '熔岩炮台',
  spread: '散射炮台',
  butter: '黄油炮台'
};

const DIFFICULTY_ANCHORS = [
  { input: [1.0, 0.25, 0.35, 0.88, 0.0], output: [1.3] },
  { input: [1.0, 0.55, 0.48, 0.62, 0.08], output: [1.1] },
  { input: [0.5, 0.55, 0.52, 0.5, 0.0], output: [1.0] },
  { input: [0.5, 0.82, 0.58, 0.38, 0.12], output: [0.9] },
  { input: [0.28, 0.92, 0.68, 0.28, 0.32], output: [0.7] },
  { input: [0.12, 1.0, 0.78, 0.18, 0.48], output: [0.6] }
];

const TOWER_SCENARIO_ANCHORS = [
  {
    input: [0.15, 0.12, 0.55, 0.08, 0.05, 0, 0.65, 0.45],
    output: [0.15, 0.1, 0.12, 0.1, 0.08, 0.95, 0.12]
  },
  {
    input: [0.2, 0.48, 0.1, 0.08, 0.05, 0, 0.6, 0.4],
    output: [0.12, 0.9, 0.1, 0.1, 0.08, 0.15, 0.8]
  },
  {
    input: [0.18, 0.15, 0.1, 0.12, 0.35, 1, 0.7, 0.55],
    output: [0.1, 0.12, 0.92, 0.15, 0.1, 0.2, 0.1]
  },
  {
    input: [0.15, 0.12, 0.1, 0.42, 0.08, 0, 0.55, 0.5],
    output: [0.1, 0.12, 0.75, 0.12, 0.88, 0.15, 0.1]
  },
  {
    input: [0.55, 0.15, 0.08, 0.1, 0.05, 0, 0.62, 0.35],
    output: [0.12, 0.1, 0.15, 0.9, 0.12, 0.85, 0.1]
  },
  {
    input: [0.28, 0.22, 0.18, 0.15, 0.12, 0, 0.72, 0.25],
    output: [0.55, 0.45, 0.5, 0.48, 0.52, 0.5, 0.48]
  },
  {
    input: [0.25, 0.2, 0.2, 0.18, 0.12, 0, 0.22, 0.3],
    output: [0.85, 0.55, 0.2, 0.35, 0.25, 0.4, 0.45]
  }
];

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpVec(a, b, t) {
  return a.map((v, i) => lerp(v, b[i], t));
}

function jitter(vec, amount = 0.04) {
  return vec.map((v) => clamp01(v + (Math.random() - 0.5) * amount * 2));
}

function generateInterpolatedSamples(anchors, count, outputSize) {
  const samples = [];
  const segments = anchors.length - 1;
  const perSegment = Math.ceil(count / segments);

  for (let s = 0; s < segments; s += 1) {
    const a = anchors[s];
    const b = anchors[s + 1];
    for (let i = 0; i < perSegment && samples.length < count; i += 1) {
      const t = perSegment <= 1 ? 0.5 : i / (perSegment - 1);
      const input = jitter(lerpVec(a.input, b.input, t), 0.05);
      const output = lerpVec(a.output, b.output, t).map((v) =>
        outputSize === 1 ? clamp01(v) : clamp01(v)
      );
      samples.push({ input, output });
    }
  }

  while (samples.length < count) {
    const anchor = anchors[Math.floor(Math.random() * anchors.length)];
    samples.push({
      input: jitter(anchor.input, 0.06),
      output: [...anchor.output]
    });
  }

  return samples.slice(0, count);
}

function getBrain() {
  const brain = globalThis.brain;
  if (!brain?.NeuralNetwork) {
    throw new Error('brain.js 未加载，请在 index.html 中引入 CDN 脚本');
  }
  return brain;
}

export function analyzeSpawnQueue(spawnQueue) {
  const counts = {
    normal: 0,
    rush: 0,
    stealth: 0,
    armor: 0,
    split_worm: 0,
    squad: 0,
    boss: 0
  };
  let total = 0;

  for (const entry of spawnQueue) {
    const units = entry.type === 'squad' ? 4 : 1;
    total += units;
    if (counts[entry.type] !== undefined) {
      counts[entry.type] += units;
    } else if (entry.type === 'mini_split_worm') {
      counts.split_worm += units;
    }
  }

  if (total === 0) {
    return {
      normalEnemyRatio: 0.5,
      rushEnemyRatio: 0,
      stealthEnemyRatio: 0,
      armorEnemyRatio: 0,
      splitWormRatio: 0,
      hasBoss: 0,
      squadRatio: 0
    };
  }

  return {
    normalEnemyRatio: clamp01((counts.normal + counts.squad * 0.25) / total),
    rushEnemyRatio: clamp01(counts.rush / total),
    stealthEnemyRatio: clamp01(counts.stealth / total),
    armorEnemyRatio: clamp01(counts.armor / total),
    splitWormRatio: clamp01(counts.split_worm / total),
    hasBoss: counts.boss > 0 ? 1 : 0,
    squadRatio: clamp01(counts.squad / total)
  };
}

export class GameAI {
  constructor() {
    const brain = getBrain();
    this.difficultyNet = new brain.NeuralNetwork({
      hiddenLayers: [8],
      activation: 'sigmoid'
    });
    this.towerNet = new brain.NeuralNetwork({
      hiddenLayers: [12],
      activation: 'sigmoid'
    });

    this.difficultyTrained = false;
    this.towerTrained = false;
    this.trainingPromise = null;

    this.difficultyScale = 1;
    this.displayDifficultyScale = 1;
    this.targetDifficultyScale = 1;

    this.lastFeatures = {
      hpRatio: 1,
      avgClearTime: 0.5,
      goldUsageRate: 0,
      towerUtilization: 0,
      leakRate: 0
    };

    this.towerRecommendation = {
      primary: TOWER_ORDER[0],
      secondary: TOWER_ORDER[1],
      scores: TOWER_ORDER.map(() => 0),
      confidence: 0,
      reason: ''
    };
  }

  trainAll() {
    if (this.trainingPromise) return this.trainingPromise;

    this.trainingPromise = new Promise((resolve) => {
      setTimeout(() => {
        const difficultyData = generateInterpolatedSamples(DIFFICULTY_ANCHORS, 40, 1);
        this.difficultyNet.train(difficultyData, DIFFICULTY_TRAIN_OPTS);
        this.difficultyTrained = true;
        console.log('难度AI训练完成');

        const towerData = generateInterpolatedSamples(TOWER_SCENARIO_ANCHORS, 35, 7);
        this.towerNet.train(towerData, TOWER_TRAIN_OPTS);
        this.towerTrained = true;
        console.log('炮台推荐AI训练完成');

        resolve();
      }, 0);
    });

    return this.trainingPromise;
  }

  predictDifficulty(features) {
    if (!this.difficultyTrained) return 1;

    const input = [
      clamp01(features.hpRatio),
      clamp01(features.avgClearTime),
      clamp01(features.goldUsageRate),
      clamp01(features.towerUtilization),
      clamp01(features.leakRate)
    ];

    const result = this.difficultyNet.run(input);
    const raw = Array.isArray(result) ? result[0] : Object.values(result)[0];
    return Math.max(0.6, Math.min(1.4, raw));
  }

  predictTowers(features) {
    const defaultScores = TOWER_ORDER.map((id) =>
      id === 'normal' ? 0.5 : 0.2
    );

    if (!this.towerTrained) {
      return defaultScores;
    }

    const input = [
      clamp01(features.normalEnemyRatio),
      clamp01(features.rushEnemyRatio),
      clamp01(features.stealthEnemyRatio),
      clamp01(features.armorEnemyRatio),
      clamp01(features.splitWormRatio),
      features.hasBoss ? 1 : 0,
      clamp01(features.goldRatio),
      clamp01(features.avgTowerLevel)
    ];

    const result = this.towerNet.run(input);
    const scores = Array.isArray(result) ? result : Object.values(result);
    return TOWER_ORDER.map((_, i) => clamp01(scores[i] ?? 0.2));
  }

  updateDifficultyAfterWave(features, completedWave) {
    this.lastFeatures = { ...features };
    const predicted = this.predictDifficulty(features);
    this.targetDifficultyScale = completedWave >= 5 ? predicted : 1;
    this.difficultyScale = this.targetDifficultyScale;
    return this.difficultyScale;
  }

  getDifficultyLabel(scale = this.displayDifficultyScale) {
    if (scale < 0.75) return 'AI放水中 😌';
    if (scale < 0.95) return '难度适中 😊';
    if (scale < 1.15) return '正常难度 😐';
    if (scale < 1.3) return 'AI加压中 😤';
    return '全力以赴 😱';
  }

  recommendTowers(waveFeatures, builtTowerTypes = []) {
    let scores = this.predictTowers(waveFeatures);

    if (waveFeatures.stealthEnemyRatio > 0.35) {
      scores = scores.map((s, i) => (TOWER_ORDER[i] === 'spread' ? Math.max(s, 0.92) : s));
    }
    if (waveFeatures.rushEnemyRatio > 0.35) {
      scores = scores.map((s, i) => {
        if (TOWER_ORDER[i] === 'ice') return Math.max(s, 0.88);
        if (TOWER_ORDER[i] === 'butter') return Math.max(s, 0.78);
        return s;
      });
    }
    if (waveFeatures.hasBoss && waveFeatures.splitWormRatio > 0.08) {
      scores = scores.map((s, i) => (TOWER_ORDER[i] === 'titan' ? Math.max(s, 0.9) : s));
    }
    if (waveFeatures.armorEnemyRatio > 0.28) {
      scores = scores.map((s, i) => {
        if (TOWER_ORDER[i] === 'lava') return Math.max(s, 0.86);
        if (TOWER_ORDER[i] === 'titan') return Math.max(s, 0.72);
        return s;
      });
    }
    if (waveFeatures.squadRatio > 0.35) {
      scores = scores.map((s, i) => {
        if (TOWER_ORDER[i] === 'hell') return Math.max(s, 0.88);
        if (TOWER_ORDER[i] === 'spread') return Math.max(s, 0.82);
        return s;
      });
    }

    if (waveFeatures.goldRatio > 0.6) {
      scores = scores.map((s, i) => {
        const type = TOWER_ORDER[i];
        return builtTowerTypes.includes(type) ? s * 0.85 : s * 1.08;
      });
    }
    if (waveFeatures.goldRatio < 0.3) {
      scores = scores.map((s, i) => {
        const cost = TOWER_CONFIGS[TOWER_ORDER[i]].cost;
        const affordableBoost = cost <= 75 ? 1.15 : cost <= 90 ? 1.05 : 0.85;
        return s * affordableBoost;
      });
    }

    const ranked = TOWER_ORDER.map((type, i) => ({ type, score: scores[i] }))
      .sort((a, b) => b.score - a.score);

    const primary = ranked[0].type;
    const secondary = ranked[1]?.type ?? ranked[0].type;
    const confidence = Math.round(ranked[0].score * 100);

    this.towerRecommendation = {
      primary,
      secondary,
      scores,
      confidence,
      reason: this.buildRecommendReason(waveFeatures, primary)
    };

    return this.towerRecommendation;
  }

  buildRecommendReason(features, topType) {
    if (features.stealthEnemyRatio > 0.35) {
      return '本波隐身怪较多，散射炮台可无视隐身';
    }
    if (features.hasBoss && features.splitWormRatio > 0.08) {
      return 'Boss来袭，擎天炮台额外伤害效果显著';
    }
    if (features.rushEnemyRatio > 0.35) {
      return '加速怪为主，冷冻+黄油炮台组合有效';
    }
    if (features.armorEnemyRatio > 0.28) {
      return '霸体战士较多，熔岩炮台持续灼烧破甲';
    }
    if (features.squadRatio > 0.35) {
      return '小队敌人密集，地狱+散射炮台清场高效';
    }
    if (features.goldRatio < 0.3) {
      return `金币紧张，优先建造性价比高的${TOWER_DISPLAY_NAMES[topType]}`;
    }
    return `综合本波敌人构成，${TOWER_DISPLAY_NAMES[topType]}最为契合`;
  }

  getTowerDisplayName(typeId) {
    return TOWER_DISPLAY_NAMES[typeId] || TOWER_CONFIGS[typeId]?.name || typeId;
  }

  tickDisplayDifficulty(dt) {
    const diff = this.targetDifficultyScale - this.displayDifficultyScale;
    if (Math.abs(diff) < 0.002) {
      this.displayDifficultyScale = this.targetDifficultyScale;
      return;
    }
    this.displayDifficultyScale += diff * Math.min(1, dt * 4);
  }

  getAppliedDifficultyScale(wave) {
    return wave >= 6 ? this.difficultyScale : 1;
  }

  getSpeedMultiplier(scale) {
    return 0.7 + scale * 0.3;
  }

  getSpawnIntervalDivisor(scale) {
    return 0.8 + scale * 0.2;
  }
}
