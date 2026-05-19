import { ITEM_DEFINITIONS, ALL_ITEM_IDS } from './itemRegistry.js';

function normalizeLoadout(ids) {
  const out = [];
  for (const id of ids) {
    if (ITEM_DEFINITIONS[id] && !out.includes(id)) out.push(id);
    if (out.length >= 2) break;
  }
  while (out.length < 2) {
    const fallback = ALL_ITEM_IDS.find((x) => !out.includes(x));
    if (!fallback) break;
    out.push(fallback);
  }
  return out.slice(0, 2);
}

/**
 * @param {string[]} loadoutIds
 * @param {{ onUse: (slotIndex: number, itemId: string) => void }} hooks
 */
export class ItemManager {
  constructor(loadoutIds, hooks) {
    this.hooks = hooks;
    this.setLoadout(loadoutIds);
  }

  setLoadout(loadoutIds) {
    const ids = normalizeLoadout(loadoutIds);
    this.slots = ids.map((id) => {
      const def = ITEM_DEFINITIONS[id];
      return {
        id,
        name: def.name,
        description: def.description,
        cooldown: def.cooldown,
        currentCooldown: 0,
        readyFlash: 0
      };
    });
  }

  resetCooldowns() {
    for (const slot of this.slots) {
      slot.currentCooldown = 0;
      slot.readyFlash = 0;
    }
  }

  update(dt) {
    for (const slot of this.slots) {
      if (slot.readyFlash > 0) {
        slot.readyFlash = Math.max(0, slot.readyFlash - dt);
      }
      const prev = slot.currentCooldown;
      if (slot.currentCooldown > 0) {
        slot.currentCooldown = Math.max(0, slot.currentCooldown - dt);
      }
      if (prev > 0 && slot.currentCooldown <= 0) {
        slot.readyFlash = 0.45;
      }
    }
  }

  /**
   * @returns {'ok'|'cooldown'|'empty'}
   */
  tryUseSlot(index) {
    const slot = this.slots[index];
    if (!slot) return 'empty';
    if (slot.currentCooldown > 0) return 'cooldown';
    this.hooks.onUse(index, slot.id);
    slot.currentCooldown = slot.cooldown;
    return 'ok';
  }

  getSnapshot() {
    return this.slots.map((slot) => ({
      id: slot.id,
      name: slot.name,
      cooldown: slot.cooldown,
      currentCooldown: slot.currentCooldown,
      readyFlash: slot.readyFlash
    }));
  }

  /** @param {{ currentCooldown?: number, readyFlash?: number }[]} saved */
  applySnapshot(saved) {
    if (!Array.isArray(saved)) return;
    for (let i = 0; i < this.slots.length; i += 1) {
      const slot = this.slots[i];
      const s = saved[i];
      if (!slot || !s) continue;
      slot.currentCooldown = Number(s.currentCooldown) || 0;
      slot.readyFlash = Number(s.readyFlash) || 0;
    }
  }
}
