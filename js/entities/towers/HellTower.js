import { createTowerBullet } from '../Bullet.js';
import { MuzzleFlash } from '../MuzzleFlash.js';
import { audioManager } from '../../audio/index.js';
import { Tower } from './Tower.js';
import {
  drawTowerShadow,
  drawGlowRing,
  rgba
} from '../../render/vectorArt.js';

export class HellTower extends Tower {
  constructor(col, row, battleModifiers = {}) {
    super(col, row, 'hell', battleModifiers);
    this.barrelAngles = [0, 0];
    this.lockedTargets = [null, null];
    this._pulsePhase = Math.random() * Math.PI * 2;
  }

  getEffectDescription() {
    return `同时锁定最近 ${this.config.targetCount} 个目标并分别开火。`;
  }

  findTargetsForShot(enemies) {
    const count = this.config.targetCount;
    const targets = [];
    const used = [];
    for (let i = 0; i < count; i += 1) {
      let target = this.lockedTargets[i];
      if (!this.isTargetValid(target) || used.includes(target)) {
        target = this.findNearestTarget(enemies, used);
        this.lockedTargets[i] = target;
      }
      if (target) { targets.push(target); used.push(target); }
    }
    return targets;
  }

  assignBarrelTargets(targets) {
    for (let i = 0; i < this.barrelAngles.length; i += 1) {
      const target = targets[i] ?? null;
      if (!target) { this.barrelAngles[i] = this.barrelAngles[0] ?? this.angle; continue; }
      const pos = target.position;
      this.barrelAngles[i] = Math.atan2(pos.y - this.y, pos.x - this.x);
    }
    this.angle = this.barrelAngles[0] ?? this.angle;
  }

  update(dt, enemies, bullets, muzzleFlashes, damageNumbers) {
    this._pulsePhase = (this._pulsePhase + dt * 4) % (Math.PI * 2);
    this.fireCooldown -= dt;
    const targets = this.findTargetsForShot(enemies);
    if (!targets.length) { this.lockedTargets = [null, null]; return; }
    this.assignBarrelTargets(targets);
    if (this.fireCooldown > 0) return;
    this.shoot(targets, bullets, muzzleFlashes, damageNumbers);
    this.fireCooldown = this.fireInterval;
  }

  createBullet(target, damageNumbers, angle) {
    const muzzle = this.getMuzzlePoint(angle);
    return createTowerBullet(this.typeId, muzzle.x, muzzle.y, target, {
      damage: this.damage,
      bulletColor: this.config.bulletColor,
      tower: this,
      damageNumbers
    });
  }

  shoot(targets, bullets, muzzleFlashes, damageNumbers) {
    for (let i = 0; i < targets.length; i += 1) {
      const target = targets[i];
      const angle = this.barrelAngles[i] ?? this.angle;
      bullets.push(this.createBullet(target, damageNumbers, angle));
      const muzzle = this.getMuzzlePoint(angle);
      muzzleFlashes.push(MuzzleFlash.fromTower(this, muzzle.x, muzzle.y, angle));
    }
    audioManager.playSound('shoot_hell');
  }

  drawTower(ctx) {
    const r = this.radius;
    ctx.save();
    ctx.translate(this.x, this.y);

    drawTowerShadow(ctx, 0, 0, r);

    // ── 地狱红光晕 ──
    const pulse = 0.28 + 0.12 * Math.sin(this._pulsePhase);
    drawGlowRing(ctx, 0, 0, r, '#e74c3c', pulse, 10);

    // ── 菱形底座 ──
    const diamond = [
      { x: 0, y: -r * 1.08 },
      { x: r * 1.08, y: 0 },
      { x: 0, y: r * 1.08 },
      { x: -r * 1.08, y: 0 }
    ];
    ctx.beginPath();
    ctx.moveTo(diamond[0].x, diamond[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(diamond[i].x, diamond[i].y);
    ctx.closePath();
    const dGrad = ctx.createLinearGradient(0, -r, 0, r);
    dGrad.addColorStop(0, '#e74c3c');
    dGrad.addColorStop(0.5, '#c0392b');
    dGrad.addColorStop(1, '#1a0505');
    ctx.fillStyle = dGrad;
    ctx.fill();
    ctx.strokeStyle = '#4a0000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ── 菱形内骨架线条 ──
    ctx.strokeStyle = 'rgba(255,80,80,0.2)';
    ctx.lineWidth = 1;
    for (const offset of [r * 0.38, -r * 0.38]) {
      ctx.beginPath();
      ctx.moveTo(offset, -r * 0.8);
      ctx.lineTo(offset, r * 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, offset);
      ctx.lineTo(r * 0.8, offset);
      ctx.stroke();
    }

    // ── 中心骷髅眼睛装饰 ──
    const eyeR = r * 0.14;
    for (const ex of [-r * 0.2, r * 0.2]) {
      const eg = ctx.createRadialGradient(ex, -r * 0.1, 0, ex, -r * 0.1, eyeR * 1.5);
      eg.addColorStop(0, '#ff8888');
      eg.addColorStop(0.4, '#cc0000');
      eg.addColorStop(1, '#1a0000');
      ctx.beginPath();
      ctx.arc(ex, -r * 0.1, eyeR, 0, Math.PI * 2);
      ctx.fillStyle = eg;
      ctx.fill();
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // ── 中央发光核心 ──
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.32);
    coreGrad.addColorStop(0, '#ffcccc');
    coreGrad.addColorStop(0.45, '#e74c3c');
    coreGrad.addColorStop(1, '#7b0000');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // ── 双炮管 ──
    for (let i = 0; i < this.barrelAngles.length; i += 1) {
      ctx.save();
      ctx.rotate(this.barrelAngles[i]);
      const offsetY = i === 0 ? -r * 0.24 : r * 0.24;
      ctx.translate(0, offsetY);

      const blen = r * 0.95;
      const bw = r * 0.26;
      const bx = r * 0.14;
      const by = -bw / 2;
      const bGrad = ctx.createLinearGradient(0, by, 0, by + bw);
      bGrad.addColorStop(0, '#e74c3c');
      bGrad.addColorStop(0.5, '#922b21');
      bGrad.addColorStop(1, '#1a0000');
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, blen, bw, bw * 0.45);
      else ctx.rect(bx, by, blen, bw);
      ctx.fillStyle = bGrad;
      ctx.fill();
      ctx.strokeStyle = '#4a0000';
      ctx.lineWidth = 1;
      ctx.stroke();
      // 炮口火焰环
      const pulse2 = 0.5 + 0.3 * Math.sin(this._pulsePhase + i * Math.PI);
      ctx.beginPath();
      ctx.arc(bx + blen, 0, bw * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 100, 20, ${pulse2 * 0.7})`;
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }
}
