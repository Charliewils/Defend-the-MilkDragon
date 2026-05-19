export function createHud({
  goldEl,
  waveEl,
  waveTotalEl,
  livesEl,
  waveProgressFillEl,
  waveProgressLabelEl,
  modeBadgeEl,
  endlessStatsEl,
  endlessWaveEl,
  endlessBestEl
}) {
  let goldAnimFrame = 0;
  let skipGoldTextUpdate = false;

  return {
    setSkipGoldTextUpdate(value) {
      skipGoldTextUpdate = Boolean(value);
    },
    playGoldBump() {
      goldEl.classList.remove('hud-gold-bump');
      // reflow to restart animation
      void goldEl.offsetWidth;
      goldEl.classList.add('hud-gold-bump');
    },
    animateGoldCount(from, to, durationMs = 420, onDone = null) {
      cancelAnimationFrame(goldAnimFrame);
      const start = performance.now();
      const span = to - from;
      const tick = (now) => {
        const u = Math.min(1, (now - start) / durationMs);
        const eased = 1 - (1 - u) * (1 - u);
        goldEl.textContent = String(Math.round(from + span * eased));
        if (u < 1) {
          goldAnimFrame = requestAnimationFrame(tick);
        } else {
          goldEl.textContent = String(to);
          onDone?.();
        }
      };
      goldAnimFrame = requestAnimationFrame(tick);
    },
    update({
      gold,
      wave,
      totalWaves,
      lives,
      waveProgress,
      waveProgressLabel,
      showEndlessBadge,
      showEndlessStats,
      endlessBestWave
    }) {
      if (!skipGoldTextUpdate) {
        goldEl.textContent = gold;
      }
      waveEl.textContent = wave;
      waveTotalEl.textContent = totalWaves;
      livesEl.textContent = lives;
      livesEl.parentElement?.setAttribute('aria-label', `剩余生命 ${lives}`);
      waveProgressFillEl.style.width = `${Math.round(waveProgress * 100)}%`;
      waveProgressLabelEl.textContent = waveProgressLabel;
      modeBadgeEl.classList.toggle('hidden', !showEndlessBadge);
      endlessStatsEl.classList.toggle('hidden', !showEndlessStats);
      endlessWaveEl.textContent = wave;
      endlessBestEl.textContent = endlessBestWave;
    }
  };
}
