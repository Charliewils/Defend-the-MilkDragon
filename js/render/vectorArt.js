/** 共享 Canvas 矢量绘制工具（炮台 / 怪物 / UI 预览） */

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function drawRadialBody(ctx, x, y, r, { light, base, dark, stroke, lineWidth = 2 }) {
  const grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.15, x, y * 0.1, r);
  grad.addColorStop(0, light || base);
  grad.addColorStop(0.5, base);
  grad.addColorStop(1, dark || base);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

export function drawGroundShadow(ctx, x, y, r, alpha = 0.22) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.85, r * 1.1, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fill();
  ctx.restore();
}

export function drawTowerShadow(ctx, x, y, r) {
  drawGroundShadow(ctx, x, y + 4, r * 0.95, 0.28);
}

export function drawPolygonBody(ctx, points, fill, stroke, lineWidth = 2) {
  if (!points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

export function polygonPoints(sides, r, rotation = -Math.PI / 2) {
  return Array.from({ length: sides }, (_, i) => {
    const a = rotation + (i / sides) * Math.PI * 2;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  });
}

export function drawTowerPlatform(ctx, r, color, stroke) {
  const pts = polygonPoints(8, r * 1.05, Math.PI / 8);
  const grad = ctx.createLinearGradient(0, -r, 0, r);
  grad.addColorStop(0, rgba(color, 0.95));
  grad.addColorStop(1, rgba(stroke || color, 0.85));
  drawPolygonBody(ctx, pts, grad, stroke || color, 2.5);
  ctx.beginPath();
  ctx.ellipse(0, r * 0.55, r * 0.75, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fill();
}

export function drawCannonBarrel(ctx, length, width, color, stroke) {
  const r = width / 2;
  const bx = 4;
  const by = -r;
  const grad = ctx.createLinearGradient(0, by, 0, by + width);
  grad.addColorStop(0, rgba(color, 1));
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, rgba(stroke || color, 0.9));
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(bx, by, length, width, r);
  } else {
    ctx.rect(bx, by, length, width);
  }
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = stroke || 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(bx + 2, by + 1, length * 0.55, r * 0.35);
}

export function drawEnemyBlob(ctx, x, y, r, { base, light, dark, stroke, slowed, tint }) {
  const cool = slowed ? { base: '#5dade2', light: '#aed6f1', dark: '#2471a3', stroke: '#1a5276' } : null;
  const c = cool || { base, light: light || base, dark: dark || base, stroke };
  if (tint && !slowed) {
    c.base = tint;
  }
  drawGroundShadow(ctx, x, y, r, 0.2);
  drawRadialBody(ctx, x, y, r, c);
  ctx.beginPath();
  ctx.arc(x - r * 0.28, y - r * 0.32, r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fill();
}

export function drawEnemyEyes(ctx, x, y, { angry = false, wide = false } = {}) {
  const eyeR = wide ? 2.8 : 2.2;
  const gap = wide ? 5.5 : 4;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - gap, y - 2, eyeR, 0, Math.PI * 2);
  ctx.arc(x + gap, y - 2, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a252f';
  ctx.beginPath();
  ctx.arc(x - gap, y - 2, eyeR * 0.55, 0, Math.PI * 2);
  ctx.arc(x + gap, y - 2, eyeR * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 1.5;
  if (angry) {
    ctx.beginPath();
    ctx.moveTo(x - gap - 4, y - 6);
    ctx.lineTo(x - gap + 2, y - 3);
    ctx.moveTo(x + gap + 4, y - 6);
    ctx.lineTo(x + gap - 2, y - 3);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(x, y + 4, 4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
}

export function drawStyledHealthBar(ctx, x, y, radius, ratio, { isBoss = false, hpText = '' } = {}) {
  const barW = radius * (isBoss ? 2.4 : 2);
  const barH = isBoss ? 6 : 4;
  const barX = x - barW / 2;
  const barY = y - radius - (isBoss ? 12 : 9);
  const r = barH / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, r + 1);
  else ctx.rect(barX - 1, barY - 1, barW + 2, barH + 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(30,30,40,0.85)';
  if (ctx.roundRect) ctx.roundRect(barX, barY, barW, barH, r);
  else ctx.rect(barX, barY, barW, barH);
  ctx.fill();

  const fillGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
  if (ratio > 0.6) {
    fillGrad.addColorStop(0, '#66bb6a');
    fillGrad.addColorStop(1, '#2e7d32');
  } else if (ratio > 0.3) {
    fillGrad.addColorStop(0, '#fff176');
    fillGrad.addColorStop(1, '#f9a825');
  } else {
    fillGrad.addColorStop(0, '#ef5350');
    fillGrad.addColorStop(1, '#c62828');
  }
  const fw = Math.max(0, barW * ratio);
  if (fw > 0) {
    ctx.fillStyle = fillGrad;
    if (ctx.roundRect) ctx.roundRect(barX, barY, fw, barH, r);
    else ctx.rect(barX, barY, fw, barH);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(barX, barY, fw, barH * 0.45);
  }

  if (isBoss && hpText) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(hpText, x, barY - 2);
  }
  ctx.restore();
}

export function drawMenuRadish(ctx, x, y, scale, t) {
  const bob = Math.sin(t * 2) * 4;
  const sy = y + bob;
  ctx.save();
  ctx.translate(x, sy);
  ctx.scale(scale, scale);

  drawGroundShadow(ctx, 0, 18, 28, 0.18);

  const bodyGrad = ctx.createLinearGradient(0, -8, 0, 22);
  bodyGrad.addColorStop(0, '#ff9a6c');
  bodyGrad.addColorStop(1, '#e74c3c');
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(20, 14);
  ctx.quadraticCurveTo(0, 26, -20, 14);
  ctx.closePath();
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 2;
  ctx.stroke();

  for (const leaf of [
    { lx: -9, ly: -16, rot: -0.65, w: 9, h: 16 },
    { lx: 0, ly: -20, rot: -1.57, w: 8, h: 18 },
    { lx: 9, ly: -16, rot: -2.45, w: 9, h: 16 }
  ]) {
    ctx.save();
    ctx.translate(leaf.lx, leaf.ly);
    ctx.rotate(leaf.rot + Math.sin(t * 1.5) * 0.08);
    ctx.beginPath();
    ctx.ellipse(0, 0, leaf.w / 2, leaf.h / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#27ae60';
    ctx.fill();
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = '#2c3e50';
  ctx.beginPath();
  ctx.arc(-5, 4, 2.2, 0, Math.PI * 2);
  ctx.arc(5, 4, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 10, 5, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  ctx.restore();
}

export function drawMenuTowerIcon(ctx, x, y, type, t) {
  const pulse = 1 + Math.sin(t * 3) * 0.04;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  drawTowerShadow(ctx, 0, 0, 14);
  const configs = {
    normal: { color: '#95a5a6', stroke: '#7f8c8d', shape: 'circle' },
    ice: { color: '#3498db', stroke: '#2471a3', shape: 'hex' },
    hell: { color: '#c0392b', stroke: '#922b21', shape: 'diamond' },
    spread: { color: '#1e5631', stroke: '#145a32', shape: 'octagon' }
  };
  const c = configs[type] || configs.normal;
  drawTowerPlatform(ctx, 14, c.color, c.stroke);
  if (c.shape === 'hex') {
    drawPolygonBody(ctx, polygonPoints(6, 10), c.color, c.stroke);
  } else if (c.shape === 'diamond') {
    drawPolygonBody(
      ctx,
      [
        { x: 0, y: -10 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
        { x: -10, y: 0 }
      ],
      c.color,
      c.stroke
    );
  } else if (c.shape === 'octagon') {
    drawPolygonBody(ctx, polygonPoints(8, 10), c.color, c.stroke);
  } else {
    drawRadialBody(ctx, 0, 0, 10, {
      light: '#bdc3c7',
      base: c.color,
      dark: c.stroke,
      stroke: c.stroke
    });
  }
  ctx.rotate(Math.sin(t * 2) * 0.15);
  drawCannonBarrel(ctx, 12, 5, '#34495e', '#2c3e50');
  ctx.restore();
}

export function drawMenuEnemyIcon(ctx, x, y, type, t, offset = 0) {
  const px = x + offset;
  const py = y + Math.sin(t * 4 + offset) * 2;
  const styles = {
    normal: { base: '#e74c3c', light: '#ff8a7a', dark: '#c0392b', stroke: '#922b21' },
    rush: { base: '#f39c12', light: '#ffd180', dark: '#e67e22', stroke: '#d35400' },
    stealth: { base: '#8e44ad', light: '#bb8fce', dark: '#6c3483', stroke: '#4a235a' }
  };
  const s = styles[type] || styles.normal;
  drawEnemyBlob(ctx, px, py, 11, s);
  drawEnemyEyes(ctx, px, py, { angry: type === 'rush', wide: type === 'stealth' });
}

/* ─── 高级共享工具函数 ─── */

export function drawGlowRing(ctx, x, y, r, color, alpha = 0.45, thickness = 6) {
  const grd = ctx.createRadialGradient(x, y, r - thickness, x, y, r + thickness);
  grd.addColorStop(0, rgba(color, 0));
  grd.addColorStop(0.4, rgba(color, alpha));
  grd.addColorStop(1, rgba(color, 0));
  ctx.beginPath();
  ctx.arc(x, y, r + thickness, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();
}

export function drawHorns(ctx, x, y, r, color, strokeColor) {
  const sc = strokeColor || rgba(color, 0.55);
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = sc;
  ctx.lineWidth = 1.2;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * r * 0.28, y - r * 0.75);
    ctx.bezierCurveTo(
      x + side * r * 0.55, y - r * 1.05,
      x + side * r * 0.65, y - r * 1.45,
      x + side * r * 0.42, y - r * 1.52
    );
    ctx.bezierCurveTo(
      x + side * r * 0.22, y - r * 1.38,
      x + side * r * 0.08, y - r * 1.1,
      x + side * r * 0.15, y - r * 0.8
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

export function drawCrown(ctx, x, y, r, color, strokeColor) {
  const sc = strokeColor || rgba(color, 0.65);
  const baseY = y - r + 2;
  const crownW = r * 1.1;
  const crownH = r * 0.62;
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = sc;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - crownW, baseY);
  ctx.lineTo(x - crownW, baseY - crownH * 0.45);
  ctx.lineTo(x - crownW * 0.55, baseY - crownH * 0.45);
  ctx.lineTo(x - crownW * 0.38, baseY - crownH);
  ctx.lineTo(x - crownW * 0.05, baseY - crownH * 0.45);
  ctx.lineTo(x, baseY - crownH * 1.1);
  ctx.lineTo(x + crownW * 0.05, baseY - crownH * 0.45);
  ctx.lineTo(x + crownW * 0.38, baseY - crownH);
  ctx.lineTo(x + crownW * 0.55, baseY - crownH * 0.45);
  ctx.lineTo(x + crownW, baseY - crownH * 0.45);
  ctx.lineTo(x + crownW, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawWings(ctx, x, y, r, color, alpha = 0.52) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  for (const side of [-1, 1]) {
    const wx = x + side * r * 0.85;
    ctx.beginPath();
    ctx.moveTo(wx, y);
    ctx.bezierCurveTo(
      wx + side * r * 0.7, y - r * 0.9,
      wx + side * r * 1.6, y - r * 0.6,
      wx + side * r * 1.8, y + r * 0.1
    );
    ctx.bezierCurveTo(
      wx + side * r * 1.6, y + r * 0.55,
      wx + side * r * 1.1, y + r * 0.7,
      wx, y + r * 0.3
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = rgba(color, 0.6);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx, y);
    ctx.lineTo(wx + side * r * 1.5, y - r * 0.4);
    ctx.moveTo(wx + side * r * 0.6, y - r * 0.5);
    ctx.lineTo(wx + side * r * 1.4, y + r * 0.2);
    ctx.strokeStyle = rgba(color, 0.35);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawCrystalSpikes(ctx, cx, cy, r, count, color, strokeColor) {
  const sc = strokeColor || rgba(color, 0.7);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    const h = r * 0.52;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.lineTo(h * 0.28, h * 0.18);
    ctx.lineTo(-h * 0.28, h * 0.18);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, -h, 0, h * 0.18);
    g.addColorStop(0, color);
    g.addColorStop(1, rgba(color, 0.4));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = sc;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

export function drawSnowflake(ctx, x, y, r, color, alpha = 0.55) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
    const mx = x + Math.cos(ang) * r * 0.55;
    const my = y + Math.sin(ang) * r * 0.55;
    const perp = ang + Math.PI / 2;
    ctx.moveTo(mx + Math.cos(perp) * r * 0.25, my + Math.sin(perp) * r * 0.25);
    ctx.lineTo(mx - Math.cos(perp) * r * 0.25, my - Math.sin(perp) * r * 0.25);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawMoltenCracks(ctx, x, y, r, t = 0, intensity = 1) {
  const count = 6;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2 + t * 0.5;
    const len = r * (0.35 + 0.25 * Math.sin(t + i * 1.3));
    const glow = 0.55 + 0.45 * Math.sin(t * 2 + i);
    ctx.strokeStyle = `rgba(255, ${Math.floor(120 + 80 * Math.sin(t + i))}, 20, ${glow * intensity})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawRuneRing(ctx, x, y, r, count, color, phase = 0) {
  ctx.save();
  ctx.strokeStyle = rgba(color, 0.7);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2 + phase;
    const rx = x + Math.cos(ang) * r;
    const ry = y + Math.sin(ang) * r;
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(ang + Math.PI / 2);
    ctx.strokeStyle = rgba(color, 0.85);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(-2.5, -2.5, 5, 5);
    ctx.stroke();
    ctx.fillStyle = rgba(color, 0.3);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

export function drawGearBody(ctx, cx, cy, outerR, innerR, teeth, color, stroke, phase = 0) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const ang = (i / (teeth * 2)) * Math.PI * 2 + phase;
    const r = i % 2 === 0 ? outerR : innerR;
    if (i === 0) ctx.moveTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    else ctx.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

export function drawShieldPlate(ctx, x, y, r, color, stroke) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r * 0.75, y - r * 0.4);
  ctx.lineTo(x + r * 0.75, y + r * 0.4);
  ctx.quadraticCurveTo(x, y + r * 1.15, x - r * 0.75, y + r * 0.4);
  ctx.lineTo(x - r * 0.75, y - r * 0.4);
  ctx.closePath();
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  g.addColorStop(0, color);
  g.addColorStop(1, rgba(stroke || color, 0.8));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = stroke || rgba(color, 0.6);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}
