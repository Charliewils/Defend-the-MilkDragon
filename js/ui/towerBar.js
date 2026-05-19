import { TOWER_ORDER, TOWER_TYPES } from '../config/constants.js';

const SCROLL_DURATION = 0.15;
const ITEM_GAP = 8;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

export function createTowerBar(container, { onSelect, getGold, onClosePanel }) {
  container.classList.add('tower-bar');
  const shell = document.createElement('div');
  shell.className = 'tower-bar-shell';
  shell.innerHTML = `
    <button type="button" class="tower-bar-scroll-arrow tower-bar-scroll-up" aria-label="向上滚动">▲</button>
    <div class="tower-bar-viewport">
      <div class="tower-bar-track"></div>
      <div class="tower-bar-scrollbar" aria-hidden="true">
        <div class="tower-bar-scrollbar-thumb"></div>
      </div>
    </div>
    <button type="button" class="tower-bar-scroll-arrow tower-bar-scroll-down" aria-label="向下滚动">▼</button>
  `;
  container.appendChild(shell);

  const viewport = shell.querySelector('.tower-bar-viewport');
  const track = shell.querySelector('.tower-bar-track');
  const scrollbar = shell.querySelector('.tower-bar-scrollbar');
  const thumb = shell.querySelector('.tower-bar-scrollbar-thumb');
  const upBtn = shell.querySelector('.tower-bar-scroll-up');
  const downBtn = shell.querySelector('.tower-bar-scroll-down');

  const buttons = new Map();
  let selectedType = TOWER_ORDER[0];
  let scrollOffset = 0;
  let scrollAnim = null;

  for (const typeId of TOWER_ORDER) {
    const config = TOWER_TYPES[typeId];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tower-btn';
    button.dataset.type = typeId;
    button.innerHTML = `
      <span class="tower-recommend-badge hidden" data-role="badge"></span>
      <span class="tower-icon" style="background:${config.color}"></span>
      <span class="tower-name">${config.name}</span>
      <span class="tower-cost">${config.cost} 金币</span>
    `;
    button.addEventListener('click', () => {
      selectedType = typeId;
      syncSelection();
      onSelect(typeId);
      onClosePanel?.();
    });
    track.appendChild(button);
    buttons.set(typeId, button);
  }

  function getViewportHeight() {
    return viewport.clientHeight;
  }

  function getMaxScroll() {
    return Math.max(0, track.scrollHeight - getViewportHeight());
  }

  function clampScroll(value) {
    return Math.max(0, Math.min(value, getMaxScroll()));
  }

  function getItemStep() {
    const button = buttons.get(TOWER_ORDER[0]);
    if (!button) return 80;
    return button.offsetHeight + ITEM_GAP;
  }

  function applyScroll(offset) {
    scrollOffset = clampScroll(offset);
    track.style.transform = `translateY(${-scrollOffset}px)`;

    const maxScroll = getMaxScroll();
    const viewportHeight = getViewportHeight();
    const trackHeight = track.scrollHeight;
    if (maxScroll <= 0) {
      thumb.style.height = '100%';
      thumb.style.transform = 'translateY(0)';
      return;
    }

    const thumbHeight = Math.max(24, (viewportHeight / trackHeight) * viewportHeight);
    const thumbOffset = (scrollOffset / maxScroll) * (viewportHeight - thumbHeight);
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbOffset}px)`;
  }

  function animateScrollTo(targetOffset) {
    const startOffset = scrollOffset;
    const endOffset = clampScroll(targetOffset);
    if (Math.abs(endOffset - startOffset) < 0.5) {
      applyScroll(endOffset);
      return;
    }

    if (scrollAnim) {
      cancelAnimationFrame(scrollAnim.rafId);
    }

    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / (SCROLL_DURATION * 1000));
      const eased = easeOutCubic(progress);
      applyScroll(startOffset + (endOffset - startOffset) * eased);
      if (progress < 1) {
        scrollAnim = { rafId: requestAnimationFrame(step) };
      } else {
        scrollAnim = null;
      }
    };
    scrollAnim = { rafId: requestAnimationFrame(step) };
  }

  function scrollByItem(direction) {
    animateScrollTo(scrollOffset + direction * getItemStep());
  }

  function ensureSelectedVisible() {
    const button = buttons.get(selectedType);
    if (!button) return;

    const top = button.offsetTop;
    const bottom = top + button.offsetHeight;
    const viewportHeight = getViewportHeight();

    if (top < scrollOffset) {
      animateScrollTo(top);
      return;
    }

    if (bottom > scrollOffset + viewportHeight) {
      animateScrollTo(bottom - viewportHeight);
    }
  }

  /**
   * @param {{ ensureVisible?: boolean }} [opts]
   * `ensureVisible` 仅在用户切换炮台等场景为 true。每帧 `refresh()` 只更新金币可买状态，
   * 若为 true 会反复 `ensureSelectedVisible()`，与游戏中拖动侧栏滚动条冲突。
   */
  function syncSelection(opts = {}) {
    const { ensureVisible = true } = opts;
    const gold = getGold();
    for (const [typeId, button] of buttons) {
      button.classList.toggle('selected', typeId === selectedType);
      button.classList.toggle('unaffordable', gold < TOWER_TYPES[typeId].cost);
    }
    if (ensureVisible) {
      ensureSelectedVisible();
    }
  }

  container.addEventListener('wheel', (event) => {
    if (!container.matches(':hover')) return;
    event.preventDefault();
    animateScrollTo(scrollOffset + event.deltaY);
  }, { passive: false });

  let dragState = null;
  viewport.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.tower-btn')) return;
    dragState = {
      startY: event.clientY,
      startOffset: scrollOffset,
      pointerId: event.pointerId
    };
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener('pointermove', (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    applyScroll(dragState.startOffset - (event.clientY - dragState.startY));
  });

  function endDrag(event) {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    viewport.releasePointerCapture(event.pointerId);
    dragState = null;
  }

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  /** 将指针在滚动条轨道上的 Y 映射为 scrollOffset（滚动条可接收指针事件，避免穿透到炮台按钮） */
  function scrollOffsetFromScrollbarClientY(clientY) {
    const rect = scrollbar.getBoundingClientRect();
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const maxScroll = getMaxScroll();
    const viewportHeight = getViewportHeight();
    const trackHeight = track.scrollHeight;
    if (maxScroll <= 0) return 0;
    const thumbHeight = Math.max(24, (viewportHeight / trackHeight) * viewportHeight);
    const travel = Math.max(0.001, viewportHeight - thumbHeight);
    const t = Math.max(0, Math.min(1, (y - thumbHeight * 0.5) / travel));
    return t * maxScroll;
  }

  let scrollbarDragPointerId = null;
  scrollbar.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    applyScroll(scrollOffsetFromScrollbarClientY(event.clientY));
    scrollbarDragPointerId = event.pointerId;
    scrollbar.setPointerCapture(event.pointerId);
  });

  scrollbar.addEventListener('pointermove', (event) => {
    if (scrollbarDragPointerId !== event.pointerId) return;
    applyScroll(scrollOffsetFromScrollbarClientY(event.clientY));
  });

  function endScrollbarDrag(event) {
    if (scrollbarDragPointerId !== event.pointerId) return;
    scrollbar.releasePointerCapture(event.pointerId);
    scrollbarDragPointerId = null;
  }

  scrollbar.addEventListener('pointerup', endScrollbarDrag);
  scrollbar.addEventListener('pointercancel', endScrollbarDrag);

  upBtn.addEventListener('click', () => scrollByItem(-1));
  downBtn.addEventListener('click', () => scrollByItem(1));

  const resizeObserver = new ResizeObserver(() => {
    applyScroll(scrollOffset);
    ensureSelectedVisible();
  });
  resizeObserver.observe(viewport);

  applyScroll(0);

  return {
    getSelectedType() {
      return selectedType;
    },
    setSelectedType(typeId) {
      if (buttons.has(typeId)) {
        selectedType = typeId;
        syncSelection({ ensureVisible: true });
      }
    },
    refresh() {
      syncSelection({ ensureVisible: false });
    },
    setRecommendations({ primary, secondary, confidence, secondaryConfidence }) {
      for (const [typeId, button] of buttons) {
        const badge = button.querySelector('[data-role="badge"]');
        badge.classList.add('hidden');
        badge.classList.remove('ai-recommend-gold', 'ai-recommend-silver');
        button.classList.remove('ai-recommended-primary', 'ai-recommended-secondary');

        if (typeId === primary) {
          badge.textContent = `AI推荐 ⭐ ${confidence}%`;
          badge.classList.add('ai-recommend-gold');
          badge.classList.remove('hidden');
          button.classList.add('ai-recommended-primary');
        } else if (typeId === secondary) {
          badge.textContent = `★ ${secondaryConfidence ?? Math.round(confidence * 0.85)}%`;
          badge.classList.add('ai-recommend-silver');
          badge.classList.remove('hidden');
          button.classList.add('ai-recommended-secondary');
        }
      }
    },
    clearRecommendations() {
      for (const [, button] of buttons) {
        button.querySelector('[data-role="badge"]')?.classList.add('hidden');
        button.classList.remove('ai-recommended-primary', 'ai-recommended-secondary');
      }
    }
  };
}
