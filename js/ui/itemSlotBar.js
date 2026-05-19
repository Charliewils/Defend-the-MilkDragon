import { drawItemIcon } from '../items/itemRegistry.js';

const SLOT = 56;
const ICON_CY = SLOT * (30 / 80);
const ICON_SIZE = SLOT * (40 / 80);
const NAME_Y = SLOT * (58 / 80);
const CD_RADIUS = SLOT * (38 / 80);
const NAME_FONT = Math.max(7, Math.round(SLOT * (10 / 80)));
const CD_FONT = Math.max(10, Math.round(SLOT * (15 / 80)));
const CORNER_R = Math.min(12, Math.round(SLOT * 0.15));

export function createItemSlotBar(container, { onUseSlot }) {
  container.classList.add('item-slot-bar');
  container.innerHTML = `
    <div class="item-slot-row" role="toolbar" aria-label="道具槽">
      <button type="button" class="item-slot" data-slot="0" aria-label="道具槽1，快捷键 Q">
        <canvas width="${SLOT}" height="${SLOT}" class="item-slot-canvas"></canvas>
      </button>
      <button type="button" class="item-slot" data-slot="1" aria-label="道具槽2，快捷键 E">
        <canvas width="${SLOT}" height="${SLOT}" class="item-slot-canvas"></canvas>
      </button>
    </div>
    <div class="item-slot-keys" aria-hidden="true"><span>Q</span><span>E</span></div>
  `;

  const buttons = container.querySelectorAll('.item-slot');
  const canvases = container.querySelectorAll('.item-slot-canvas');

  for (const btn of buttons) {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.slot);
      if (!Number.isFinite(i)) return;
      onUseSlot(i);
    });
  }

  /**
   * @param {{ id: string, name: string, cooldown: number, currentCooldown: number, readyFlash: number }[]} slots
   */
  function render(slots) {
    for (let i = 0; i < 2; i += 1) {
      const canvas = canvases[i];
      const btn = buttons[i];
      if (!canvas || !btn) continue;
      const ctx = canvas.getContext('2d');
      const slot = slots[i];
      const w = SLOT;
      const h = SLOT;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const r = CORNER_R;

      if (!slot || !slot.id) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        roundRect(ctx, 2, 2, w - 4, h - 4, r);
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = 2;
        roundRect(ctx, 2, 2, w - 4, h - 4, r);
        ctx.stroke();
        btn.classList.remove('item-slot-ready', 'item-slot-cooldown');
        continue;
      }

      const ready = slot.currentCooldown <= 0;
      ctx.fillStyle = '#1e293b';
      roundRect(ctx, 2, 2, w - 4, h - 4, r);
      ctx.fill();

      if (ready) {
        ctx.strokeStyle = slot.readyFlash > 0 ? '#fef9c3' : '#f1c40f';
        ctx.lineWidth = slot.readyFlash > 0 ? 3 : 2;
        roundRect(ctx, 2, 2, w - 4, h - 4, r);
        ctx.stroke();
        if (slot.readyFlash > 0) {
          const pulse = Math.sin((slot.readyFlash % 0.2) * Math.PI * 10) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.22 * pulse})`;
          roundRect(ctx, 2, 2, w - 4, h - 4, r);
          ctx.fill();
        }
      } else {
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.9)';
        ctx.lineWidth = 2;
        roundRect(ctx, 2, 2, w - 4, h - 4, r);
        ctx.stroke();
      }

      drawItemIcon(ctx, slot.id, cx, ICON_CY, ICON_SIZE);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = `${NAME_FONT}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(slot.name, cx, NAME_Y);

      const maxCd = Math.max(0.001, slot.cooldown);
      const cd = slot.currentCooldown;
      if (cd > 0) {
        const frac = Math.min(1, cd / maxCd);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, CD_RADIUS, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac, false);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${CD_FONT}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(Math.ceil(cd)), cx, cy);
      }

      btn.classList.toggle('item-slot-ready', ready);
      btn.classList.toggle('item-slot-cooldown', !ready);
    }
  }

  return { render };
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
