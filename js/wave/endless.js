export const ENDLESS_MAX_LIVES = 10;
export const ENDLESS_INITIAL_GOLD = 250;
export const ENDLESS_PREVIEW_DURATION = 2;
export const ENDLESS_PREVIEW_FADE_AFTER = 1.5;

const ENEMY_LABELS = {
  normal: '普通怪',
  rush: '加速怪',
  stealth: '隐身怪',
  boss: 'Boss',
  squad: '小队',
  armor: '霸体战士',
  split_worm: '裂变虫'
};

function remapEndlessSlotType(wave, queueIndex, originalType) {
  if (originalType === 'boss' || originalType === 'squad') return originalType;
  const h = ((wave * 7919 + queueIndex * 104729) % 1000) / 1000;
  if (wave >= 4 && h < 0.1) return 'split_worm';
  if (wave >= 4 && h < 0.22) return 'armor';
  if (wave === 3 && h < 0.12) return 'armor';
  return originalType;
}

const ENDLESS_WAVE_RECIPES = {
  1: [{ type: 'normal', count: 8 }],
  2: [{ type: 'normal', count: 10 }],
  3: [{ type: 'normal', count: 8 }, { type: 'squad', count: 1 }],
  4: [{ type: 'normal', count: 10 }, { type: 'rush', count: 2 }],
  5: [{ type: 'squad', count: 3 }],
  6: [{ type: 'normal', count: 12 }, { type: 'rush', count: 2 }, { type: 'squad', count: 1 }],
  7: [{ type: 'normal', count: 10 }, { type: 'rush', count: 3 }, { type: 'stealth', count: 1 }],
  8: [{ type: 'normal', count: 8 }, { type: 'stealth', count: 2 }, { type: 'squad', count: 2 }],
  9: [{ type: 'rush', count: 8 }, { type: 'normal', count: 4 }],
  10: [{ type: 'normal', count: 6 }, { type: 'boss', count: 1 }],
  11: [{ type: 'normal', count: 12 }, { type: 'rush', count: 3 }, { type: 'stealth', count: 2 }],
  12: [{ type: 'stealth', count: 5 }, { type: 'normal', count: 4 }],
  13: [{ type: 'squad', count: 2 }, { type: 'rush', count: 4 }, { type: 'stealth', count: 3 }],
  14: [{ type: 'normal', count: 15 }, { type: 'rush', count: 4 }],
  15: [{ type: 'stealth', count: 3 }, { type: 'rush', count: 2 }, { type: 'boss', count: 1 }]
};

export function getEndlessWaveHpMultiplier(wave) {
  return 1 + wave * 0.15;
}

export function getEndlessWaveSpeedMultiplier(wave) {
  return Math.min(2.5, 1 + wave * 0.08);
}

export function getEndlessSpawnInterval(wave) {
  if (wave <= 3) return 2.5;
  if (wave <= 6) return 2;
  if (wave <= 10) return 1.5;
  if (wave <= 15) return 1.2;
  return 0.8;
}

export function getEndlessWaveIntermission(completedWave) {
  if (completedWave <= 5) return 8;
  if (completedWave <= 10) return 6;
  if (completedWave <= 20) return 4;
  return 3;
}

export function countSpawnUnits(type) {
  return type === 'squad' ? 4 : 1;
}

function expandSpawnGroups(groups) {
  const queue = [];
  for (const group of groups) {
    for (let i = 0; i < group.count; i += 1) {
      queue.push({ type: group.type });
    }
  }
  return queue;
}

function buildDynamicEndlessWavePlan(wave) {
  const base = Math.min(30, 12 + (wave - 16) * 2);
  const squadTeams = Math.floor((base * 0.2) / 4);
  const squadUnits = squadTeams * 4;
  const rush = Math.round(base * 0.2);
  const stealth = Math.round(base * 0.15);
  let normal = base - squadUnits - rush - stealth;

  if (normal < 0) {
    normal = 0;
  }

  const groups = [];
  if (normal > 0) groups.push({ type: 'normal', count: normal });
  if (squadTeams > 0) groups.push({ type: 'squad', count: squadTeams });
  if (rush > 0) groups.push({ type: 'rush', count: rush });
  if (stealth > 0) groups.push({ type: 'stealth', count: stealth });
  if (wave % 5 === 0) groups.push({ type: 'boss', count: 1 });
  return groups;
}

export function getEndlessWaveSpawnGroups(wave) {
  if (wave <= 15) {
    return ENDLESS_WAVE_RECIPES[wave] || ENDLESS_WAVE_RECIPES[1];
  }
  return buildDynamicEndlessWavePlan(wave);
}

export function buildEndlessSpawnQueue(wave) {
  const groups = getEndlessWaveSpawnGroups(wave);
  const raw = expandSpawnGroups(groups);
  return raw.map((entry, i) => ({
    type: remapEndlessSlotType(wave, i, entry.type)
  }));
}

export function describeEndlessWaveComposition(wave) {
  const groups = getEndlessWaveSpawnGroups(wave);
  const counts = new Map();

  for (const group of groups) {
    const label = ENEMY_LABELS[group.type];
    const units = group.type === 'squad' ? group.count * 4 : group.count;
    counts.set(label, (counts.get(label) || 0) + units);
  }

  const detail = [...counts.entries()].map(([label, count]) => `${label} ×${count}`).join('  ');
  const isBossWave = groups.some((group) => group.type === 'boss');

  return {
    wave,
    detail,
    isBossWave
  };
}

export function getEndlessPreviewOpacity(elapsed) {
  if (elapsed < ENDLESS_PREVIEW_FADE_AFTER) return 1;
  const fadeWindow = ENDLESS_PREVIEW_DURATION - ENDLESS_PREVIEW_FADE_AFTER;
  if (fadeWindow <= 0) return 0;
  return Math.max(0, 1 - (elapsed - ENDLESS_PREVIEW_FADE_AFTER) / fadeWindow);
}

export function getEndlessWaveProgressState({
  wave,
  wavePhase,
  waveEnemiesTotal,
  waveEnemiesCleared,
  intermissionTimer
}) {
  if (wavePhase === 'preview') {
    return {
      ratio: 0,
      label: `第 ${wave} 波即将来袭`
    };
  }

  if (wavePhase === 'intermission') {
    const duration = getEndlessWaveIntermission(wave);
    return {
      ratio: duration === 0 ? 1 : 1 - intermissionTimer / duration,
      label: `下一波准备中 · ${Math.ceil(intermissionTimer)}s`
    };
  }

  const ratio = waveEnemiesTotal === 0 ? 0 : waveEnemiesCleared / waveEnemiesTotal;
  return {
    ratio,
    label: `本波进度 ${waveEnemiesCleared}/${waveEnemiesTotal}`
  };
}
