import { TOWER_CONFIGS } from '../config/towers.js';
import {
  drawCannonBarrel,
  drawEnemyBlob,
  drawEnemyEyes,
  drawPolygonBody,
  drawRadialBody,
  drawTowerPlatform,
  drawTowerShadow,
  polygonPoints,
  rgba
} from '../render/vectorArt.js';

const ENEMY_PREVIEW_STYLES = {
  normal: { base: '#e74c3c', light: '#ff8a7a', dark: '#c0392b', stroke: '#922b21', eyes: {} },
  rush: { base: '#f39c12', light: '#ffd180', dark: '#e67e22', stroke: '#d35400', eyes: { angry: true } },
  stealth: {
    base: '#5b2c6f',
    light: '#9b59b6',
    dark: '#4a235a',
    stroke: '#6c3483',
    eyes: { wide: true }
  },
  armor: { base: '#5d6d7e', light: '#aeb6bf', dark: '#34495e', stroke: '#2c3e50', eyes: { angry: true } },
  squad: { base: '#27ae60', light: '#58d68d', dark: '#1e8449', stroke: '#145a32', eyes: {} },
  split_worm: { base: '#1e8449', light: '#52be80', dark: '#145a32', stroke: '#0b5345', eyes: { wide: true } },
  mini_split_worm: { base: '#58d68d', light: '#abebc6', dark: '#27ae60', stroke: '#1e8449', eyes: {} },
  boss: { base: '#922b21', light: '#c0392b', dark: '#641e16', stroke: '#4a0e0e', eyes: { angry: true } }
};

function drawTowerBodyByType(ctx, typeId, r) {
  const cfg = TOWER_CONFIGS[typeId];
  if (!cfg) return;

  drawTowerPlatform(ctx, r, cfg.color, cfg.stroke);

  switch (typeId) {
    case 'ice': {
      const pts = polygonPoints(6, r * 0.78);
      const grad = ctx.createLinearGradient(0, -r, 0, r);
      grad.addColorStop(0, '#85c1e9');
      grad.addColorStop(1, cfg.color);
      drawPolygonBody(ctx, pts, grad, cfg.stroke);
      break;
    }
    case 'hell': {
      drawPolygonBody(
        ctx,
        [
          { x: 0, y: -r * 0.85 },
          { x: r * 0.85, y: 0 },
          { x: 0, y: r * 0.85 },
          { x: -r * 0.85, y: 0 }
        ],
        cfg.color,
        cfg.stroke
      );
      ctx.save();
      ctx.rotate(0.4);
      drawCannonBarrel(ctx, r * 0.7, 5, cfg.barrel, cfg.stroke);
      ctx.restore();
      ctx.save();
      ctx.rotate(-0.5);
      drawCannonBarrel(ctx, r * 0.65, 4, cfg.barrel, cfg.stroke);
      ctx.restore();
      return;
    }
    case 'lava': {
      ctx.beginPath();
      ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = rgba(cfg.color, 0.35);
      ctx.fill();
      drawRadialBody(ctx, 0, 0, r * 0.82, {
        light: '#f5b041',
        base: cfg.color,
        dark: cfg.stroke,
        stroke: cfg.stroke
      });
      break;
    }
    case 'titan': {
      const s = r * 0.85;
      const grad = ctx.createLinearGradient(-s, -s, s, s);
      grad.addColorStop(0, '#9b59b6');
      grad.addColorStop(1, cfg.color);
      ctx.fillStyle = grad;
      ctx.fillRect(-s, -s, s * 2, s * 2);
      ctx.strokeStyle = cfg.stroke;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-s, -s, s * 2, s * 2);
      break;
    }
    case 'spread': {
      drawPolygonBody(ctx, polygonPoints(8, r * 0.82), cfg.color, cfg.stroke);
      for (let i = 0; i < 8; i += 1) {
        ctx.save();
        ctx.rotate((Math.PI * 2 * i) / 8);
        ctx.fillStyle = cfg.barrel;
        ctx.fillRect(r * 0.55, -2, 8, 4);
        ctx.restore();
      }
      return;
    }
    case 'butter': {
      const br = r - 2;
      for (let i = 0; i < 8; i += 1) {
        const a0 = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(0, 0, br, a0, a0 + Math.PI / 4);
        ctx.strokeStyle = i % 2 === 0 ? '#ffe566' : '#f0b429';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, br - 2, 0, Math.PI * 2);
      ctx.fillStyle = '#f7d84e';
      ctx.fill();
      ctx.strokeStyle = cfg.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }
    default:
      drawRadialBody(ctx, 0, 0, r * 0.82, {
        light: cfg.color,
        base: cfg.color,
        dark: cfg.stroke,
        stroke: cfg.stroke
      });
  }

  ctx.rotate(Math.sin(performance.now() * 0.002) * 0.12);
  drawCannonBarrel(ctx, r * 0.75, 6, cfg.barrel || '#34495e', cfg.stroke);
}

export function drawCodexTowerPreview(ctx, width, height, typeId, time = 0) {
  ctx.clearRect(0, 0, width, height);
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(30, 45, 70, 0.08)');
  grad.addColorStop(1, 'rgba(30, 45, 70, 0.2)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2 + 4;
  const scale = Math.min(width, height) / 52;
  const bob = Math.sin(time * 2) * 3;

  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.scale(scale, scale);
  drawTowerShadow(ctx, 0, 0, 22);
  drawTowerBodyByType(ctx, typeId, 22);
  ctx.restore();
}

export function drawCodexEnemyPreview(ctx, width, height, typeId, time = 0) {
  ctx.clearRect(0, 0, width, height);
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, 'rgba(231, 76, 60, 0.06)');
  grad.addColorStop(1, 'rgba(142, 68, 173, 0.1)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const style = ENEMY_PREVIEW_STYLES[typeId] || ENEMY_PREVIEW_STYLES.normal;
  const cx = width / 2;
  const cy = height / 2;
  const bob = Math.sin(time * 2.5) * 4;
  let radius = 20;

  if (typeId === 'boss') radius = 32;
  else if (typeId === 'split_worm') radius = 22;
  else if (typeId === 'mini_split_worm' || typeId === 'squad') radius = 14;
  else if (typeId === 'armor') radius = 24;

  if (typeId === 'split_worm') {
    ctx.save();
    ctx.translate(cx, cy + bob);
    for (let i = 2; i >= 0; i -= 1) {
      const ox = -i * 14;
      const r = radius * (0.75 - i * 0.12);
      drawEnemyBlob(ctx, ox, 0, r, style);
    }
    drawEnemyEyes(ctx, -28, bob, style.eyes);
    ctx.restore();
    return;
  }

  if (typeId === 'squad') {
    const offsets = [
      { x: -12, y: 8 },
      { x: 12, y: 8 },
      { x: -12, y: -8 },
      { x: 12, y: -8 }
    ];
    for (let i = 0; i < offsets.length; i += 1) {
      const o = offsets[i];
      drawEnemyBlob(ctx, cx + o.x, cy + o.y + bob, 10, style);
      if (i === 0) drawEnemyEyes(ctx, cx + o.x, cy + o.y + bob, style.eyes);
    }
    return;
  }

  drawEnemyBlob(ctx, cx, cy + bob, radius, style);
  drawEnemyEyes(ctx, cx, cy + bob, style.eyes);

  if (typeId === 'boss') {
    ctx.strokeStyle = `rgba(231, 76, 60, ${0.35 + Math.sin(time * 4) * 0.15})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy + bob, radius + 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (typeId === 'stealth') {
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy + bob, radius + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
