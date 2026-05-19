export function createGameControls(container, { onPause, onResume, onRestart, onBackToMap }) {
  container.innerHTML = `
    <button type="button" class="game-control-btn" data-action="pause">暂停</button>
    <button type="button" class="game-control-btn" data-action="resume" disabled>继续</button>
    <button type="button" class="game-control-btn" data-action="restart">重新开始</button>
    <button type="button" class="game-control-btn" data-action="back">返回地图</button>
  `;

  const pauseBtn = container.querySelector('[data-action="pause"]');
  const resumeBtn = container.querySelector('[data-action="resume"]');
  const restartBtn = container.querySelector('[data-action="restart"]');
  const backBtn = container.querySelector('[data-action="back"]');

  pauseBtn.addEventListener('click', () => onPause());
  resumeBtn.addEventListener('click', () => onResume());
  restartBtn.addEventListener('click', () => onRestart());
  backBtn.addEventListener('click', () => onBackToMap());

  return {
    setPaused(paused) {
      pauseBtn.disabled = paused;
      resumeBtn.disabled = !paused;
    }
  };
}
