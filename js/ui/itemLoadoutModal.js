import { ALL_ITEM_IDS, ITEM_DEFINITIONS, drawItemIcon } from '../items/itemRegistry.js';
import { getItemLoadout } from '../storage/itemLoadout.js';

export function createItemLoadoutModal(container, { onConfirm, onCancel }) {
  const wrap = document.createElement('div');
  wrap.className = 'item-loadout-modal hidden';
  wrap.innerHTML = `
    <div class="item-loadout-dialog" role="dialog" aria-modal="true" aria-labelledby="item-loadout-title">
      <h3 id="item-loadout-title" class="item-loadout-title">选择本局携带道具（四选二）</h3>
      <p class="item-loadout-hint">按选择顺序对应 <strong>Q</strong> 槽与 <strong>E</strong> 槽；已选 <span class="item-loadout-count">0</span>/2</p>
      <div class="item-loadout-grid"></div>
      <div class="item-loadout-actions">
        <button type="button" class="item-loadout-cancel">取消</button>
        <button type="button" class="item-loadout-confirm" disabled>确认开战</button>
      </div>
    </div>
  `;

  const grid = wrap.querySelector('.item-loadout-grid');
  const countEl = wrap.querySelector('.item-loadout-count');
  const confirmBtn = wrap.querySelector('.item-loadout-confirm');
  const cancelBtn = wrap.querySelector('.item-loadout-cancel');

  /** @type {string[]} */
  let selected = [];

  function buildGrid() {
    grid.innerHTML = '';
    for (const id of ALL_ITEM_IDS) {
      const def = ITEM_DEFINITIONS[id];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'item-loadout-card';
      card.dataset.itemId = id;
      card.innerHTML = `
        <canvas class="item-loadout-card-icon" width="56" height="56" aria-hidden="true"></canvas>
        <span class="item-loadout-card-name">${def.name}</span>
        <span class="item-loadout-card-desc">${def.description}</span>
        <span class="item-loadout-card-meta">冷却 ${def.cooldown}s</span>
      `;
      const c = card.querySelector('canvas');
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, 56, 56);
      drawItemIcon(ctx, id, 28, 28, 44);
      card.addEventListener('click', () => toggle(id));
      grid.appendChild(card);
    }
  }

  function renderSelection() {
    countEl.textContent = String(selected.length);
    confirmBtn.disabled = selected.length !== 2;
    const cards = grid.querySelectorAll('.item-loadout-card');
    for (const card of cards) {
      const id = card.dataset.itemId;
      const idx = selected.indexOf(id);
      card.classList.toggle('is-selected', idx >= 0);
      card.classList.toggle('slot-q', idx === 0);
      card.classList.toggle('slot-e', idx === 1);
    }
  }

  function syncFromStorage() {
    selected = [...getItemLoadout()];
    renderSelection();
  }

  function toggle(id) {
    const pos = selected.indexOf(id);
    if (pos >= 0) {
      selected.splice(pos, 1);
    } else if (selected.length < 2) {
      selected.push(id);
    } else {
      selected.pop();
      selected.push(id);
    }
    renderSelection();
  }

  confirmBtn.addEventListener('click', () => {
    if (selected.length !== 2) return;
    wrap.classList.add('hidden');
    onConfirm([...selected]);
  });

  cancelBtn.addEventListener('click', () => {
    wrap.classList.add('hidden');
    onCancel();
  });

  container.appendChild(wrap);
  buildGrid();

  return {
    open() {
      syncFromStorage();
      wrap.classList.remove('hidden');
    }
  };
}
