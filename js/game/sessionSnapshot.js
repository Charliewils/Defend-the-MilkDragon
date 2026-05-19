import { createEnemy } from '../entities/enemies/index.js';
import { createTower } from '../entities/towers/index.js';

function assignCommonEnemy(enemy, raw) {
  enemy.hp = raw.hp;
  enemy.maxHp = raw.maxHp;
  enemy.alive = raw.alive;
  enemy.reachedEnd = raw.reachedEnd;
  enemy.progress = raw.progress;
  enemy.baseSpeed = raw.baseSpeed;
  enemy.slowMultiplier = raw.slowMultiplier ?? 1;
  enemy.slowTimer = raw.slowTimer ?? 0;
  enemy.isSlowed = raw.isSlowed ?? false;
  enemy.slowTrail = Array.isArray(raw.slowTrail) ? raw.slowTrail.map((p) => ({ ...p })) : [];
  enemy.burnTimer = raw.burnTimer ?? 0;
  enemy.burnTickTimer = raw.burnTickTimer ?? 0;
  enemy.burnDamagePerTick = raw.burnDamagePerTick ?? 0;
  enemy.burnTickInterval = raw.burnTickInterval ?? 0.5;
  enemy.burnFlashTimer = raw.burnFlashTimer ?? 0;
  enemy.butterRootTimer = raw.butterRootTimer ?? 0;
  enemy.butterSlipTimer = raw.butterSlipTimer ?? 0;
  enemy.butterGooPhase = raw.butterGooPhase ?? 0;
  enemy.damageReduction = raw.damageReduction ?? 0;
  enemy.isInvisible = raw.isInvisible ?? false;
  enemy.invisibleTimer = raw.invisibleTimer ?? 0;
}

export function serializeEnemy(enemy) {
  const raw = {
    typeId: enemy.typeId,
    wave: enemy.wave,
    mode: enemy.mode,
    progress: enemy.progress,
    hp: enemy.hp,
    maxHp: enemy.maxHp,
    alive: enemy.alive,
    reachedEnd: enemy.reachedEnd,
    squadIndex: enemy.squadIndex ?? null,
    isLeader: Boolean(enemy.isLeader),
    baseSpeed: enemy.baseSpeed,
    slowMultiplier: enemy.slowMultiplier,
    slowTimer: enemy.slowTimer,
    isSlowed: enemy.isSlowed,
    slowTrail: enemy.slowTrail,
    burnTimer: enemy.burnTimer,
    burnTickTimer: enemy.burnTickTimer,
    burnDamagePerTick: enemy.burnDamagePerTick,
    burnTickInterval: enemy.burnTickInterval,
    burnFlashTimer: enemy.burnFlashTimer,
    butterRootTimer: enemy.butterRootTimer,
    butterSlipTimer: enemy.butterSlipTimer,
    butterGooPhase: enemy.butterGooPhase,
    damageReduction: enemy.damageReduction,
    isInvisible: enemy.isInvisible,
    invisibleTimer: enemy.invisibleTimer
  };

  if (enemy.typeId === 'rush') {
    raw.normalBaseSpeed = enemy.normalBaseSpeed;
    raw.rushActive = enemy.rushActive;
    raw.rushGhosts = (enemy.rushGhosts || []).map((g) => ({ ...g }));
  }
  if (enemy.typeId === 'stealth') {
    raw.cycleTimer = enemy.cycleTimer;
    raw.visibility = enemy.visibility;
    raw.targetVisibility = enemy.targetVisibility;
  }
  if (enemy.typeId === 'boss') {
    raw.normalBaseSpeed = enemy.normalBaseSpeed;
    raw.rageActive = enemy.rageActive;
    raw.pulseTimer = enemy.pulseTimer;
  }
  if (enemy.typeId === 'armor') {
    raw.immuneFxKind = enemy.immuneFxKind;
    raw.immuneFxT = enemy.immuneFxT;
    raw.armorFlashT = enemy.armorFlashT;
    raw.auraBoostT = enemy.auraBoostT;
    raw.auraPhase = enemy.auraPhase;
  }
  if (enemy.typeId === 'split_worm' || enemy.typeId === 'mini_split_worm') {
    raw.history = (enemy.history || []).map((h) => ({ ...h }));
    raw.splitAnimT = enemy.splitAnimT ?? 0;
    raw.splitPopOffset = enemy.splitPopOffset ?? 0;
    raw.hurtJiggleT = enemy.hurtJiggleT ?? 0;
    raw._splitBurstDone = Boolean(enemy._splitBurstDone);
    raw.isMiniSplit = Boolean(enemy.isMiniSplit);
    raw.headRadius = enemy.headRadius;
    raw.segmentDelays = enemy.segmentDelays;
  }
  return raw;
}

export function deserializeEnemy(raw) {
  const enemy = createEnemy(raw.typeId, {
    wave: raw.wave,
    mode: raw.mode,
    progress: raw.progress,
    squadIndex: raw.squadIndex ?? null,
    isLeader: Boolean(raw.isLeader)
  });
  assignCommonEnemy(enemy, raw);

  if (raw.typeId === 'rush') {
    enemy.normalBaseSpeed = raw.normalBaseSpeed ?? enemy.baseSpeed;
    enemy.rushActive = Boolean(raw.rushActive);
    enemy.rushGhosts = (raw.rushGhosts || []).map((g) => ({ ...g }));
  }
  if (raw.typeId === 'stealth') {
    enemy.cycleTimer = raw.cycleTimer ?? 0;
    enemy.visibility = raw.visibility ?? 1;
    enemy.targetVisibility = raw.targetVisibility ?? 1;
  }
  if (raw.typeId === 'boss') {
    enemy.normalBaseSpeed = raw.normalBaseSpeed ?? enemy.baseSpeed;
    enemy.rageActive = Boolean(raw.rageActive);
    enemy.pulseTimer = raw.pulseTimer ?? 0;
  }
  if (raw.typeId === 'armor') {
    enemy.immuneFxKind = raw.immuneFxKind ?? null;
    enemy.immuneFxT = raw.immuneFxT ?? 0;
    enemy.armorFlashT = raw.armorFlashT ?? 0;
    enemy.auraBoostT = raw.auraBoostT ?? 0;
    enemy.auraPhase = raw.auraPhase ?? 0;
  }
  if (raw.typeId === 'split_worm' || raw.typeId === 'mini_split_worm') {
    enemy.history = (raw.history || []).map((h) => ({ ...h }));
    enemy.splitAnimT = raw.splitAnimT ?? 0;
    enemy.splitPopOffset = raw.splitPopOffset ?? 0;
    enemy.hurtJiggleT = raw.hurtJiggleT ?? 0;
    enemy._splitBurstDone = Boolean(raw._splitBurstDone);
    enemy.isMiniSplit = Boolean(raw.isMiniSplit);
    if (typeof raw.headRadius === 'number') enemy.headRadius = raw.headRadius;
    if (Array.isArray(raw.segmentDelays)) enemy.segmentDelays = [...raw.segmentDelays];
  }
  return enemy;
}

export function serializeTower(tower) {
  return {
    col: tower.col,
    row: tower.row,
    typeId: tower.typeId,
    level: tower.level,
    fireCooldown: tower.fireCooldown,
    angle: tower.angle,
    fireRateMultiplier: tower.fireRateMultiplier ?? 1
  };
}

export function deserializeTower(raw, battleModifiers) {
  const tower = createTower(raw.col, raw.row, raw.typeId, battleModifiers);
  tower.level = Math.max(1, raw.level ?? 1);
  tower.fireCooldown = raw.fireCooldown ?? 0;
  tower.angle = raw.angle ?? 0;
  tower.fireRateMultiplier = raw.fireRateMultiplier ?? 1;
  const center = tower.position;
  tower.x = center.x;
  tower.y = center.y;
  return tower;
}
