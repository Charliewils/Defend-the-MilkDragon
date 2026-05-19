function percentToVolume(percent) {
  return Math.max(0, Math.min(1, percent / 100));
}

function volumeToPercent(volume) {
  return Math.round(Math.max(0, Math.min(1, volume)) * 100);
}

export function createAudioControls(container, audioManager) {
  container.classList.add('audio-controls-wrap');
  container.innerHTML = `
    <div class="audio-control-row" data-channel="bgm">
      <button type="button" class="audio-toggle-btn" data-channel="bgm" aria-label="背景音乐开关">🎵</button>
      <input type="range" class="audio-volume-slider" data-channel="bgm" min="0" max="100" value="40" aria-label="背景音乐音量">
    </div>
    <div class="audio-control-row" data-channel="sfx">
      <button type="button" class="audio-toggle-btn" data-channel="sfx" aria-label="音效开关">🔊</button>
      <input type="range" class="audio-volume-slider" data-channel="sfx" min="0" max="100" value="70" aria-label="音效音量">
    </div>
  `;

  const bgmToggle = container.querySelector('[data-channel="bgm"].audio-toggle-btn');
  const sfxToggle = container.querySelector('[data-channel="sfx"].audio-toggle-btn');
  const bgmSlider = container.querySelector('[data-channel="bgm"].audio-volume-slider');
  const sfxSlider = container.querySelector('[data-channel="sfx"].audio-volume-slider');

  function sync(state) {
    bgmSlider.value = String(volumeToPercent(state.bgmVolume));
    sfxSlider.value = String(volumeToPercent(state.sfxVolume));
    bgmToggle.textContent = state.bgmMuted ? '🔇' : '🎵';
    sfxToggle.textContent = state.sfxMuted ? '🔈' : '🔊';
    bgmToggle.classList.toggle('is-muted', state.bgmMuted);
    sfxToggle.classList.toggle('is-muted', state.sfxMuted);
  }

  bgmToggle.addEventListener('click', () => {
    audioManager.toggleBGMMute();
  });
  sfxToggle.addEventListener('click', () => {
    audioManager.toggleSFXMute();
  });
  bgmSlider.addEventListener('input', () => {
    audioManager.setBGMVolume(percentToVolume(Number(bgmSlider.value)));
  });
  sfxSlider.addEventListener('input', () => {
    audioManager.setSFXVolume(percentToVolume(Number(sfxSlider.value)));
  });

  sync(audioManager.getSettingsState());
  return audioManager.onSettingsChange(sync);
}
