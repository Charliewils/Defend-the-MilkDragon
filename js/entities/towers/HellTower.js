import { createTowerBullet } from '../Bullet.js';
import { MuzzleFlash } from '../MuzzleFlash.js';
import { audioManager } from '../../audio/index.js';
import { Tower } from './Tower.js';

export class HellTower extends Tower {
  constructor(col, row, battleModifiers = {}) {
    super(col, row, 'hell', battleModifiers);
    this.barrelAngles = [0, 0];
    this.lockedTargets = [null, null];
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

      if (target) {
        targets.push(target);
        used.push(target);
      }
    }

    return targets;
  }

  assignBarrelTargets(targets) {
    for (let i = 0; i < this.barrelAngles.length; i += 1) {
      const target = targets[i] ?? null;
      if (!target) {
        this.barrelAngles[i] = this.barrelAngles[0] ?? this.angle;
        continue;
      }
      const pos = target.position;
      this.barrelAngles[i] = Math.atan2(pos.y - this.y, pos.x - this.x);
    }
    this.angle = this.barrelAngles[0] ?? this.angle;
  }

  update(dt, enemies, bullets, muzzleFlashes, damageNumbers) {
    this.fireCooldown -= dt;
    const targets = this.findTargetsForShot(enemies);
    if (!targets.length) {
      this.lockedTargets = [null, null];
      return;
    }

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
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    ctx.lineTo(this.radius, 0);
    ctx.lineTo(0, this.radius);
    ctx.lineTo(-this.radius, 0);
    ctx.closePath();
    ctx.fillStyle = this.config.color;
    ctx.fill();
    ctx.strokeStyle = this.config.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let i = 0; i < this.barrelAngles.length; i += 1) {
      ctx.save();
      ctx.rotate(this.barrelAngles[i]);
      ctx.fillStyle = this.config.barrel;
      const offsetY = i === 0 ? -4 : 4;
      ctx.fillRect(6, offsetY - 2, 12, 4);
      ctx.restore();
    }

    ctx.restore();
  }
}
