import { TOWER_ORDER, TOWER_CONFIGS } from './towers.js';
import { ENEMY_TYPES } from './enemies.js';

export const ENEMY_CODEX_ORDER = [
  'normal',
  'rush',
  'stealth',
  'armor',
  'squad',
  'split_worm',
  'mini_split_worm',
  'boss'
];

/** 推荐炮台（与 AI 克制逻辑一致，供图鉴展示） */
const ENEMY_COUNTER_TOWERS = {
  normal: ['普通炮台', '黄油炮台', '多头塔'],
  rush: ['寒冰炮台', '黄油炮台', '散射炮台'],
  stealth: ['散射炮台', '熔岩器', '多头塔'],
  armor: ['熔岩器', '擎天柱', '多头塔'],
  squad: ['多头塔', '熔岩器', '黄油炮台'],
  split_worm: ['擎天柱', '熔岩器', '散射炮台'],
  mini_split_worm: ['普通炮台', '散射炮台', '熔岩器'],
  boss: ['擎天柱', '熔岩器', '多头塔']
};

export const ENEMY_CODEX_EXTRA = {
  normal: {
    color: '#e74c3c',
    tagline: '最常见的入侵者',
    description:
      '血量与速度均衡，成群出现时会给防线带来稳定压力，适合用高性价比炮台应对。',
    traits: ['标准血量', '中等移速', '击杀奖励 10 金币']
  },
  rush: {
    color: '#f39c12',
    tagline: '半血后暴走',
    description:
      '生命值降至一半后会进入冲刺状态，移动速度大幅提升并留下残影，需要减速或定身控制。',
    traits: ['冲刺加速', '残影轨迹', '击杀奖励 15 金币']
  },
  stealth: {
    color: '#8e44ad',
    tagline: '周期性隐身',
    description:
      '循环隐身与现身，隐身期间大多数炮台无法锁定。散射炮的范围伤害仍可在其位于射程内时命中。',
    traits: ['隐身循环', '现身时可被集火', '击杀奖励 20 金币']
  },
  armor: {
    color: '#5d6d7e',
    tagline: '霸体护甲',
    description:
      '自带旋转护甲环，对冰冻、黄油等控制有免疫触发机制。持续灼烧与百分比伤害更为有效。',
    traits: ['护甲环', '控制免疫', '击杀奖励 25 金币']
  },
  squad: {
    color: '#27ae60',
    tagline: '四人编队',
    description:
      '一次生成四名队员，队长头顶有旗帜标记。范围伤害与多目标炮台能同时处理多个单位。',
    traits: ['一次 4 单位', '队长标记', '单体奖励 6 金币']
  },
  split_worm: {
    color: '#1e8449',
    tagline: '死后分裂',
    description:
      '虫形多节身体沿路径蠕动，被击杀后会分裂出小裂变虫。需要高爆发或持续伤害压制本体与子体。',
    traits: ['多节虫身', '死亡分裂', '击杀奖励 30 金币']
  },
  mini_split_worm: {
    color: '#58d68d',
    tagline: '裂变幼体',
    description: '由裂变虫分裂产生，血量较低但数量多，适合用散射或普通炮快速清理。',
    traits: ['低血量', '数量多', '击杀奖励 8 金币']
  },
  boss: {
    color: '#922b21',
    tagline: '关卡首领',
    description:
      '超高血量与体型，半血后移速提升并带有脉动红圈。擎天柱的百分比伤害与熔岩灼烧是核心对策。',
    traits: ['超高血量', '半血狂暴', '击杀奖励 50 金币']
  }
};

export const TOWER_CODEX_EXTRA = {
  normal: {
    role: '基础输出',
    description: '造价最低的万金油炮台，射速稳定，适合前期铺场与清理普通怪。',
    effect: '发射普通子弹，造成稳定单体伤害。',
    strongAgainst: ['普通怪', '小裂变虫'],
    weakAgainst: ['Boss', '霸体战士']
  },
  ice: {
    role: '减速控制',
    description: '命中附带减速，可有效克制加速怪与 Boss（Boss 减速效果减半）。',
    effect: '命中减速约 60%，持续 3 秒，可刷新持续时间。',
    strongAgainst: ['加速怪', 'Boss'],
    weakAgainst: ['隐身怪']
  },
  titan: {
    role: '百分比爆发',
    description: '对高血量目标额外造成当前生命值百分比伤害，是 Boss 与裂变虫的克星。',
    effect: '额外造成目标当前血量 10% 的伤害（随等级提升）。',
    strongAgainst: ['Boss', '裂变虫', '霸体战士'],
    weakAgainst: ['普通小怪潮']
  },
  hell: {
    role: '多目标火力',
    description: '同时锁定并攻击最近两个敌人，面对小队与混合波次表现出色。',
    effect: '同时锁定最近 2 个目标并分别开火。',
    strongAgainst: ['怪物小队', '混合波次', 'Boss'],
    weakAgainst: ['单体高护甲']
  },
  lava: {
    role: '持续灼烧',
    description: '攻击附加灼烧 DoT，适合磨掉霸体战士与高血量单位的护甲。',
    effect: '附加灼烧：每 0.5 秒造成持续伤害，持续约 3 秒。',
    strongAgainst: ['霸体战士', 'Boss', '裂变虫'],
    weakAgainst: ['高速小怪']
  },
  spread: {
    role: '范围扫射',
    description:
      '向八个方向散射，以自身为中心对 3×3 区域内敌人造成伤害，无需瞄准隐身单位。',
    effect: '八向散射，3×3 格范围伤害；三级可穿透 1 个目标。',
    strongAgainst: ['隐身怪', '密集小怪', '裂变幼体'],
    weakAgainst: ['单体远程 Boss']
  },
  butter: {
    role: '定身控制',
    description: '命中可定身敌人并造成黄油溅射减速，对加速怪与护甲怪有奇效。',
    effect: '概率定身目标；高等级附带范围减速与额外伤害。',
    strongAgainst: ['加速怪', '普通怪潮'],
    weakAgainst: ['Boss', '霸体战士（免疫）']
  }
};

export function getEnemyCodexEntry(typeId) {
  const config = ENEMY_TYPES[typeId];
  const extra = ENEMY_CODEX_EXTRA[typeId] || {};
  if (!config) return null;
  return {
    id: typeId,
    name: config.name,
    hp: config.hp,
    speed: config.speed,
    size: config.size,
    reward: config.reward,
    counterTowers: ENEMY_COUNTER_TOWERS[typeId] || [],
    ...extra
  };
}

export function getTowerCodexEntry(typeId) {
  const config = TOWER_CONFIGS[typeId];
  const extra = TOWER_CODEX_EXTRA[typeId] || {};
  if (!config) return null;
  return {
    id: typeId,
    name: config.name,
    cost: config.cost,
    range: config.range,
    fireRate: config.fireRate,
    damage: config.damage,
    color: config.color,
    ...extra
  };
}

export function getAllEnemyCodexEntries() {
  return ENEMY_CODEX_ORDER.map(getEnemyCodexEntry).filter(Boolean);
}

export function getAllTowerCodexEntries() {
  return TOWER_ORDER.map(getTowerCodexEntry).filter(Boolean);
}

export function formatTowerStats(entry) {
  const lines = [
    `造价 ${entry.cost} 金币`,
    `射程 ${entry.range}`,
    `射速 ${entry.fireRate}/秒`,
    `伤害 ${entry.damage}`
  ];
  if (entry.upgradeCosts) {
    lines.push(`升级 ${entry.upgradeCosts.join(' / ')} 金币`);
  }
  return lines;
}
