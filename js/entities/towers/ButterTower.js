import { createTowerBullet } from '../Bullet.js';
import { MuzzleFlash } from '../MuzzleFlash.js';
import { playTowerShootSound } from '../../audio/combatSounds.js';
import { Tower } from './Tower.js';

export class ButterTower extends Tower {
  constructor(col, row, battleModifiers = {}) {
    super(col, row, 'butter', battleModifiers);
    this.muzzleDripRemaining = 0;
  }

  get damage() {
    const mult = 1 + 0.15 * (this.level - 1);
    return Math.round(this.config.damage * mult);
  }

  getRootChance() {
    return [0.35, 0.45, 0.55][this.level - 1] ?? 0.35;
  }

  getRootDuration() {
    return [1.5, 1.8, 2.2][this.level - 1] ?? 1.5;
  }

  getEffectDescription() {
    if (this.level >= 3) {
      return '55%概率定身2.2秒，伤害+30%，命中附带40px范围30%减速2秒。';
    }
    if (this.level >= 2) return '45%概率定身1.8秒，伤害+15%。';
    return '35%概率定身1.5秒。';
  }

  update(dt, enemies, bullets, muzzleFlashes, damageNumbers) {
    if (this.muzzleDripRemaining > 0) {
      this.muzzleDripRemaining = Math.max(0, this.muzzleDripRemaining - dt);
    }
    super.update(dt, enemies, bullets, muzzleFlashes, damageNumbers);
  }

  shoot(targets, bullets, muzzleFlashes, damageNumbers) {
    this.muzzleDripRemaining = 0.2;
    for (const target of targets) {
      bullets.push(this.createBullet(target, damageNumbers));
    }
    for (const target of targets) {
      const aim = Math.atan2(target.position.y - this.y, target.position.x - this.x);
      const mx = this.x + Math.cos(aim) * (this.radius + 8);
      const my = this.y + Math.sin(aim) * (this.radius + 8);
      muzzleFlashes.push(MuzzleFlash.fromTower(this, mx, my, aim));
    }
    playTowerShootSound(this.typeId);
  }

  createBullet(target, damageNumbers) {
    const muzzle = this.getMuzzlePoint();
    return createTowerBullet('butter', muzzle.x, muzzle.y, target, {
      damage: this.damage,
      bulletSpeed: this.config.bulletSpeed,
      bulletColor: this.config.bulletColor,
      tower: this,
      damageNumbers
    });
  }

  drawTower(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const r = this.radius - 1;
    for (let i = 0; i < 8; i += 1) {
      const a0 = (i / 8) * Math.PI * 2;
      const a1 = a0 + Math.PI / 4;
      ctx.beginPath();
      ctx.arc(0, 0, r, a0, a1);
      ctx.strokeStyle = i % 2 === 0 ? '#FFE566' : '#F0B429';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, r - 1, 0, Math.PI * 2);
    ctx.fillStyle = '#f7d84e';
    ctx.fill();
    ctx.strokeStyle = '#d4a017';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f5e6b3';
    ctx.fillRect(5, -5, 11, 10);
    ctx.fillStyle = '#edd59a';
    ctx.beginPath();
    ctx.moveTo(16, -6);
    ctx.lineTo(22, -4);
    ctx.lineTo(22, 4);
    ctx.lineTo(16, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(180, 140, 60, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(5, -5, 11, 10);

    if (this.muzzleDripRemaining > 0) {
      const p = 1 - this.muzzleDripRemaining / 0.2;
      const fy = 4 + p * 16;
      ctx.fillStyle = `rgba(255, 220, 90, ${0.92 * (1 - p * 0.35)})`;
      ctx.beginPath();
      ctx.ellipse(19, fy, 3.2 * (1 - p * 0.25), 3.5 + p * 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
