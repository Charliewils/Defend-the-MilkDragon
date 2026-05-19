export const COLS = 20;
export const ROWS = 15;
export const CELL = 40;
export const CANVAS_W = COLS * CELL;
export const CANVAS_H = ROWS * CELL;

export const INITIAL_GOLD = 150;
export const INITIAL_LIVES = 5;
export const SPAWN_INTERVAL = 2;
export const KILL_REWARD = 10;

export const MAX_TOWER_LEVEL = 3;
export const TOWER_DAMAGE_GROWTH = 0.2;
export const TOWER_RANGE_GROWTH = 0.1;
export const TOWER_EFFECT_GROWTH = 0.15;

export { TOWER_CONFIGS as TOWER_TYPES, TOWER_ORDER, getTowerConfig } from './towers.js';

export const COLORS = {
  grass: '#4a7c3f',
  grassDark: '#3d6a34',
  path: '#c4a574',
  pathDark: '#b8956a',
  enemy: '#e74c3c',
  eliteEnemy: '#8e44ad',
  towerRange: 'rgba(127, 140, 141, 0.15)',
  hpBg: '#2c3e50',
  hpFg: '#2ecc71',
  text: '#ecf0f1',
  gameOver: 'rgba(0, 0, 0, 0.65)',
  freezeAura: 'rgba(52, 152, 219, 0.35)',
  bombAura: 'rgba(230, 126, 34, 0.35)'
};
