function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remain).padStart(2, '0')}`;
}

function formatGemsLine(gemsEarned) {
  if (!gemsEarned) return '';
  return `<div>获得宝石：<strong>${gemsEarned}</strong></div>`;
}

export function createResultScreen(container, { onRetry, onBackToMap, onStarEarn }) {
  container.innerHTML = `
    <div class="result-card">
      <h2 class="result-title"></h2>
      <div class="result-stars" aria-label="星级评分">
        <span class="result-star" data-index="0">★</span>
        <span class="result-star" data-index="1">★</span>
        <span class="result-star" data-index="2">★</span>
      </div>
      <div class="result-stats"></div>
      <div class="result-actions">
        <button type="button" class="result-btn" data-action="retry">再玩一次</button>
        <button type="button" class="result-btn result-btn-secondary" data-action="back">返回地图</button>
      </div>
    </div>
  `;

  const titleEl = container.querySelector('.result-title');
  const statsEl = container.querySelector('.result-stats');
  const starsEl = container.querySelector('.result-stars');
  const starEls = [...container.querySelectorAll('.result-star')];
  let timers = [];

  function clearTimers() {
    for (const timer of timers) {
      clearTimeout(timer);
    }
    timers = [];
  }

  function hide() {
    clearTimers();
    container.classList.add('hidden');
    starsEl.classList.remove('hidden');
    for (const star of starEls) {
      star.classList.remove('earned', 'dim', 'pop');
    }
  }

  function show(payload) {
    const {
      mode,
      success,
      stars,
      enemiesKilled,
      goldEarned,
      elapsedSeconds,
      endlessWaveReached,
      endlessBestWave,
      gemsEarned
    } = payload;

    clearTimers();
    container.classList.remove('hidden');

    if (mode === 'endless') {
      starsEl.classList.add('hidden');
      titleEl.textContent = '无尽模式结束';
      statsEl.innerHTML = `
        <div>撑到了第 <strong>${endlessWaveReached}</strong> 波</div>
        <div>历史最高波次：<strong>${endlessBestWave}</strong></div>
        <div>消灭敌人数：<strong>${enemiesKilled}</strong></div>
        <div>获得金币：<strong>${goldEarned}</strong></div>
        ${formatGemsLine(gemsEarned)}
        <div>用时：<strong>${formatDuration(elapsedSeconds)}</strong></div>
      `;
      return;
    }

    starsEl.classList.remove('hidden');
    titleEl.textContent = success ? '关卡完成！' : '失败';
    statsEl.innerHTML = `
      <div>消灭敌人数：<strong>${enemiesKilled}</strong></div>
      <div>获得金币：<strong>${goldEarned}</strong></div>
      ${formatGemsLine(gemsEarned)}
      <div>用时：<strong>${formatDuration(elapsedSeconds)}</strong></div>
    `;

    for (const star of starEls) {
      star.classList.remove('earned', 'dim', 'pop');
    }

    for (let index = 0; index < starEls.length; index += 1) {
      const timer = setTimeout(() => {
        const star = starEls[index];
        if (stars >= index + 1) {
          star.classList.add('earned', 'pop');
          onStarEarn?.(index);
          return;
        }
        star.classList.add('dim');
      }, index * 300);
      timers.push(timer);
    }
  }

  container.querySelector('[data-action="retry"]').addEventListener('click', () => onRetry());
  container.querySelector('[data-action="back"]').addEventListener('click', () => onBackToMap());

  return { show, hide };
}
