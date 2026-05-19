import { LEVEL_COUNT } from '../map/paths.js';
import { getLevelStars, isLevelUnlocked, loadProgress } from '../storage/levelProgress.js';

const NODE_LAYOUT = [
  { x: 0.1, y: 0.72 },
  { x: 0.24, y: 0.58 },
  { x: 0.4, y: 0.68 },
  { x: 0.56, y: 0.5 },
  { x: 0.72, y: 0.62 },
  { x: 0.86, y: 0.42 }
];

export function createLevelSelect(container, { onSelectLevel, onBack, onConfigureItems }) {
  container.classList.add('level-select-screen');

  container.innerHTML = `
    <div class="screen-header">
      <button type="button" class="screen-back-btn">返回主菜单</button>
      <h2 class="screen-heading">闯关模式</h2>
    </div>
    <div class="screen-toolbar">
      <button type="button" class="item-config-btn">道具配置（四选二）</button>
    </div>
    <div class="level-map">
      <svg class="level-map-route" viewBox="0 0 800 420" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 70 300 C 150 250, 180 220, 220 250 S 360 300, 420 210 S 560 250, 620 270 S 700 180, 730 150"></path>
      </svg>
      <div class="level-node-list"></div>
    </div>
  `;

  const nodeList = container.querySelector('.level-node-list');
  container.querySelector('.screen-back-btn').addEventListener('click', () => onBack());
  container.querySelector('.item-config-btn')?.addEventListener('click', () => onConfigureItems?.());

  nodeList.addEventListener('click', (event) => {
    const button = event.target.closest('.level-node:not(.locked)');
    if (!button) return;
    const levelId = Number(button.dataset.levelId);
    if (!Number.isFinite(levelId)) return;
    onSelectLevel(levelId);
  });

  function renderStars(stars) {
    if (!stars) return '';
    return `
      <div class="level-node-stars" aria-label="${stars} 星">
        ${[1, 2, 3].map((value) => `<span class="${value <= stars ? 'filled' : ''}">★</span>`).join('')}
      </div>
    `;
  }

  function render() {
    const progress = loadProgress();
    nodeList.innerHTML = '';

    for (let levelId = 1; levelId <= LEVEL_COUNT; levelId += 1) {
      const unlocked = isLevelUnlocked(levelId, progress);
      const stars = getLevelStars(levelId, progress);
      const layout = NODE_LAYOUT[levelId - 1];
      if (!layout) continue;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = `level-node${unlocked ? '' : ' locked'}`;
      button.dataset.levelId = String(levelId);
      button.style.left = `${layout.x * 100}%`;
      button.style.top = `${layout.y * 100}%`;
      button.style.zIndex = String(levelId);
      button.disabled = !unlocked;
      button.setAttribute('aria-label', unlocked ? `进入第 ${levelId} 关` : `第 ${levelId} 关未解锁`);
      button.innerHTML = `
        <span class="level-node-number">${levelId}</span>
        ${unlocked ? '' : '<span class="level-node-lock" aria-hidden="true">🔒</span>'}
        ${renderStars(stars)}
      `;

      nodeList.appendChild(button);
    }
  }

  render();
  return { render };
}
