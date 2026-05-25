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
  ice: '寒冰炮台',
  titan: '擎天柱',
  hell: '多头塔',
  lava: '熔岩器',
  spread: '散射炮台',
  butter: '黄油炮台'
};

/** 各敌人类型对炮台的克制权重（0~1），数值越高越适合 */
const TOWER_COUNTER_MATRIX = {
  normal: { normal: 0.92, butter: 0.78, ice: 0.55, hell: 0.48, spread: 0.42, lava: 0.4, titan: 0.32 },
  rush: { ice: 0.95, butter: 0.82, spread: 0.52, normal: 0.48, hell: 0.45, lava: 0.4, titan: 0.38 },
  stealth: { spread: 0.9, lava: 0.62, hell: 0.58, butter: 0.45, ice: 0.38, titan: 0.42, normal: 0.28 },
  armor: { lava: 0.93, titan: 0.88, hell: 0.52, spread: 0.45, normal: 0.35, ice: 0.32, butter: 0.28 },
  split_worm: { titan: 0.92, lava: 0.82, spread: 0.68, normal: 0.62, hell: 0.55, ice: 0.48, butter: 0.42 },
  squad: { hell: 0.9, lava: 0.65, butter: 0.58, normal: 0.55, spread: 0.52, ice: 0.42, titan: 0.48 },
  boss: { titan: 0.96, lava: 0.82, hell: 0.72, ice: 0.5, spread: 0.42, butter: 0.38, normal: 0.22 }
};

/** 主推荐为 AOE/多目标时，次推荐优先选控制或单体 */
const COMPLEMENTARY_TOWERS = {
  spread: ['ice', 'titan', 'lava', 'butter', 'normal'],
  hell: ['ice', 'titan', 'lava', 'butter', 'normal'],
  lava: ['ice', 'titan', 'hell', 'normal'],
  titan: ['ice', 'lava', 'hell', 'butter'],
  ice: ['titan', 'hell', 'lava', 'normal'],
  butter: ['ice', 'titan', 'lava', 'hell'],
  normal: ['ice', 'lava', 'hell', 'titan']
};

const THREAT_REASONS = {
  boss: (top) => `Boss 血量厚，${TOWER_DISPLAY_NAMES[top]}可打出百分比或持续伤害`,
  stealth: (top) => `隐身怪占比高，${TOWER_DISPLAY_NAMES[top]}能在其现身时有效输出`,
  rush: (top) => `加速怪较多，${TOWER_DISPLAY_NAMES[top]}可减速或定身`,
  armor: (top) => `霸体战士为主，${TOWER_DISPLAY_NAMES[top]}擅长破甲与灼烧`,
  split_worm: (top) => `裂变虫血厚且会分裂，${TOWER_DISPLAY_NAMES[top]}适合压制本体与子虫`,
  squad: (top) => `小队敌人密集，${TOWER_DISPLAY_NAMES[top]}可同时处理多个目标`,
  normal: (top) => `以普通怪为主，${TOWER_DISPLAY_NAMES[top]}性价比与火力均衡`
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
    input: [0.7, 0.1, 0.05, 0.05, 0.05, 0, 0.65, 0.45],
    output: [0.88, 0.45, 0.35, 0.4, 0.38, 0.42, 0.55]
  },
  {
    input: [0.2, 0.55, 0.08, 0.08, 0.05, 0, 0.6, 0.4],
    output: [0.4, 0.9, 0.35, 0.38, 0.4, 0.45, 0.82]
  },
  {
    input: [0.15, 0.12, 0.55, 0.08, 0.05, 0, 0.65, 0.45],
    output: [0.35, 0.4, 0.38, 0.42, 0.4, 0.88, 0.42]
  },
  {
    input: [0.18, 0.15, 0.1, 0.12, 0.35, 1, 0.7, 0.55],
    output: [0.32, 0.38, 0.92, 0.55, 0.48, 0.4, 0.35]
  },
  {
    input: [0.15, 0.12, 0.1, 0.45, 0.08, 0, 0.55, 0.5],
    output: [0.35, 0.35, 0.85, 0.45, 0.9, 0.42, 0.32]
  },
  {
    input: [0.12, 0.1, 0.08, 0.08, 0.45, 0, 0.6, 0.4],
    output: [0.5, 0.42, 0.48, 0.88, 0.62, 0.55, 0.52]
  },
  {
    input: [0.28, 0.22, 0.18, 0.15, 0.12, 0, 0.72, 0.25],
    output: [0.62, 0.55, 0.52, 0.58, 0.55, 0.54, 0.56]
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
    this.lastRecommendedPrimary = null;
    this.recommendationStreak = 0;
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

  computeCounterScores(features) {
    const weights = {
      normal: features.normalEnemyRatio,
      rush: features.rushEnemyRatio,
      stealth: features.stealthEnemyRatio,
      armor: features.armorEnemyRatio,
      split_worm: features.splitWormRatio,
      squad: features.squadRatio,
      boss: features.hasBoss ? Math.max(0.35, features.splitWormRatio + 0.25) : 0
    };

    const totalWeight = Object.values(weights).reduce((s, v) => s + v, 0) || 1;

    return TOWER_ORDER.map((towerId) => {
      let score = 0;
      for (const [enemyKey, ratio] of Object.entries(weights)) {
        if (ratio <= 0) continue;
        const counter = TOWER_COUNTER_MATRIX[enemyKey]?.[towerId] ?? 0.35;
        score += (ratio / totalWeight) * counter;
      }
      return clamp01(score);
    });
  }

  getDominantThreat(features) {
    const candidates = [
      { key: 'boss', ratio: features.hasBoss ? 1 : 0 },
      { key: 'stealth', ratio: features.stealthEnemyRatio },
      { key: 'rush', ratio: features.rushEnemyRatio },
      { key: 'armor', ratio: features.armorEnemyRatio },
      { key: 'split_worm', ratio: features.splitWormRatio },
      { key: 'squad', ratio: features.squadRatio },
      { key: 'normal', ratio: features.normalEnemyRatio }
    ];
    candidates.sort((a, b) => b.ratio - a.ratio);
    return candidates[0]?.ratio >= 0.18 ? candidates[0] : { key: 'normal', ratio: features.normalEnemyRatio };
  }

  applyEconomyModifiers(scores, features, builtTowerTypes) {
    return scores.map((score, i) => {
      const type = TOWER_ORDER[i];
      let next = score;

      const builtCount = builtTowerTypes.filter((t) => t === type).length;
      if (builtCount >= 2) next *= 0.72;
      else if (builtCount === 1) next *= 0.88;

      if (features.goldRatio > 0.6) {
        next *= builtTowerTypes.includes(type) ? 0.9 : 1.06;
      }
      if (features.goldRatio < 0.3) {
        const cost = TOWER_CONFIGS[type].cost;
        if (cost <= 75) next *= 1.12;
        else if (cost <= 90) next *= 1.04;
        else next *= 0.88;
      }

      return clamp01(next);
    });
  }

  applyDiversityPenalty(scores) {
    if (!this.lastRecommendedPrimary) return scores;
    const idx = TOWER_ORDER.indexOf(this.lastRecommendedPrimary);
    if (idx < 0) return scores;

    const penalty = this.recommendationStreak >= 2 ? 0.78 : 0.9;
    return scores.map((s, i) => (i === idx ? s * penalty : s));
  }

  pickComplementarySecondary(primary, ranked) {
    const prefs = COMPLEMENTARY_TOWERS[primary] || TOWER_ORDER;
    for (const type of prefs) {
      const entry = ranked.find((r) => r.type === type);
      if (entry && entry.type !== primary) return entry.type;
    }
    return ranked.find((r) => r.type !== primary)?.type ?? primary;
  }

  recommendTowers(waveFeatures, builtTowerTypes = []) {
    const counterScores = this.computeCounterScores(waveFeatures);
    const nnScores = this.predictTowers(waveFeatures);

    let scores = TOWER_ORDER.map((_, i) =>
      clamp01(counterScores[i] * 0.82 + nnScores[i] * 0.18)
    );

    scores = this.applyEconomyModifiers(scores, waveFeatures, builtTowerTypes);
    scores = this.applyDiversityPenalty(scores);

    let ranked = TOWER_ORDER.map((type, i) => ({ type, score: scores[i] }))
      .sort((a, b) => b.score - a.score);

    let primary = ranked[0].type;
    const runnerUp = ranked[1];

    if (
      this.lastRecommendedPrimary === primary &&
      runnerUp &&
      runnerUp.score >= ranked[0].score * 0.92
    ) {
      primary = runnerUp.type;
      ranked = [
        runnerUp,
        ranked[0],
        ...ranked.slice(2)
      ];
    }

    const secondary = this.pickComplementarySecondary(primary, ranked);
    const primaryScore = ranked.find((r) => r.type === primary)?.score ?? ranked[0].score;
    const confidence = Math.round(primaryScore * 100);

    if (this.lastRecommendedPrimary === primary) {
      this.recommendationStreak += 1;
    } else {
      this.lastRecommendedPrimary = primary;
      this.recommendationStreak = 1;
    }

    const threat = this.getDominantThreat(waveFeatures);
    const reason = this.buildRecommendReason(waveFeatures, primary, secondary, threat);

    this.towerRecommendation = {
      primary,
      secondary,
      scores,
      confidence,
      reason,
      dominantThreat: threat.key
    };

    return this.towerRecommendation;
  }

  buildRecommendReason(features, primary, secondary, threat) {
    const topName = TOWER_DISPLAY_NAMES[primary];
    const secondName = TOWER_DISPLAY_NAMES[secondary];

    if (features.goldRatio < 0.28) {
      return `金币紧张，优先补 ${topName}；有余力可备 ${secondName}`;
    }

    const threatLine = THREAT_REASONS[threat.key]?.(primary);
    if (threatLine) {
      if (secondary !== primary) {
        return `${threatLine}；次选 ${secondName} 互补`;
      }
      return threatLine;
    }

    if (secondary !== primary) {
      return `综合本波构成，${topName} 最契合；${secondName} 可作补充`;
    }
    return `综合本波敌人构成，${topName} 最为契合`;
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
