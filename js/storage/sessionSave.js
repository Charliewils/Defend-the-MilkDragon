const STORAGE_KEY = 'defense-radish-session-save-v2';
const LEGACY_STORAGE_KEY = 'defense-radish-session-save-v1';

export const SESSION_SAVE_VERSION = 2;

function createEmptyRoot() {
  return {
    version: SESSION_SAVE_VERSION,
    campaign: null,
    endless: null
  };
}

function normalizeModeEntry(entry) {
  if (!entry?.snapshot) return null;
  return {
    savedAt: entry.savedAt ?? Date.now(),
    paused: Boolean(entry.paused),
    snapshot: entry.snapshot,
    campaignLevelId: entry.campaignLevelId ?? null,
    endlessMapId: entry.endlessMapId ?? null
  };
}

function migrateLegacyDocument(legacy) {
  if (!legacy?.snapshot) return createEmptyRoot();
  const root = createEmptyRoot();
  const slot =
    legacy.mode === 'endless'
      ? {
          savedAt: legacy.savedAt ?? Date.now(),
          paused: Boolean(legacy.paused),
          endlessMapId: legacy.endlessMapId,
          snapshot: legacy.snapshot
        }
      : {
          savedAt: legacy.savedAt ?? Date.now(),
          paused: Boolean(legacy.paused),
          campaignLevelId: legacy.campaignLevelId,
          snapshot: legacy.snapshot
        };
  if (legacy.mode === 'endless') {
    root.endless = normalizeModeEntry(slot);
  } else {
    root.campaign = normalizeModeEntry(slot);
  }
  return root;
}

export function loadSessionRoot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === SESSION_SAVE_VERSION) {
        return {
          version: SESSION_SAVE_VERSION,
          campaign: normalizeModeEntry(parsed.campaign),
          endless: normalizeModeEntry(parsed.endless)
        };
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      const migrated = migrateLegacyDocument(legacy);
      saveSessionRoot(migrated);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return migrated;
    }
  } catch {
    /* ignore */
  }

  return createEmptyRoot();
}

export function saveSessionRoot(root) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(root));
  } catch {
    /* ignore quota */
  }
}

export function loadModeSession(mode) {
  const root = loadSessionRoot();
  return mode === 'endless' ? root.endless : root.campaign;
}

export function saveModeSession(mode, entry) {
  const root = loadSessionRoot();
  if (mode === 'endless') {
    root.endless = normalizeModeEntry(entry);
  } else {
    root.campaign = normalizeModeEntry(entry);
  }
  saveSessionRoot(root);
}

export function clearModeSession(mode) {
  const root = loadSessionRoot();
  if (mode === 'endless') {
    root.endless = null;
  } else {
    root.campaign = null;
  }
  saveSessionRoot(root);
}

export function clearAllSessionSaves() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** @deprecated 使用 loadModeSession / loadSessionRoot */
export function loadSessionDocument() {
  const root = loadSessionRoot();
  const campaign = root.campaign;
  if (campaign) {
    return {
      version: SESSION_SAVE_VERSION,
      mode: 'campaign',
      campaignLevelId: campaign.campaignLevelId,
      endlessMapId: null,
      paused: campaign.paused,
      savedAt: campaign.savedAt,
      snapshot: campaign.snapshot
    };
  }
  const endless = root.endless;
  if (endless) {
    return {
      version: SESSION_SAVE_VERSION,
      mode: 'endless',
      campaignLevelId: null,
      endlessMapId: endless.endlessMapId,
      paused: endless.paused,
      savedAt: endless.savedAt,
      snapshot: endless.snapshot
    };
  }
  return null;
}

/** @deprecated 使用 saveModeSession */
export function saveSessionDocument(doc) {
  if (!doc?.snapshot) return;
  const entry = {
    savedAt: doc.savedAt ?? Date.now(),
    paused: Boolean(doc.paused),
    snapshot: doc.snapshot,
    campaignLevelId: doc.campaignLevelId ?? null,
    endlessMapId: doc.endlessMapId ?? null
  };
  saveModeSession(doc.mode === 'endless' ? 'endless' : 'campaign', entry);
}

/** @deprecated 使用 clearModeSession / clearAllSessionSaves */
export function clearSessionDocument() {
  clearAllSessionSaves();
}

export function sessionMatchesStart(doc, { mode, levelId, mapId }) {
  if (!doc?.snapshot) return false;
  if (mode === 'campaign' && doc.campaignLevelId !== levelId) return false;
  if (mode === 'endless' && doc.endlessMapId !== mapId) return false;
  return true;
}

export function hasModeSession(mode, { levelId, mapId } = {}) {
  const doc = loadModeSession(mode);
  if (!doc) return false;
  return sessionMatchesStart(doc, {
    mode,
    levelId: levelId ?? null,
    mapId: mapId ?? null
  });
}
