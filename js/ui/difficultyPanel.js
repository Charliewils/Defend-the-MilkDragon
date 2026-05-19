const FEATURE_LABELS = [
  { key: 'hpRatio', label: '萝卜血量' },
  { key: 'avgClearTime', label: '清怪速度' },
  { key: 'goldUsageRate', label: '金币使用率' },
  { key: 'towerUtilization', label: '炮台利用率' },
  { key: 'leakRate', label: '漏怪率' }
];

export function createDifficultyPanel() {
  const root = document.createElement('div');
  root.id = 'ai-difficulty-panel';
  root.className = 'ai-difficulty-panel collapsed';

  root.innerHTML = `
    <button type="button" class="ai-difficulty-header" aria-expanded="false">
      <span class="ai-difficulty-title">AI难度监测</span>
      <span class="ai-difficulty-toggle" aria-hidden="true">▼</span>
    </button>
    <div class="ai-difficulty-body"></div>
  `;

  const body = root.querySelector('.ai-difficulty-body');
  const featureEls = new Map();

  for (const { key, label } of FEATURE_LABELS) {
    const row = document.createElement('div');
    row.className = 'ai-feature-row';
    row.innerHTML = `
      <div class="ai-feature-label">
        <span>${label}</span>
        <span class="ai-feature-value" data-key="${key}">0%</span>
      </div>
      <div class="ai-feature-track">
        <div class="ai-feature-fill" data-key="${key}"></div>
      </div>
    `;
    body.appendChild(row);
    featureEls.set(key, {
      fill: row.querySelector('.ai-feature-fill'),
      value: row.querySelector('.ai-feature-value')
    });
  }

  const scaleBlock = document.createElement('div');
  scaleBlock.className = 'ai-scale-block';
  scaleBlock.innerHTML = `
    <div class="ai-scale-value" data-role="scale">1.00</div>
    <div class="ai-scale-label" data-role="label">正常难度 😐</div>
  `;
  body.appendChild(scaleBlock);

  const scaleEl = scaleBlock.querySelector('[data-role="scale"]');
  const labelEl = scaleBlock.querySelector('[data-role="label"]');

  const header = root.querySelector('.ai-difficulty-header');
  header.addEventListener('click', () => {
    const collapsed = root.classList.toggle('collapsed');
    header.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  });

  let displayValues = FEATURE_LABELS.reduce((acc, { key }) => {
    acc[key] = 0;
    return acc;
  }, {});

  function animateTo(key, target, dt = 0.16) {
    displayValues[key] += (target - displayValues[key]) * Math.min(1, dt * 6);
    if (Math.abs(target - displayValues[key]) < 0.002) {
      displayValues[key] = target;
    }
  }

  return {
    mount(parent) {
      parent.appendChild(root);
    },
    show() {
      root.classList.remove('hidden');
    },
    hide() {
      root.classList.add('hidden');
    },
    update({ features, scale, label }, dt = 0.16) {
      for (const { key } of FEATURE_LABELS) {
        const target = features[key] ?? 0;
        animateTo(key, target, dt);
        const pct = Math.round(displayValues[key] * 100);
        const els = featureEls.get(key);
        els.fill.style.width = `${displayValues[key] * 100}%`;
        els.value.textContent = `${pct}%`;
      }
      scaleEl.textContent = scale.toFixed(2);
      labelEl.textContent = label;
    }
  };
}
