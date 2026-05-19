import { ArmorEnemy } from './ArmorEnemy.js';
import { BossEnemy } from './BossEnemy.js';
import { NormalEnemy } from './NormalEnemy.js';
import { RushEnemy } from './RushEnemy.js';
import { SquadEnemy } from './SquadEnemy.js';
import { SplitWorm, spawnWormSplitParticles } from './SplitWorm.js';
import { StealthEnemy } from './StealthEnemy.js';

const ENEMY_CLASSES = {
  normal: NormalEnemy,
  rush: RushEnemy,
  boss: BossEnemy,
  stealth: StealthEnemy,
  squad: SquadEnemy,
  armor: ArmorEnemy,
  split_worm: SplitWorm,
  mini_split_worm: SplitWorm
};

const SQUAD_SPACING = 0.04;

export function createEnemy(typeId, options = {}) {
  const EnemyClass = ENEMY_CLASSES[typeId] || NormalEnemy;
  return new EnemyClass({ ...options, typeId });
}

export function createSpawnedEnemies(entry, options = {}) {
  const spawnOpts = {
    wave: options.wave ?? 1,
    mode: options.mode ?? 'campaign',
    difficultyScale: options.difficultyScale ?? 1
  };

  if (entry.type === 'squad') {
    const members = [];
    for (let index = 0; index < 4; index += 1) {
      members.push(createEnemy('squad', {
        ...spawnOpts,
        progress: Math.max(0, (options.progress ?? 0) - SQUAD_SPACING * index),
        squadIndex: index + 1,
        isLeader: index === 0
      }));
    }
    return members;
  }

  return [createEnemy(entry.type, spawnOpts)];
}

export { Enemy } from './Enemy.js';
export { NormalEnemy } from './NormalEnemy.js';
export { RushEnemy } from './RushEnemy.js';
export { BossEnemy } from './BossEnemy.js';
export { StealthEnemy } from './StealthEnemy.js';
export { SquadEnemy } from './SquadEnemy.js';
export { ArmorEnemy } from './ArmorEnemy.js';
export { SplitWorm, spawnWormSplitParticles } from './SplitWorm.js';
