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
      <svg class="level-map-scenery" viewBox="0 0 800 420" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="map-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#87ceeb"/>
            <stop offset="55%" stop-color="#b8e4f8"/>
            <stop offset="100%" stop-color="#dff3c8"/>
          </linearGradient>
          <linearGradient id="map-hill-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#7cb87a"/>
            <stop offset="100%" stop-color="#5a9a58"/>
          </linearGradient>
          <linearGradient id="map-hill-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6ab04c"/>
            <stop offset="100%" stop-color="#4a8f3f"/>
          </linearGradient>
          <radialGradient id="map-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fff4a8"/>
            <stop offset="70%" stop-color="#f9e79f"/>
            <stop offset="100%" stop-color="#f5c469" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="800" height="420" fill="url(#map-sky)"/>
        <circle cx="680" cy="72" r="48" fill="url(#map-sun)" opacity="0.95"/>
        <ellipse cx="200" cy="300" rx="220" ry="90" fill="url(#map-hill-far)" opacity="0.55"/>
        <ellipse cx="580" cy="320" rx="260" ry="100" fill="url(#map-hill-far)" opacity="0.5"/>
        <ellipse cx="120" cy="360" rx="180" ry="70" fill="url(#map-hill-near)" opacity="0.65"/>
        <ellipse cx="480" cy="380" rx="320" ry="85" fill="url(#map-hill-near)" opacity="0.7"/>
        <g fill="#3d7a35" opacity="0.85">
          <ellipse cx="90" cy="268" rx="28" ry="38"/><ellipse cx="710" cy="255" rx="24" ry="34"/>
          <ellipse cx="350" cy="240" rx="22" ry="30"/><ellipse cx="520" cy="220" rx="20" ry="28"/>
        </g>
        <g fill="#ffffff" opacity="0.75">
          <ellipse cx="140" cy="88" rx="42" ry="16"/><ellipse cx="175" cy="82" rx="28" ry="12"/>
          <ellipse cx="420" cy="58" rx="50" ry="18"/><ellipse cx="465" cy="52" rx="32" ry="14"/>
        </g>
      </svg>
      <svg class="level-map-route" viewBox="0 0 800 420" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="route-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#f5d78e"/>
            <stop offset="50%" stop-color="#fff8e8"/>
            <stop offset="100%" stop-color="#e8c468"/>
          </linearGradient>
        </defs>
        <path class="level-map-route-shadow" d="M 70 300 C 150 250, 180 220, 220 250 S 360 300, 420 210 S 560 250, 620 270 S 700 180, 730 150"></path>
        <path class="level-map-route-line" d="M 70 300 C 150 250, 180 220, 220 250 S 360 300, 420 210 S 560 250, 620 270 S 700 180, 730 150"></path>
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
