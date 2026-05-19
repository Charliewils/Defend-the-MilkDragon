export function createAiInfoModal() {
  const overlay = document.createElement('div');
  overlay.id = 'ai-info-modal';
  overlay.className = 'ai-info-modal hidden';
  overlay.innerHTML = `
    <div class="ai-info-card" role="dialog" aria-labelledby="ai-info-title">
      <h2 id="ai-info-title" class="ai-info-title">AI 系统说明</h2>
      <div class="ai-info-body">
        <p>本游戏内置两个神经网络：</p>
        <p><strong>① 自适应难度AI</strong>：实时分析你的游戏表现，动态调整敌人强度，让游戏始终保持挑战性。</p>
        <p><strong>② 炮台推荐AI</strong>：分析本波敌人构成，为你推荐最有效的炮台策略。</p>
        <p class="ai-info-foot">两个AI均使用 brain.js 在浏览器本地运行，无需联网，实时推理。</p>
      </div>
      <button type="button" class="ai-info-close">知道了</button>
    </div>
  `;

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) overlay.classList.add('hidden');
  });
  overlay.querySelector('.ai-info-close').addEventListener('click', () => {
    overlay.classList.add('hidden');
  });

  return {
    mount(parent) {
      parent.appendChild(overlay);
    },
    open() {
      overlay.classList.remove('hidden');
    },
    close() {
      overlay.classList.add('hidden');
    }
  };
}
