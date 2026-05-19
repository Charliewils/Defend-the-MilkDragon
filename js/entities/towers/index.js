import { ButterTower } from './ButterTower.js';
import { HellTower } from './HellTower.js';
import { IceTower } from './IceTower.js';
import { LavaTower } from './LavaTower.js';
import { NormalTower } from './NormalTower.js';
import { SpreadTower } from './SpreadTower.js';
import { TitanTower } from './TitanTower.js';

const TOWER_CLASSES = {
  normal: NormalTower,
  ice: IceTower,
  titan: TitanTower,
  hell: HellTower,
  lava: LavaTower,
  spread: SpreadTower,
  butter: ButterTower
};

export function createTower(col, row, typeId, battleModifiers = {}) {
  const TowerClass = TOWER_CLASSES[typeId] || NormalTower;
  return new TowerClass(col, row, battleModifiers);
}

export { Tower } from './Tower.js';
export { NormalTower } from './NormalTower.js';
export { IceTower } from './IceTower.js';
export { TitanTower } from './TitanTower.js';
export { HellTower } from './HellTower.js';
export { LavaTower } from './LavaTower.js';
export { SpreadTower } from './SpreadTower.js';
export { ButterTower } from './ButterTower.js';
