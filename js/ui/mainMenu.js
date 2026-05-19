export function createMainMenu(container, { onCampaign, onEndless, onShop, onAiInfo, getGemBalance }) {
  container.innerHTML = `
    <div class="menu-utility-bar">
      <div id="menu-audio-controls" class="menu-audio-controls"></div>
      <div class="menu-topbar">
        <div class="menu-gem-wallet" aria-label="宝石余额">
          <span class="menu-gem-icon" aria-hidden="true">💎</span>
          <span class="menu-gem-count">0</span>
        </div>
        <button type="button" class="menu-shop-btn" data-action="shop">宝石商店</button>
      </div>
    </div>
    <h1 class="menu-title">保卫奶龙</h1>
    <p class="menu-subtitle">选择你的战场</p>
    <div class="menu-actions">
      <button type="button" class="menu-btn" data-action="campaign">闯关模式</button>
      <button type="button" class="menu-btn menu-btn-secondary" data-action="endless">无尽模式</button>
    </div>
    <button type="button" class="menu-ai-info-btn" data-action="ai-info">AI说明</button>
  `;

  const gemCountEl = container.querySelector('.menu-gem-count');

  function refresh() {
    gemCountEl.textContent = String(getGemBalance?.() ?? 0);
  }

  container.querySelector('[data-action="campaign"]').addEventListener('click', () => onCampaign());
  container.querySelector('[data-action="endless"]').addEventListener('click', () => onEndless());
  container.querySelector('[data-action="shop"]').addEventListener('click', () => onShop?.());
  container.querySelector('[data-action="ai-info"]')?.addEventListener('click', () => onAiInfo?.());

  refresh();
  return { refresh };
}
