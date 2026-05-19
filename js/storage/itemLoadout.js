const STORAGE_KEY = 'td_item_loadout_v1';

export const DEFAULT_ITEM_LOADOUT = ['lightning_storm', 'gold_rain'];

export function getItemLoadout() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_ITEM_LOADOUT];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 2) return [...DEFAULT_ITEM_LOADOUT];
    return [String(parsed[0]), String(parsed[1])];
  } catch {
    return [...DEFAULT_ITEM_LOADOUT];
  }
}

export function setItemLoadout(ids) {
  if (!Array.isArray(ids) || ids.length !== 2) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([String(ids[0]), String(ids[1])]));
}
