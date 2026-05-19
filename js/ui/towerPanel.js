export function createTowerPanel(container, { onUpgrade, onSell, onClose }) {
  container.innerHTML = `
    <div class="tower-panel-header">
      <div class="tower-panel-title">炮塔信息</div>
      <button type="button" class="tower-panel-close" aria-label="关闭">×</button>
    </div>
    <div class="tower-panel-name"></div>
    <div class="tower-panel-level"></div>
    <div class="tower-panel-stats"></div>
    <p class="tower-panel-effect"></p>
    <div class="tower-panel-actions">
      <button type="button" class="tower-panel-upgrade">升级</button>
      <button type="button" class="tower-panel-sell">出售</button>
    </div>
  `;

  const nameEl = container.querySelector('.tower-panel-name');
  const levelEl = container.querySelector('.tower-panel-level');
  const statsEl = container.querySelector('.tower-panel-stats');
  const effectEl = container.querySelector('.tower-panel-effect');
  const upgradeBtn = container.querySelector('.tower-panel-upgrade');
  const sellBtn = container.querySelector('.tower-panel-sell');
  const closeBtn = container.querySelector('.tower-panel-close');

  closeBtn.addEventListener('click', () => {
    hide();
    onClose();
  });
  upgradeBtn.addEventListener('click', () => onUpgrade());
  sellBtn.addEventListener('click', () => onSell());

  function hide() {
    container.classList.add('hidden');
  }

  function show(tower, gold) {
    if (!tower) {
      hide();
      return;
    }

    const stats = tower.getStats();
    const upgradeCost = tower.upgradeCost;
    const sellValue = tower.getSellValue();

    container.classList.remove('hidden');
    nameEl.textContent = stats.name;
    levelEl.textContent = `当前等级：Lv${stats.level}`;

    statsEl.innerHTML = `
      <div>伤害：<strong>${stats.damage}</strong></div>
      <div>范围：<strong>${stats.range}px</strong></div>
      <div>射速：<strong>${stats.fireRate.toFixed(1)} 发/秒</strong></div>
    `;
    effectEl.textContent = stats.effectDescription;

    sellBtn.disabled = false;
    sellBtn.textContent = `出售 (+${sellValue} 金币)`;

    if (!tower.canUpgrade()) {
      upgradeBtn.textContent = '已满级';
      upgradeBtn.disabled = true;
      return;
    }

    const affordable = gold >= upgradeCost;
    upgradeBtn.disabled = !affordable;
    upgradeBtn.textContent = affordable
      ? `升级 (${upgradeCost} 金币)`
      : `金币不足 (${upgradeCost} 金币)`;
  }

  return { show, hide };
}
