import { audioManager } from '../../audio/index.js';
import { Tower } from './Tower.js';
import {
  drawTowerShadow,
  drawMoltenCracks,
  rgba
} from '../../render/vectorArt.js';

export class LavaTower extends Tower {
  constructor(col, row, battleModifiers = {}) {
    super(col, row, 'lava', battleModifiers);
    this._lavaPhase = Math.random() * Math.PI * 2;
  }

  getEffectDescription() {
    const tickDamage = Math.round(this.config.burnTickDamage * this.effectStrength);
    const duration = (this.config.burnDuration * this.effectStrength).toFixed(1);
    return `附加灼烧：每 ${this.config.burnTickInterval} 秒 ${tickDamage} 点，持续 ${duration} 秒。`;
  }

  onHit(enemy, damageNumbers, x, y) {
    audioManager.playSound('hit_burn');
    enemy.applyBurn(
      this.config.burnTickDamage * this.effectStrength,
      this.config.burnDuration * this.effectStrength,
      this.config.burnTickInterval
    );
  }

  update(dt, enemies, bullets, muzzleFlashes, damageNumbers) {
    this._lavaPhase = (this._lavaPhase + dt * 2.5) % (Math.PI * 2);
    super.update(dt, enemies, bullets, muzzleFlashes, damageNumbers);
  }

  drawTower(ctx) {
    const r = this.radius;
    ctx.save();
    ctx.translate(this.x, this.y);

    drawTowerShadow(ctx, 0, 0, r);

    // ── 岩浆橙色光晕 ──
    const glowAmp = 0.3 + 0.15 * Math.sin(this._lavaPhase * 1.8);
    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.7);
    glowGrad.addColorStop(0, `rgba(255, 140, 20, ${glowAmp})`);
    glowGrad.addColorStop(1, 'rgba(200, 60, 0, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.7, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    ctx.rotate(this.angle);

    // ── 粗糙火山岩外轮廓（凹凸不平圆形）──
    const jagginess = 6;
    ctx.beginPath();
    for (let i = 0; i <= 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const jag = 1 + 0.08 * Math.sin(a * jagginess + this._lavaPhase * 0.5) + 0.04 * Math.sin(a * 3 + this._lavaPhase);
      const rx = Math.cos(a) * r * jag;
      const ry = Math.sin(a) * r * jag;
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    const rockGrad = ctx.createRadialGradient(-r * 0.28, -r * 0.3, r * 0.06, 0, 0, r);
    rockGrad.addColorStop(0, '#f39c12');
    rockGrad.addColorStop(0.45, '#e67e22');
    rockGrad.addColorStop(0.75, '#a04000');
    rockGrad.addColorStop(1, '#3d1800');
    ctx.fillStyle = rockGrad;
    ctx.fill();
    ctx.strokeStyle = '#2d1000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ── 岩浆裂缝（动态） ──
    drawMoltenCracks(ctx, 0, 0, r * 0.72, this._lavaPhase, 1.0);

    // ── 熔融核心 ──
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.42);
    coreGrad.addColorStop(0, '#fff176');
    coreGrad.addColorStop(0.35, '#ffca28');
    coreGrad.addColorStop(0.7, '#ff6f00');
    coreGrad.addColorStop(1, '#4a1800');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // 核心高光（顶部气泡）
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, -r * 0.15, r * 0.14, r * 0.09, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,248,150,0.55)';
    ctx.fill();

    // ── 火焰炮管 ──
    const blen = r * 1.05;
    const bw = r * 0.38;
    const bx = r * 0.2;
    const by = -bw / 2;
    const bGrad = ctx.createLinearGradient(0, by, 0, by + bw);
    bGrad.addColorStop(0, '#f5b041');
    bGrad.addColorStop(0.5, '#e67e22');
    bGrad.addColorStop(1, '#6e2c00');
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, blen, bw, bw * 0.4);
    else ctx.rect(bx, by, blen, bw);
    ctx.fillStyle = bGrad;
    ctx.fill();
    ctx.strokeStyle = '#4a1800';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // 炮管纹路
    ctx.fillStyle = 'rgba(255,200,100,0.28)';
    ctx.fillRect(bx + 2, by + 2, blen * 0.5, bw * 0.3);

    // 炮口火焰
    const flamePulse = 0.55 + 0.35 * Math.sin(this._lavaPhase * 2.2);
    const flameGrad = ctx.createRadialGradient(bx + blen, 0, 0, bx + blen, 0, bw);
    flameGrad.addColorStop(0, `rgba(255,250,100,${flamePulse})`);
    flameGrad.addColorStop(0.4, `rgba(255,120,0,${flamePulse * 0.8})`);
    flameGrad.addColorStop(1, 'rgba(200,40,0,0)');
    ctx.beginPath();
    ctx.arc(bx + blen, 0, bw, 0, Math.PI * 2);
    ctx.fillStyle = flameGrad;
    ctx.fill();

    ctx.restore();
  }
}
