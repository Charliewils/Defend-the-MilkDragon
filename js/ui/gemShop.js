import {
  COSMETIC_CATEGORIES,
  COSMETIC_ITEMS,
  DEFAULT_COSMETICS
} from '../config/cosmetics.js';
import { drawRadishStylePreview } from '../cosmetics/radishStyles.js';
import {
  equipCosmetic,
  equipDefaultCosmetic,
  getGemBalance,
  loadGemState,
  ownsCosmetic,
  purchaseCosmetic
} from '../storage/gemInventory.js';

function getEquippedId(category) {
  const state = loadGemState();
  return state.equipped[category] || DEFAULT_COSMETICS[category];
}

function renderShopItem(item, balance) {
  const owned = ownsCosmetic(item.id);
  const equipped = getEquippedId(item.category) === item.id;
  const canAfford = balance >= item.price;

  let actionLabel = `购买 ${item.price} 宝石`;
  let actionClass = 'gem-shop-btn';
  let action = 'buy';
  let disabled = false;

  if (owned) {
    action = equipped ? 'equipped' : 'equip';
    actionLabel = equipped ? '已装备' : '装备';
    actionClass = equipped ? 'gem-shop-btn is-equipped' : 'gem-shop-btn';
    disabled = equipped;
  } else if (!canAfford) {
    actionClass = 'gem-shop-btn is-disabled';
    disabled = true;
  }

  const previewMarkup = item.previewStyle
    ? `<canvas class="gem-shop-preview gem-shop-preview-canvas" data-preview-style="${item.previewStyle}" width="240" height="144" aria-hidden="true"></canvas>`
    : `<div class="gem-shop-preview" style="background:${item.preview}"></div>`;

  const featuredClass = item.id === 'radish_nailong' ? ' is-featured' : '';

  return `
    <article class="gem-shop-item${featuredClass}" data-id="${item.id}">
      ${previewMarkup}
      <div class="gem-shop-item-body">
        <h3 class="gem-shop-item-title">${item.name}</h3>
        <p class="gem-shop-item-desc">${item.description}</p>
        <button
          type="button"
          class="${actionClass}"
          data-action="${action}"
          data-id="${item.id}"
          ${disabled ? 'disabled' : ''}
        >${actionLabel}</button>
      </div>
    </article>
  `;
}

export function createGemShop(container, { onChange }) {
  container.className = 'gem-shop hidden';

  function render() {
    const balance = getGemBalance();
    const towerItems = COSMETIC_ITEMS.filter((item) => item.category === COSMETIC_CATEGORIES.towerSkin);
    const radishItems = COSMETIC_ITEMS.filter((item) => item.category === COSMETIC_CATEGORIES.radishStyle);

    container.innerHTML = `
      <div class="gem-shop-panel" role="dialog" aria-labelledby="gem-shop-title">
        <div class="gem-shop-header">
          <div>
            <h2 id="gem-shop-title" class="gem-shop-title">宝石商店</h2>
            <p class="gem-shop-subtitle">外观仅改变造型，不影响战斗数值。内容较多时请用右侧滚动条查看。</p>
          </div>
          <div class="gem-shop-balance">当前宝石：<strong>${balance}</strong></div>
          <button type="button" class="gem-shop-close" aria-label="关闭商店">×</button>
        </div>
        <div class="gem-shop-scroll" tabindex="0" aria-label="商店商品列表">
        <section class="gem-shop-section">
          <h3 class="gem-shop-section-title">萝卜造型</h3>
          <div class="gem-shop-grid">
            ${radishItems.map((item) => renderShopItem(item, balance)).join('')}
          </div>
          <button type="button" class="gem-shop-reset" data-action="reset" data-category="${COSMETIC_CATEGORIES.radishStyle}">
            恢复默认萝卜
          </button>
        </section>
        <section class="gem-shop-section">
          <h3 class="gem-shop-section-title">炮台皮肤</h3>
          <div class="gem-shop-grid">
            ${towerItems.map((item) => renderShopItem(item, balance)).join('')}
          </div>
          <button type="button" class="gem-shop-reset" data-action="reset" data-category="${COSMETIC_CATEGORIES.towerSkin}">
            恢复默认炮台
          </button>
        </section>
        </div>
      </div>
    `;

    paintStylePreviews();
  }

  function paintStylePreviews() {
    for (const canvas of container.querySelectorAll('[data-preview-style]')) {
      if (!(canvas instanceof HTMLCanvasElement)) continue;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      drawRadishStylePreview(ctx, canvas.dataset.previewStyle);
    }
  }

  function open() {
    render();
    container.classList.remove('hidden');
  }

  function close() {
    container.classList.add('hidden');
  }

  container.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.classList.contains('gem-shop-close') || target === container) {
      close();
      return;
    }

    const action = target.dataset.action;
    const id = target.dataset.id;
    const category = target.dataset.category;

    if (action === 'buy' && id) {
      const result = purchaseCosmetic(id);
      if (!result.ok && result.reason === 'insufficient') {
        target.textContent = '宝石不足';
        window.setTimeout(render, 900);
        return;
      }
      onChange?.();
      render();
      return;
    }

    if (action === 'equip' && id) {
      equipCosmetic(id);
      onChange?.();
      render();
      return;
    }

    if (action === 'reset' && category) {
      equipDefaultCosmetic(category);
      onChange?.();
      render();
    }
  });

  return { open, close, render };
}
