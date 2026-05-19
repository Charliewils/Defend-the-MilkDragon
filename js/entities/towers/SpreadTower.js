import { createTowerBullet } from '../Bullet.js';
import { MuzzleFlash } from '../MuzzleFlash.js';
import { audioManager } from '../../audio/index.js';
import { Tower } from './Tower.js';

const DIRECTIONS = 8;
const BARREL_ANGLES = Array.from({ length: DIRECTIONS }, (_, index) => (index * Math.PI) / 4);

export class SpreadTower extends Tower {
  constructor(col, row, battleModifiers = {}) {
    super(col, row, 'spread', battleModifiers);
    this.barrelAngles = [...BARREL_ANGLES];
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
    this.fireCooldown -= dt;
    if (this.fireCooldown > 0) return;

    this.shoot(bullets, muzzleFlashes, damageNumbers);
    this.fireCooldown = this.fireInterval;
  }

  drawTower(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.beginPath();
    for (let i = 0; i < DIRECTIONS; i += 1) {
      const angle = (Math.PI * 2 * i) / DIRECTIONS - Math.PI / 2;
      const px = Math.cos(angle) * this.radius;
      const py = Math.sin(angle) * this.radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = this.config.color;
    ctx.fill();
    ctx.strokeStyle = this.config.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    for (const angle of this.barrelAngles) {
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = this.config.barrel;
      ctx.fillRect(this.radius - 2, -2, 10, 4);
      ctx.restore();
    }

    ctx.restore();
  }
}
