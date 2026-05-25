import { Tower } from './Tower.js';
import {
  drawTowerShadow,
  drawCrystalSpikes,
  drawSnowflake,
  rgba
} from '../../render/vectorArt.js';

export class IceTower extends Tower {
  constructor(col, row, battleModifiers = {}) {
    super(col, row, 'ice', battleModifiers);
    this._crystalPhase = Math.random() * Math.PI * 2;
  }

  get damage() {
    const bonus = this.battleModifiers.freezeDamageBonus || 0;
    return Math.round(super.damage * (1 + bonus));
  }

  getSlowMultiplier() {
    const reduction = this.config.slowReduction * this.effectStrength;
    return Math.max(0.1, 1 - reduction);
  }

  getSlowDuration() {
    const bonus = this.battleModifiers.freezeDamageBonus || 0;
    return this.config.slowDuration * this.effectStrength * (1 + bonus);
  }

  getEffectDescription() {
    return `命中减速 ${Math.round((1 - this.getSlowMultiplier()) * 100)}%，持续 ${this.getSlowDuration().toFixed(1)} 秒并可刷新。`;
  }

  onHit(enemy, damageNumbers, x, y) {
    if (enemy.isInvisible) return;
    let multiplier = this.getSlowMultiplier();
    if (enemy.typeId === 'boss') {
      const reduction = this.config.slowReduction * this.effectStrength * 0.5;
      multiplier = Math.max(0.1, 1 - reduction);
    }
    enemy.applySlow(multiplier, this.getSlowDuration());
    if (enemy.typeId === 'rush') {
      enemy.rushActive = false;
      enemy.baseSpeed = enemy.normalBaseSpeed * enemy.slowMultiplier;
    }
  }

  drawTower(ctx) {
    const r = this.radius;
    ctx.save();
    ctx.translate(this.x, this.y);

    drawTowerShadow(ctx, 0, 0, r);

    // ── 冰晶外环发光 ──
    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.55);
    glowGrad.addColorStop(0, 'rgba(100,210,255,0.22)');
    glowGrad.addColorStop(1, 'rgba(52,152,219,0)');
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.55, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // ── 冰晶尖刺（六颗，在底座外围）──
    ctx.rotate(this.angle);
    drawCrystalSpikes(ctx, 0, 0, r * 1.05, 6, '#aed6f1', '#2471a3');

    // ── 六边形冰晶底座 ──
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const hx = Math.cos(a) * r;
      const hy = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    const baseGrad = ctx.createLinearGradient(0, -r, 0, r);
    baseGrad.addColorStop(0, '#d6eaf8');
    baseGrad.addColorStop(0.5, '#3498db');
    baseGrad.addColorStop(1, '#1a5276');
    ctx.fillStyle = baseGrad;
    ctx.fill();
    ctx.strokeStyle = '#1a5276';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ── 内部雪花纹路 ──
    drawSnowflake(ctx, 0, 0, r * 0.55, '#ffffff', 0.55);

    // ── 中心冰晶球 ──
    const orbGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.22, r * 0.05, 0, 0, r * 0.5);
    orbGrad.addColorStop(0, '#e8f4fd');
    orbGrad.addColorStop(0.4, '#aed6f1');
    orbGrad.addColorStop(1, '#2471a3');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = orbGrad;
    ctx.fill();
    ctx.strokeStyle = '#2471a3';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 高光
    ctx.beginPath();
    ctx.ellipse(-r * 0.18, -r * 0.2, r * 0.16, r * 0.1, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();

    // ── 冰炮管 ──
    const blen = r * 1.05;
    const bw = r * 0.36;
    const bx = r * 0.18;
    const by = -bw / 2;
    const bGrad = ctx.createLinearGradient(0, by, 0, by + bw);
    bGrad.addColorStop(0, '#aed6f1');
    bGrad.addColorStop(0.5, '#5dade2');
    bGrad.addColorStop(1, '#1a5276');
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, blen, bw, bw * 0.42);
    else ctx.rect(bx, by, blen, bw);
    ctx.fillStyle = bGrad;
    ctx.fill();
    ctx.strokeStyle = '#1a5276';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // 炮管冰晶高光
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(bx + 2, by + 2, blen * 0.5, bw * 0.28);
    // 炮口冰晶环
    ctx.beginPath();
    ctx.arc(bx + blen, 0, bw * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = '#85c1e9';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(174,214,241,0.55)';
    ctx.fill();

    ctx.restore();
  }
}
