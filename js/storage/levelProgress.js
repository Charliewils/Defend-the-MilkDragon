import { LEVEL_COUNT } from '../map/paths.js';

const STORAGE_KEY = 'defense-radish-progress';

function createDefaultProgress() {
  return {
    unlockedLevel: 1,
    stars: {}
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw);
    return {
      unlockedLevel: Math.max(1, Number(parsed.unlockedLevel) || 1),
      stars: parsed.stars && typeof parsed.stars === 'object' ? parsed.stars : {}
    };
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isLevelUnlocked(levelId, progress = loadProgress()) {
  return levelId <= progress.unlockedLevel;
}

export function getLevelStars(levelId, progress = loadProgress()) {
  return progress.stars[levelId] || 0;
}

export function recordLevelVictory(levelId, stars) {
  const progress = loadProgress();
  const nextStars = Math.max(getLevelStars(levelId, progress), stars);
  progress.stars[levelId] = nextStars;
  progress.unlockedLevel = Math.max(progress.unlockedLevel, Math.min(levelId + 1, LEVEL_COUNT));
  saveProgress(progress);
  return progress;
}
