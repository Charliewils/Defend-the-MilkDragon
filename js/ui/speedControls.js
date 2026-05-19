export const SPEED_PRESETS = [0.5, 1, 2];

export function createSpeedControls(container, { onSelect }) {
  container.innerHTML = `
    <div class="speed-controls" role="group" aria-label="游戏速度">
      ${SPEED_PRESETS.map((speed) => `
        <button
          type="button"
          class="speed-control-btn${speed === 1 ? ' active' : ''}"
          data-speed="${speed}"
        >${speed}×</button>
      `).join('')}
    </div>
  `;

  const buttons = [...container.querySelectorAll('.speed-control-btn')];

  function setActive(speed) {
    for (const button of buttons) {
      button.classList.toggle('active', Number(button.dataset.speed) === speed);
    }
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const speed = Number(button.dataset.speed);
      onSelect(speed);
      setActive(speed);
    });
  }

  return {
    setActive,
    reset() {
      setActive(1);
    }
  };
}
