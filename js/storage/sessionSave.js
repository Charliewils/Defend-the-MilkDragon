const STORAGE_KEY = 'defense-radish-session-save-v1';

export const SESSION_SAVE_VERSION = 1;

export function saveSessionDocument(doc) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch {
    /* ignore quota */
  }
}

export function loadSessionDocument() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSessionDocument() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function sessionMatchesStart(doc, { mode, levelId, mapId }) {
  if (!doc || doc.version !== SESSION_SAVE_VERSION) return false;
  if (doc.mode !== mode) return false;
  if (mode === 'campaign' && doc.campaignLevelId !== levelId) return false;
  if (mode === 'endless' && doc.endlessMapId !== mapId) return false;
  return Boolean(doc.snapshot);
}
