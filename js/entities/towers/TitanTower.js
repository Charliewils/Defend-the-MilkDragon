import { Tower } from './Tower.js';
import {
  drawTowerShadow,
  drawRuneRing,
  rgba
} from '../../render/vectorArt.js';

export class TitanTower extends Tower {
  constructor(col, row, battleModifiers = {}) {
    super(col, row, 'titan', battleModifiers);
    this._runePhase = 0;
  }

  getEffectDescription() {
    return `额外造成目标当前血量 ${Math.round(this.config.hpPercent * this.effectStrength * 100)}% 的伤害。`;
  }

  onHit(enemy, damageNumbers, x, y) {
    const bonusDamage = enemy.hp * this.config.hpPercent * this.effectStrength;
    if (bonusDamage <= 0) return;
    const pos = enemy.position;
    enemy.takeDamage(damageNumbers, bonusDamage, {
      x: pos.x,
      y: pos.y - enemy.radius - 6,
      variant: 'titan',
      isBonus: true
    });
  }

  update(dt, enemies, bullets, muzzleFlashes, damageNumbers) {
    this._runePhase = (this._runePhase || 0) + dt * 0.8;
    super.update(dt, enemies, bullets, muzzleFlashes, damageNumbers);
  }

  drawTower(ctx) {
    const r = this.radius;
    ctx.save();
    ctx.translate(this.x, this.y);

    drawTowerShadow(ctx, 0, 0, r);

    // ── 紫色秘术光晕 ──
    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 1.6);
    glowGrad.addColorStop(0, 'rgba(155,89,182,0.28)');
    glowGrad.addColorStop(1, 'rgba(74,35,90,0)');
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    ctx.rotate(this.angle);

    // ── 八角形底座 ──
    const baseR = r * 1.05;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      if (i === 0) ctx.moveTo(Math.cos(a) * baseR, Math.sin(a) * baseR);
      else ctx.lineTo(Math.cos(a) * baseR, Math.sin(a) * baseR);
    }
    ctx.closePath();
    const baseGrad = ctx.createLinearGradient(0, -baseR, 0, baseR);
    baseGrad.addColorStop(0, '#a569bd');
    baseGrad.addColorStop(0.5, '#6c3483');
    baseGrad.addColorStop(1, '#2e1a47');
    ctx.fillStyle = baseGrad;
    ctx.fill();
    ctx.strokeStyle = '#1a0a2e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ── 旋转符文环 ──
    const runePhase = this._runePhase || 0;
    drawRuneRing(ctx, 0, 0, r * 0.82, 8, '#d2b4de', runePhase);

    // ── 正方形魔法核心 ──
    const s = r * 0.62;
    const coreGrad = ctx.createLinearGradient(-s, -s, s, s);
    coreGrad.addColorStop(0, '#d2b4de');
    coreGrad.addColorStop(0.4, '#9b59b6');
    coreGrad.addColorStop(1, '#4a235a');
    ctx.save();
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.rect(-s * 0.72, -s * 0.72, s * 1.44, s * 1.44);
    ctx.fillStyle = coreGrad;
    ctx.fill();
    ctx.strokeStyle = '#7d3c98';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    // ── 中央魔法宝珠 ──
    const orbGrad = ctx.createRadialGradient(-r * 0.15, -r * 0.18, r * 0.04, 0, 0, r * 0.38);
    orbGrad.addColorStop(0, '#f0e6ff');
    orbGrad.addColorStop(0.4, '#bb8fce');
    orbGrad.addColorStop(1, '#6c3483');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = orbGrad;
    ctx.fill();
    ctx.strokeStyle = '#9b59b6';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 宝珠高光
    ctx.beginPath();
    ctx.ellipse(-r * 0.12, -r * 0.14, r * 0.14, r * 0.09, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();

    // ── 重型炮管 ──
    const blen = r * 1.1;
    const bw = r * 0.46;
    const bx = r * 0.2;
    const by = -bw / 2;
    const bGrad = ctx.createLinearGradient(0, by, 0, by + bw);
    bGrad.addColorStop(0, '#c39bd3');
    bGrad.addColorStop(0.4, '#7d3c98');
    bGrad.addColorStop(1, '#2e1a47');
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, blen, bw, bw * 0.3);
    else ctx.rect(bx, by, blen, bw);
    ctx.fillStyle = bGrad;
    ctx.fill();
    ctx.strokeStyle = '#1a0a2e';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(bx + 2, by + 2, blen * 0.5, bw * 0.28);
    // 炮口宝珠
    ctx.beginPath();
    ctx.arc(bx + blen, 0, bw * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = rgba('#d2b4de', 0.7);
    ctx.fill();
    ctx.strokeStyle = '#9b59b6';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }
}
