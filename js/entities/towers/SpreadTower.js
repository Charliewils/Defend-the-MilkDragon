import { createTowerBullet } from '../Bullet.js';
import { MuzzleFlash } from '../MuzzleFlash.js';
import { audioManager } from '../../audio/index.js';
import { Tower } from './Tower.js';
import {
  drawTowerShadow,
  drawGearBody,
  rgba
} from '../../render/vectorArt.js';

const DIRECTIONS = 8;
const BARREL_ANGLES = Array.from({ length: DIRECTIONS }, (_, i) => (i * Math.PI) / 4);

export class SpreadTower extends Tower {
  constructor(col, row, battleModifiers = {}) {
    super(col, row, 'spread', battleModifiers);
    this.barrelAngles = [...BARREL_ANGLES];
    this._gearPhase = 0;
  }

  get bulletSpeed() {
    return this.config.bulletSpeed * (1 + 0.1 * (this.level - 1));
  }

  get pierceCount() {
    return this.level >= 3 ? 1 : 0;
  }

  getEffectDescription() {
    if (this.level >= 3) return '伤害+40%，穿透1个目标';
    if (this.level >= 2) return '伤害+20%，子弹更快';
    return '向8方向散射，以自身为中心3×3格内造成伤害';
  }

  getMuzzlePoint(angle) {
    return {
      x: this.x + Math.cos(angle) * (this.radius + 8),
      y: this.y + Math.sin(angle) * (this.radius + 8)
    };
  }

  shoot(bullets, muzzleFlashes, damageNumbers) {
    for (const angle of this.barrelAngles) {
      const muzzle = this.getMuzzlePoint(angle);
      bullets.push(
        createTowerBullet(this.typeId, muzzle.x, muzzle.y, null, {
          angle,
          damage: this.damage,
          bulletSpeed: this.bulletSpeed,
          pierce: this.pierceCount,
          bulletColor: this.config.bulletColor,
          tower: this,
          damageNumbers
        })
      );
      muzzleFlashes.push(MuzzleFlash.fromTower(this, muzzle.x, muzzle.y, angle));
    }
    audioManager.playSound('shoot_spread');
  }

  update(dt, enemies, bullets, muzzleFlashes, damageNumbers) {
    this._gearPhase = (this._gearPhase + dt * 1.2) % (Math.PI * 2);
    this.fireCooldown -= dt;
    if (this.fireCooldown > 0) return;
    this.shoot(bullets, muzzleFlashes, damageNumbers);
    this.fireCooldown = this.fireInterval;
  }

  drawTower(ctx) {
    const r = this.radius;
    ctx.save();
    ctx.translate(this.x, this.y);

    drawTowerShadow(ctx, 0, 0, r);

    // ── 绿色能量光晕 ──
    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.5);
    glowGrad.addColorStop(0, 'rgba(46,204,113,0.22)');
    glowGrad.addColorStop(1, 'rgba(30,86,49,0)');
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // ── 外齿轮（旋转） ──
    const outerGrad = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 1.08);
    outerGrad.addColorStop(0, '#27ae60');
    outerGrad.addColorStop(1, '#145a32');
    drawGearBody(ctx, 0, 0, r * 1.08, r * 0.85, 10, outerGrad, '#0e4024', this._gearPhase);

    // ── 内齿轮（反向旋转） ──
    const innerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.65);
    innerGrad.addColorStop(0, '#2ecc71');
    innerGrad.addColorStop(1, '#1e5631');
    drawGearBody(ctx, 0, 0, r * 0.65, r * 0.52, 8, innerGrad, '#145a32', -this._gearPhase * 1.25);

    // ── 中央能量核心 ──
    const coreGrad = ctx.createRadialGradient(-r * 0.1, -r * 0.12, 0, 0, 0, r * 0.32);
    coreGrad.addColorStop(0, '#a9dfbf');
    coreGrad.addColorStop(0.5, '#27ae60');
    coreGrad.addColorStop(1, '#0e4024');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 高光
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, -r * 0.12, r * 0.12, r * 0.08, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fill();

    // ── 8 根迷你炮管（围绕中心） ──
    for (const angle of this.barrelAngles) {
      ctx.save();
      ctx.rotate(angle);
      const bstart = r * 0.6;
      const blen = r * 0.55;
      const bw = r * 0.2;
      const bGrad = ctx.createLinearGradient(0, -bw / 2, 0, bw / 2);
      bGrad.addColorStop(0, '#a9dfbf');
      bGrad.addColorStop(1, '#1e5631');
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bstart, -bw / 2, blen, bw, bw * 0.4);
      else ctx.rect(bstart, -bw / 2, blen, bw);
      ctx.fillStyle = bGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      // 炮口端点
      ctx.beginPath();
      ctx.arc(bstart + blen, 0, bw * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(46,204,113,0.55)';
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }
}
