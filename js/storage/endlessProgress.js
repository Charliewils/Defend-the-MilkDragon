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

/** 若 wave 超过历史最高则立即写入并返回新纪录，否则返回当前最高 */
export function recordEndlessBestWave(mapId, wave) {
  const progress = loadEndlessBestWaves();
  const prev = progress[mapId] || 0;
  if (wave <= prev) return prev;
  progress[mapId] = wave;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* ignore quota */
  }
  return wave;
}
