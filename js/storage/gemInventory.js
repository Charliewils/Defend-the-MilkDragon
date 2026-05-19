import { GEM_REWARDS } from '../config/gemRewards.js';
import {
  COSMETIC_CATEGORIES,
  DEFAULT_COSMETICS,
  getCosmeticById
} from '../config/cosmetics.js';

const STORAGE_KEY = 'defense-radish-gems';

function createDefaultState() {
  return {
    gems: 0,
    owned: {},
    equipped: { ...DEFAULT_COSMETICS },
    perfectStarClaims: {}
  };
}

function normalizeState(raw) {
  const fallback = createDefaultState();
  if (!raw || typeof raw !== 'object') return fallback;

  return {
    gems: Math.max(0, Number(raw.gems) || 0),
    owned: raw.owned && typeof raw.owned === 'object' ? { ...raw.owned } : {},
    equipped: {
      towerSkin: raw.equipped?.towerSkin || DEFAULT_COSMETICS.towerSkin,
      radishStyle: raw.equipped?.radishStyle || DEFAULT_COSMETICS.radishStyle
    },
    perfectStarClaims:
      raw.perfectStarClaims && typeof raw.perfectStarClaims === 'object'
        ? { ...raw.perfectStarClaims }
        : {}
  };
}

export function loadGemState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    return normalizeState(JSON.parse(raw));
  } catch {
    return createDefaultState();
  }
}

export function saveGemState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
}

export function getGemBalance() {
  return loadGemState().gems;
}

export function addGems(amount) {
  const delta = Math.max(0, Math.floor(amount));
  if (delta <= 0) return 0;
  const state = loadGemState();
  state.gems += delta;
  saveGemState(state);
  return delta;
}

export function ownsCosmetic(id) {
  if (!id || id === 'default') return true;
  return Boolean(loadGemState().owned[id]);
}

export function getEquippedTowerSkin() {
  return loadGemState().equipped.towerSkin || DEFAULT_COSMETICS.towerSkin;
}

export function getEquippedRadishStyle() {
  return loadGemState().equipped.radishStyle || DEFAULT_COSMETICS.radishStyle;
}

export function purchaseCosmetic(id) {
  const item = getCosmeticById(id);
  if (!item) return { ok: false, reason: 'not_found' };

  const state = loadGemState();
  if (state.owned[id]) {
    return { ok: false, reason: 'owned' };
  }
  if (state.gems < item.price) {
    return { ok: false, reason: 'insufficient' };
  }

  state.gems -= item.price;
  state.owned[id] = true;
  state.equipped[item.category] = id;
  saveGemState(state);
  return { ok: true, item };
}

export function equipCosmetic(id) {
  const item = getCosmeticById(id);
  if (!item) return { ok: false, reason: 'not_found' };

  const state = loadGemState();
  if (!state.owned[id]) {
    return { ok: false, reason: 'locked' };
  }

  state.equipped[item.category] = id;
  saveGemState(state);
  return { ok: true, item };
}

export function equipDefaultCosmetic(category) {
  if (!Object.values(COSMETIC_CATEGORIES).includes(category)) {
    return { ok: false, reason: 'invalid_category' };
  }

  const state = loadGemState();
  state.equipped[category] = DEFAULT_COSMETICS[category];
  saveGemState(state);
  return { ok: true };
}

export function awardBossKillGems() {
  return addGems(GEM_REWARDS.bossKill);
}

export function awardPerfectStarGems(levelId) {
  const state = loadGemState();
  const key = String(levelId);
  if (state.perfectStarClaims[key]) {
    return 0;
  }

  state.perfectStarClaims[key] = true;
  state.gems += GEM_REWARDS.perfectStars;
  saveGemState(state);
  return GEM_REWARDS.perfectStars;
}

export function awardEndlessWaveGems(completedWave) {
  if (completedWave <= 0 || completedWave % 10 !== 0) return 0;
  return addGems(GEM_REWARDS.endlessPerTenWaves);
}
