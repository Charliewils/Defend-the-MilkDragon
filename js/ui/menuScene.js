import {
  drawMenuEnemyIcon,
  drawMenuRadish,
  drawMenuTowerIcon,
  drawTowerShadow
} from '../render/vectorArt.js';

const TOWER_TYPES = ['normal', 'ice', 'hell', 'spread'];
const ENEMY_TYPES = ['normal', 'rush', 'stealth', 'normal'];

export function createMenuScene(container) {
  const wrap = document.createElement('div');
  wrap.className = 'menu-hero-canvas-wrap';
  const canvas = document.createElement('canvas');
  canvas.className = 'menu-hero-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  wrap.appendChild(canvas);
  container.prepend(wrap);

  const legacyHero = container.querySelector('.menu-hero:not(.menu-hero-canvas-wrap)');
  if (legacyHero) legacyHero.remove();

  const ctx = canvas.getContext('2d');
  let raf = 0;
  let running = false;
  let t = 0;
  let w = 0;
  let h = 0;

  function resize() {
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawHills() {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#87ceeb');
    grad.addColorStop(0.42, '#b8e4f8');
    grad.addColorStop(0.72, '#c8e6b0');
    grad.addColorStop(1, '#7cb87a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(249, 231, 159, 0.9)';
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.18, Math.min(w, h) * 0.09, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(106, 176, 76, 0.55)';
    ctx.beginPath();
    ctx.ellipse(w * 0.22, h * 0.78, w * 0.28, h * 0.14, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.72, h * 0.82, w * 0.32, h * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(74, 143, 63, 0.75)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.88, w * 0.55, h * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPath() {
    const y = h * 0.72;
    ctx.strokeStyle = 'rgba(196, 165, 116, 0.5)';
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, y);
    ctx.bezierCurveTo(w * 0.25, y - 20, w * 0.45, y + 18, w * 0.55, y - 8);
    ctx.bezierCurveTo(w * 0.7, y - 28, w * 0.85, y + 12, w + 10, y - 4);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 248, 220, 0.85)';
    ctx.lineWidth = 10;
    ctx.stroke();
  }

  function drawClouds() {
    const clouds = [
      { x: w * 0.15 + Math.sin(t * 0.3) * 12, y: h * 0.14, s: 1 },
      { x: w * 0.55 + Math.sin(t * 0.25 + 1) * 15, y: h * 0.1, s: 1.15 },
      { x: w * 0.85 + Math.sin(t * 0.2 + 2) * 10, y: h * 0.16, s: 0.9 }
    ];
    for (const c of clouds) {
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, 28 * c.s, 12 * c.s, 0, 0, Math.PI * 2);
      ctx.ellipse(c.x + 22 * c.s, c.y - 4, 22 * c.s, 14 * c.s, 0, 0, Math.PI * 2);
      ctx.ellipse(c.x - 18 * c.s, c.y - 2, 20 * c.s, 11 * c.s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawParticles() {
    for (let i = 0; i < 8; i += 1) {
      const px = ((i * 97 + t * 40) % (w + 40)) - 20;
      const py = h * 0.35 + Math.sin(t * 1.2 + i) * 30 + (i % 3) * 18;
      ctx.fillStyle = `rgba(255,255,200,${0.35 + 0.2 * Math.sin(t + i)})`;
      ctx.beginPath();
      ctx.ellipse(px, py, 3, 5, t + i, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function frame(now) {
    if (!running) return;
    t = now * 0.001;
    ctx.clearRect(0, 0, w, h);
    drawHills();
    drawClouds();
    drawPath();
    drawParticles();

    const pathY = h * 0.72;
    const march = (t * 55) % (w + 80);
    for (let i = 0; i < 4; i += 1) {
      const ex = w + 40 - march - i * 55;
      const type = ENEMY_TYPES[i % ENEMY_TYPES.length];
      drawMenuEnemyIcon(ctx, ex, pathY - 8, type, t, i * 0.5);
    }

    for (let i = 0; i < TOWER_TYPES.length; i += 1) {
      const tx = w * (0.18 + i * 0.2);
      const ty = h * 0.48 + Math.sin(t * 1.8 + i) * 3;
      drawMenuTowerIcon(ctx, tx, ty, TOWER_TYPES[i], t + i);
    }

    drawMenuRadish(ctx, w * 0.5, h * 0.38, 1.15, t);

    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  }

  return { start, stop, resize };
}
