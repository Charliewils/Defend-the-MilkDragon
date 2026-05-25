import {
  getAllEnemyCodexEntries,
  getAllTowerCodexEntries,
  getEnemyCodexEntry,
  getTowerCodexEntry
} from '../config/codexData.js';
import { drawCodexEnemyPreview, drawCodexTowerPreview } from './codexPreview.js';

function chipList(items, className = 'codex-chip') {
  if (!items?.length) return '<span class="codex-muted">—</span>';
  return items.map((t) => `<span class="${className}">${t}</span>`).join('');
}

function renderTowerDetail(entry) {
  const stats = [
    `造价 ${entry.cost} 金币`,
    `射程 ${entry.range} 像素`,
    `射速 ${entry.fireRate} 次/秒`,
    `伤害 ${entry.damage}`
  ];
  return `
    <h3 class="codex-detail-name">${entry.name}</h3>
    <p class="codex-detail-tagline">${entry.role}</p>
    <p class="codex-detail-desc">${entry.description}</p>
    <div class="codex-detail-block">
      <h4 class="codex-detail-label">基础属性</h4>
      <ul class="codex-stat-list">${stats.map((s) => `<li>${s}</li>`).join('')}</ul>
    </div>
    <div class="codex-detail-block">
      <h4 class="codex-detail-label">特殊效果</h4>
      <p class="codex-detail-text">${entry.effect}</p>
    </div>
    <div class="codex-detail-block">
      <h4 class="codex-detail-label">擅长对付</h4>
      <div class="codex-chips">${chipList(entry.strongAgainst, 'codex-chip codex-chip-good')}</div>
    </div>
    <div class="codex-detail-block">
      <h4 class="codex-detail-label">较弱环节</h4>
      <div class="codex-chips">${chipList(entry.weakAgainst, 'codex-chip codex-chip-warn')}</div>
    </div>
  `;
}

function renderEnemyDetail(entry) {
  const stats = [
    `生命值 ${entry.hp}`,
    `移速 ${entry.speed}`,
    `体型 ${entry.size}`,
    `击杀奖励 ${entry.reward} 金币`
  ];
  return `
    <h3 class="codex-detail-name">${entry.name}</h3>
    <p class="codex-detail-tagline">${entry.tagline}</p>
    <p class="codex-detail-desc">${entry.description}</p>
    <div class="codex-detail-block">
      <h4 class="codex-detail-label">基础属性</h4>
      <ul class="codex-stat-list">${stats.map((s) => `<li>${s}</li>`).join('')}</ul>
    </div>
    <div class="codex-detail-block">
      <h4 class="codex-detail-label">特性</h4>
      <div class="codex-chips">${chipList(entry.traits, 'codex-chip')}</div>
    </div>
    <div class="codex-detail-block">
      <h4 class="codex-detail-label">推荐炮台</h4>
      <div class="codex-chips">${chipList(entry.counterTowers, 'codex-chip codex-chip-good')}</div>
    </div>
  `;
}

export function createCodexModal() {
  const overlay = document.createElement('div');
  overlay.id = 'codex-modal';
  overlay.className = 'codex-modal hidden';

  const towerEntries = getAllTowerCodexEntries();
  const enemyEntries = getAllEnemyCodexEntries();

  overlay.innerHTML = `
    <div class="codex-panel" role="dialog" aria-labelledby="codex-title">
      <header class="codex-header">
        <div>
          <h2 id="codex-title" class="codex-title">图鉴</h2>
          <p class="codex-subtitle">查看炮台与敌人的能力与克制关系</p>
        </div>
        <button type="button" class="codex-close" aria-label="关闭图鉴">×</button>
      </header>
      <div class="codex-tabs" role="tablist">
        <button type="button" class="codex-tab is-active" data-tab="towers" role="tab" aria-selected="true">炮台图鉴</button>
        <button type="button" class="codex-tab" data-tab="enemies" role="tab" aria-selected="false">敌人图鉴</button>
      </div>
      <div class="codex-body">
        <aside class="codex-list" role="tabpanel"></aside>
        <section class="codex-detail">
          <div class="codex-detail-inner">
            <div class="codex-preview-wrap">
              <canvas class="codex-preview-canvas" width="160" height="100" aria-hidden="true"></canvas>
            </div>
            <div class="codex-detail-scroll" tabindex="0" aria-label="图鉴详细说明，可滚动查看"></div>
          </div>
        </section>
      </div>
    </div>
  `;

  const listEl = overlay.querySelector('.codex-list');
  const detailScrollEl = overlay.querySelector('.codex-detail-scroll');
  const canvas = overlay.querySelector('.codex-preview-canvas');
  const ctx = canvas.getContext('2d');
  const tabs = overlay.querySelectorAll('.codex-tab');

  let activeTab = 'towers';
  let selectedId = towerEntries[0]?.id ?? 'normal';
  let animRaf = 0;
  let animStart = 0;
  let isOpen = false;

  function buildListItems(entries, tab) {
    listEl.innerHTML = entries
      .map(
        (e) => `
      <button
        type="button"
        class="codex-list-item${e.id === selectedId ? ' is-active' : ''}"
        data-id="${e.id}"
        data-tab="${tab}"
      >
        <span class="codex-list-swatch" style="background:${e.color || '#95a5a6'}"></span>
        <span class="codex-list-name">${e.name}</span>
      </button>
    `
      )
      .join('');
  }

  function renderDetail() {
    if (activeTab === 'towers') {
      const entry = getTowerCodexEntry(selectedId);
      detailScrollEl.innerHTML = entry ? renderTowerDetail(entry) : '';
    } else {
      const entry = getEnemyCodexEntry(selectedId);
      detailScrollEl.innerHTML = entry ? renderEnemyDetail(entry) : '';
    }
  }

  function renderList() {
    if (activeTab === 'towers') {
      buildListItems(towerEntries, 'towers');
    } else {
      buildListItems(enemyEntries, 'enemies');
    }
    renderDetail();
  }

  function drawPreview(now) {
    if (!isOpen) return;
    const t = (now - animStart) * 0.001;
    if (activeTab === 'towers') {
      drawCodexTowerPreview(ctx, canvas.width, canvas.height, selectedId, t);
    } else {
      drawCodexEnemyPreview(ctx, canvas.width, canvas.height, selectedId, t);
    }
    animRaf = requestAnimationFrame(drawPreview);
  }

  function startAnim() {
    cancelAnimationFrame(animRaf);
    animStart = performance.now();
    animRaf = requestAnimationFrame(drawPreview);
  }

  function stopAnim() {
    cancelAnimationFrame(animRaf);
    animRaf = 0;
  }

  function setTab(tab) {
    activeTab = tab;
    tabs.forEach((btn) => {
      const on = btn.dataset.tab === tab;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    selectedId = tab === 'towers' ? towerEntries[0]?.id : enemyEntries[0]?.id;
    renderList();
    startAnim();
  }

  function selectItem(id) {
    selectedId = id;
    listEl.querySelectorAll('.codex-list-item').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.id === id);
    });
    renderDetail();
    startAnim();
  }

  tabs.forEach((btn) => {
    btn.addEventListener('click', () => setTab(btn.dataset.tab));
  });

  listEl.addEventListener('click', (event) => {
    const item = event.target.closest('.codex-list-item');
    if (!item) return;
    selectItem(item.dataset.id);
  });

  overlay.querySelector('.codex-close').addEventListener('click', () => close());
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  function open(tab = 'towers') {
    isOpen = true;
    overlay.classList.remove('hidden');
    setTab(tab);
  }

  function close() {
    isOpen = false;
    overlay.classList.add('hidden');
    stopAnim();
  }

  return {
    mount(parent) {
      parent.appendChild(overlay);
    },
    open,
    close
  };
}
