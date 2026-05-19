export function createWavePreview(rootEl) {
  const titleEl = rootEl.querySelector('.wave-preview-title');
  const detailEl = rootEl.querySelector('.wave-preview-detail');
  const bossEl = rootEl.querySelector('.wave-preview-boss');

  let aiAdviceEl = rootEl.querySelector('.wave-preview-ai');
  if (!aiAdviceEl) {
    aiAdviceEl = document.createElement('div');
    aiAdviceEl.className = 'wave-preview-ai hidden';
    rootEl.appendChild(aiAdviceEl);
  }

  return {
    show({ wave, detail, isBossWave, aiAdvice }) {
      titleEl.textContent = `第 ${wave} 波`;
      detailEl.textContent = detail;
      bossEl.classList.toggle('hidden', !isBossWave);
      rootEl.classList.toggle('is-boss-wave', Boolean(isBossWave));
      if (aiAdvice) {
        aiAdviceEl.textContent = aiAdvice;
        aiAdviceEl.classList.remove('hidden');
      } else {
        aiAdviceEl.textContent = '';
        aiAdviceEl.classList.add('hidden');
      }
      rootEl.classList.remove('hidden');
      rootEl.style.opacity = '1';
    },
    setOpacity(opacity) {
      rootEl.style.opacity = String(opacity);
    },
    setAiAdvice(text) {
      if (text) {
        aiAdviceEl.textContent = text;
        aiAdviceEl.classList.remove('hidden');
      } else {
        aiAdviceEl.textContent = '';
        aiAdviceEl.classList.add('hidden');
      }
    },
    hide() {
      rootEl.classList.add('hidden');
      rootEl.classList.remove('is-boss-wave');
      rootEl.style.opacity = '1';
      aiAdviceEl.classList.add('hidden');
    }
  };
}
