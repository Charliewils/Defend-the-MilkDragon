const STORAGE_KEY = 'defense-radish-endless-best';

function createDefaultProgress() {
  return {
    grass: 0,
    snow: 0
  };
}

export function loadEndlessBestWaves() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw);
    return {
      grass: Number(parsed.grass) || 0,
      snow: Number(parsed.snow) || 0
    };
  } catch {
    return createDefaultProgress();
  }
}

export function getEndlessBestWave(mapId, progress = loadEndlessBestWaves()) {
  return progress[mapId] || 0;
}

export function recordEndlessBestWave(mapId, wave) {
  const progress = loadEndlessBestWaves();
  const nextBest = Math.max(progress[mapId] || 0, wave);
  progress[mapId] = nextBest;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  return nextBest;
}
