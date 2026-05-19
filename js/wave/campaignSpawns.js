export const TOTAL_WAVES = 6;

export const WAVE_INTERMISSION = 5;

export const CAMPAIGN_WAVE_PLANS = {
  1: { interval: 2, spawns: [{ type: 'normal', count: 8 }] },
  2: { interval: 1.8, spawns: [{ type: 'normal', count: 6 }, { type: 'rush', count: 2 }] },
  3: {
    interval: 1.8,
    spawns: [
      { type: 'normal', count: 3 },
      { type: 'squad', count: 1 },
      { type: 'rush', count: 2 },
      { type: 'armor', count: 2 }
    ]
  },
  4: {
    interval: 1.8,
    spawns: [
      { type: 'boss', count: 1 },
      { type: 'normal', count: 3 },
      { type: 'split_worm', count: 1 }
    ]
  },
  5: {
    interval: 1.7,
    spawns: [
      { type: 'stealth', count: 2 },
      { type: 'normal', count: 4 },
      { type: 'squad', count: 1 },
      { type: 'split_worm', count: 1 },
      { type: 'armor', count: 2 }
    ]
  },
  6: {
    interval: 1.5,
    spawns: [
      { type: 'boss', count: 1 },
      { type: 'stealth', count: 2 },
      { type: 'rush', count: 2 },
      { type: 'squad', count: 1 },
      { type: 'armor', count: 1 }
    ]
  }
};

export function getCampaignWavePlan(wave) {
  return CAMPAIGN_WAVE_PLANS[wave] || CAMPAIGN_WAVE_PLANS[1];
}

export function expandCampaignSpawnQueue(wave) {
  const plan = getCampaignWavePlan(wave);
  const queue = [];
  for (const group of plan.spawns) {
    for (let i = 0; i < group.count; i += 1) {
      queue.push({ type: group.type });
    }
  }
  return { queue, interval: plan.interval };
}

const ENEMY_LABELS = {
  normal: '普通怪',
  rush: '加速怪',
  stealth: '隐身怪',
  boss: 'Boss',
  squad: '小队',
  armor: '霸体战士',
  split_worm: '裂变虫'
};

export function describeCampaignWaveComposition(wave) {
  const plan = getCampaignWavePlan(wave);
  const counts = new Map();

  for (const group of plan.spawns) {
    const label = ENEMY_LABELS[group.type] || group.type;
    const units = group.type === 'squad' ? group.count * 4 : group.count;
    counts.set(label, (counts.get(label) || 0) + units);
  }

  const detail = [...counts.entries()].map(([label, count]) => `${label} ×${count}`).join('  ');
  const isBossWave = plan.spawns.some((group) => group.type === 'boss');

  return { wave, detail, isBossWave };
}

export function getWaveProgressState({
  wave,
  wavePhase,
  waveEnemiesTotal,
  waveEnemiesCleared,
  intermissionTimer
}) {
  if (wavePhase === 'complete') {
    return { ratio: 1, label: '全部波次完成' };
  }

  if (wavePhase === 'intermission') {
    return {
      ratio: 1 - intermissionTimer / WAVE_INTERMISSION,
      label: `下一波准备中 · ${Math.ceil(intermissionTimer)}s`
    };
  }

  const ratio = waveEnemiesTotal === 0 ? 0 : waveEnemiesCleared / waveEnemiesTotal;
  return {
    ratio,
    label: `本波进度 ${waveEnemiesCleared}/${waveEnemiesTotal}`
  };
}
