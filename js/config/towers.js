export const MAX_TOWER_LEVEL = 3;
export const TOWER_DAMAGE_GROWTH = 0.2;
export const TOWER_RANGE_GROWTH = 0.1;
export const TOWER_EFFECT_GROWTH = 0.15;

export const TOWER_CONFIGS = {
  normal: {
    id: 'normal',
    name: '普通炮台',
    cost: 50,
    upgradeCosts: [40, 80],
    range: 120,
    fireRate: 1,
    damage: 25,
    color: '#95a5a6',
    stroke: '#7f8c8d',
    barrel: '#34495e',
    bulletColor: '#bdc3c7'
  },
  ice: {
    id: 'ice',
    name: '寒冰炮台',
    cost: 75,
    upgradeCosts: [60, 100],
    range: 100,
    fireRate: 0.7,
    damage: 15,
    slowReduction: 0.6,
    slowDuration: 3,
    color: '#3498db',
    stroke: '#2471a3',
    barrel: '#85c1e9',
    bulletColor: '#aed6f1'
  },
  titan: {
    id: 'titan',
    name: '擎天柱',
    cost: 125,
    upgradeCosts: [90, 150],
    range: 140,
    fireRate: 0.6,
    damage: 40,
    hpPercent: 0.10,
    color: '#6c3483',
    stroke: '#4a235a',
    barrel: '#2e1a47',
    bulletColor: '#d2b4de'
  },
  hell: {
    id: 'hell',
    name: '多头塔',
    cost: 110,
    upgradeCosts: [80, 130],
    range: 130,
    fireRate: 1.2,
    damage: 20,
    targetCount: 2,
    color: '#c0392b',
    stroke: '#922b21',
    barrel: '#641e16',
    bulletColor: '#f1948a'
  },
  lava: {
    id: 'lava',
    name: '熔岩器',
    cost: 110,
    upgradeCosts: [85, 140],
    range: 110,
    fireRate: 0.8,
    damage: 18,
    burnTickDamage: 8,
    burnTickInterval: 0.5,
    burnDuration: 3,
    color: '#e67e22',
    stroke: '#ca6f1e',
    barrel: '#f39c12',
    bulletColor: '#f5b041'
  },
  spread: {
    id: 'spread',
    name: '散射炮台',
    shortName: '散射炮',
    cost: 90,
    upgradeCosts: [70, 120],
    range: 85,
    fireRate: 1,
    damage: 25,
    bulletSpeed: 200,
    color: '#1e5631',
    stroke: '#145a32',
    barrel: '#229954',
    bulletColor: '#2ecc71'
  },
  butter: {
    id: 'butter',
    name: '黄油炮台',
    shortName: '黄油炮',
    cost: 85,
    upgradeCosts: [65, 110],
    range: 125,
    fireRate: 1.2,
    damage: 20,
    color: '#f0b429',
    stroke: '#d4a017',
    barrel: '#f5e6b3',
    bulletColor: '#ffeb7a',
    bulletSpeed: 300
  }
};

export const TOWER_ORDER = ['normal', 'ice', 'titan', 'hell', 'lava', 'spread', 'butter'];

export function getTowerConfig(typeId) {
  return TOWER_CONFIGS[typeId] || TOWER_CONFIGS.normal;
}
