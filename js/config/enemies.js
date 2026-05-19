export const ENEMY_TYPES = {
  normal: {
    id: 'normal',
    name: '普通怪',
    hp: 190,
    speed: 80,
    size: 14,
    reward: 10
  },
  rush: {
    id: 'rush',
    name: '加速怪',
    hp: 160,
    speed: 80,
    size: 12,
    reward: 15
  },
  boss: {
    id: 'boss',
    name: 'Boss',
    hp: 600,
    speed: 120,
    size: 28,
    reward: 50
  },
  stealth: {
    id: 'stealth',
    name: '隐身怪',
    hp: 180,
    speed: 100,
    size: 13,
    reward: 20
  },
  squad: {
    id: 'squad',
    name: '怪物小队',
    hp: 90,
    speed: 85,
    size: 10,
    reward: 6
  },
  armor: {
    id: 'armor',
    name: '霸体战士',
    hp: 180,
    speed: 70,
    size: 18,
    reward: 25
  },
  split_worm: {
    id: 'split_worm',
    name: '裂变虫',
    hp: 250,
    speed: 55,
    size: 16,
    reward: 30
  },
  mini_split_worm: {
    id: 'mini_split_worm',
    name: '小裂变虫',
    hp: 88,
    speed: 80,
    size: 10,
    reward: 8
  }
};

export function getEnemyConfig(typeId) {
  return ENEMY_TYPES[typeId] || ENEMY_TYPES.normal;
}
