import { ENDLESS_MAPS, getEndlessMapLayout } from '../map/paths.js';
import { getMapTheme } from '../config/mapThemes.js';

const THUMB_COLS = 20;
const THUMB_ROWS = 15;

function drawPathThumbnail(canvas, mapId) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const cellW = width / THUMB_COLS;
  const cellH = height / THUMB_ROWS;
  const map = ENDLESS_MAPS[mapId];
  const theme = getMapTheme(map.theme);
  const { path, obstacles } = getEndlessMapLayout(mapId);
  const pathCells = new Set(path.map(([col, row]) => `${col},${row}`));
  const obstacleCells = new Set(obstacles.map(([col, row]) => `${col},${row}`));

  ctx.clearRect(0, 0, width, height);

  for (let row = 0; row < THUMB_ROWS; row += 1) {
    for (let col = 0; col < THUMB_COLS; col += 1) {
      const onPath = pathCells.has(`${col},${row}`);
      const onObstacle = obstacleCells.has(`${col},${row}`);
      if (onPath) {
        ctx.fillStyle = (col + row) % 2 === 0 ? theme.path : theme.pathDark;
      } else if (onObstacle) {
        ctx.fillStyle = (col + row) % 2 === 0
          ? (theme.obstacle || '#5d4037')
          : (theme.obstacleDark || '#4e342e');
      } else {
        ctx.fillStyle = (col + row) % 2 === 0 ? theme.grass : theme.grassDark;
      }
      ctx.fillRect(col * cellW, row * cellH, cellW + 0.5, cellH + 0.5);
    }
  }

  if (path.length > 1) {
    const start = path[0];
    const end = path[path.length - 1];
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc((start[0] + 0.5) * cellW, (start[1] + 0.5) * cellH, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc((end[0] + 0.5) * cellW, (end[1] + 0.5) * cellH, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function createEndlessMapSelect(container, { onSelectMap, onBack, onConfigureItems }) {
  container.innerHTML = `
    <div class="screen-header">
      <button type="button" class="screen-back-btn">返回主菜单</button>
      <h2 class="screen-heading">无尽模式</h2>
    </div>
    <div class="screen-toolbar">
      <button type="button" class="item-config-btn">道具配置（四选二）</button>
    </div>
    <div class="endless-map-list"></div>
  `;

  const listEl = container.querySelector('.endless-map-list');
  container.querySelector('.screen-back-btn').addEventListener('click', () => onBack());
  container.querySelector('.item-config-btn')?.addEventListener('click', () => onConfigureItems?.());

  for (const map of Object.values(ENDLESS_MAPS)) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'endless-map-card';
    card.innerHTML = `
      <canvas class="endless-map-thumb" width="320" height="180" aria-hidden="true"></canvas>
      <span class="endless-map-label">${map.label}</span>
    `;
    drawPathThumbnail(card.querySelector('canvas'), map.id);
    card.addEventListener('click', () => onSelectMap(map.id));
    listEl.appendChild(card);
  }
}
