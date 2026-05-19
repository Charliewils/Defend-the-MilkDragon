import {
  CANVAS_H,
  CANVAS_W,
  CELL
} from '../config/constants.js';
import {
  spawnBasicRipples,
  spawnFreezeRipples,
  spawnLavaRipples,
  spawnTitanRipples
} from '../systems/rippleEffects.js';
import { playButterRootSound, playBulletHitSound } from '../audio/combatSounds.js';
import { spawnButterSplatter } from '../systems/butterFx.js';
import { spawnDamageNumber } from '../systems/damageNumbers.js';

export class Bullet {
  constructor(x, y, target, config) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.config = config;
    this.speed = 320;
    this.radius = 4;
    this.alive = true;
    this.trail = [];
    this.maxTrail = 8;
  }

  recordTrail() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) {
      this.trail.shift();
    }
  }

  update(dt, enemies, ripples, damageNumbers) {
    if (!this.alive) return;
    if (!this.target || !this.target.alive || !this.target.canBeTargeted()) {
      this.alive = false;
      return;
    }

    this.recordTrail();

    const tx = this.target.position.x;
    const ty = this.target.position.y;
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= this.speed * dt + this.target.radius) {
      this.onHit(enemies, tx, ty, ripples, damageNumbers);
      this.alive = false;
      return;
    }

    const nx = dx / dist;
    const ny = dy / dist;
    this.x += nx * this.speed * dt;
    this.y += ny * this.speed * dt;
  }

  applyDirectDamage(target, damageNumbers, x, y) {
    const { damage = 0 } = this.config;
    return target.takeDamage(damageNumbers, damage, {
      x,
      y,
      variant: 'normal',
      showDamageNumber: true
    });
  }

  onHit(enemies, x, y, ripples, damageNumbers) {
    spawnBasicRipples(x, y, ripples);
    const { damage = 0, tower } = this.config;
    if (damage > 0) {
      this.applyDirectDamage(this.target, damageNumbers, x, y);
    }
    playBulletHitSound(tower);
    if (tower) {
      tower.onHit(this.target, damageNumbers, x, y);
    }
  }

  renderTrail(ctx, color, width = 3) {
    if (this.trail.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.trail[0].x, this.trail[0].y);
    for (let i = 1; i < this.trail.length; i += 1) {
      ctx.lineTo(this.trail[i].x, this.trail[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  render(ctx) {
    if (!this.alive) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.config.bulletColor;
    ctx.fill();
  }
}

export class IceBullet extends Bullet {
  constructor(x, y, target, config) {
    super(x, y, target, config);
    this.radius = 5;
    this.maxTrail = 6;
  }

  onHit(enemies, x, y, ripples, damageNumbers) {
    spawnFreezeRipples(x, y, ripples);
    const { damage = 0, tower } = this.config;
    if (damage > 0) {
      this.applyDirectDamage(this.target, damageNumbers, x, y);
    }
    playBulletHitSound(tower);
    if (tower) {
      tower.onHit(this.target, damageNumbers, x, y);
    }
  }

  render(ctx) {
    if (!this.alive) return;
    this.renderTrail(ctx, 'rgba(174, 214, 241, 0.45)', 2);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = Math.cos(angle) * 6;
      const py = Math.sin(angle) * 6;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#d6eaf8';
    ctx.fill();
    ctx.strokeStyle = '#85c1e9';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

export class TitanBullet extends Bullet {
  constructor(x, y, target, config) {
    super(x, y, target, config);
    this.radius = 6;
  }

  onHit(enemies, x, y, ripples, damageNumbers) {
    spawnTitanRipples(x, y, ripples);
    const { damage = 0, tower } = this.config;
    if (damage > 0) {
      this.applyDirectDamage(this.target, damageNumbers, x, y);
    }
    playBulletHitSound(tower);
    if (tower) {
      tower.onHit(this.target, damageNumbers, x, y);
    }
  }

  render(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(210, 180, 222, 0.35)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#9b59b6';
    ctx.fill();
    ctx.strokeStyle = '#d2b4de';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

export class HellBullet extends Bullet {
  constructor(x, y, target, config) {
    super(x, y, target, config);
    this.radius = 5;
    this.maxTrail = 10;
  }

  onHit(enemies, x, y, ripples, damageNumbers) {
    spawnBasicRipples(x, y, ripples);
    const { damage = 0, tower } = this.config;
    if (damage > 0) {
      this.applyDirectDamage(this.target, damageNumbers, x, y);
    }
    playBulletHitSound(tower);
    if (tower) {
      tower.onHit(this.target, damageNumbers, x, y);
    }
  }

  render(ctx) {
    if (!this.alive) return;
    this.renderTrail(ctx, 'rgba(241, 148, 138, 0.55)', 4);

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(231, 76, 60, 0.35)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.restore();
  }
}

export class LavaBullet extends Bullet {
  constructor(x, y, target, config) {
    super(x, y, target, config);
    this.radius = 5;
    this.maxTrail = 10;
    this.sparkPhase = Math.random() * Math.PI * 2;
  }

  onHit(enemies, x, y, ripples, damageNumbers) {
    spawnLavaRipples(x, y, ripples);
    const { damage = 0, tower } = this.config;
    if (damage > 0) {
      this.applyDirectDamage(this.target, damageNumbers, x, y);
    }
    playBulletHitSound(tower);
    if (tower) {
      tower.onHit(this.target, damageNumbers, x, y);
    }
  }

  render(ctx) {
    if (!this.alive) return;
    this.renderTrail(ctx, 'rgba(243, 156, 18, 0.5)', 3);

    for (let i = 0; i < 3; i += 1) {
      const angle = this.sparkPhase + i * 2.1;
      const px = this.x + Math.cos(angle) * 7;
      const py = this.y + Math.sin(angle) * 7;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 183, 77, 0.85)';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f39c12';
    ctx.fill();
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

export class SpreadBullet extends Bullet {
  constructor(x, y, config) {
    super(x, y, null, config);
    this.angle = config.angle;
    this.speed = config.bulletSpeed || 200;
    this.remainingPierce = config.pierce || 0;
    this.hitEnemies = new Set();
    this.ghostTrail = [];
    this.maxGhost = 3;
    this.radius = 4;
    this.trail = [];
    this.maxTrail = 0;

    const tower = config.tower;
    if (tower && Number.isFinite(tower.col) && Number.isFinite(tower.row)) {
      const { col, row } = tower;
      this.rangeMinX = (col - 1) * CELL;
      this.rangeMaxX = (col + 2) * CELL;
      this.rangeMinY = (row - 1) * CELL;
      this.rangeMaxY = (row + 2) * CELL;
    } else {
      this.rangeMinX = 0;
      this.rangeMaxX = CANVAS_W;
      this.rangeMinY = 0;
      this.rangeMaxY = CANVAS_H;
    }
  }

  recordGhost() {
    this.ghostTrail.push({ x: this.x, y: this.y });
    if (this.ghostTrail.length > this.maxGhost) {
      this.ghostTrail.shift();
    }
  }

  isOutsideSpreadRange() {
    return (
      this.x < this.rangeMinX ||
      this.x >= this.rangeMaxX ||
      this.y < this.rangeMinY ||
      this.y >= this.rangeMaxY
    );
  }

  update(dt, enemies, ripples, damageNumbers) {
    if (!this.alive) return;

    this.recordGhost();
    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;

    if (this.isOutsideSpreadRange()) {
      this.alive = false;
      return;
    }

    for (const enemy of enemies) {
      if (!enemy.alive || this.hitEnemies.has(enemy)) continue;

      const pos = enemy.position;
      const dist = Math.hypot(pos.x - this.x, pos.y - this.y);
      if (dist > this.radius + enemy.radius) continue;

      spawnBasicRipples(this.x, this.y, ripples);
      const { damage = 0, tower } = this.config;
      if (damage > 0) {
        this.applyDirectDamage(enemy, damageNumbers, this.x, this.y);
      }
      playBulletHitSound(tower);
      if (tower) {
        tower.onHit(enemy, damageNumbers, this.x, this.y);
      }

      this.hitEnemies.add(enemy);
      if (this.remainingPierce > 0) {
        this.remainingPierce -= 1;
        return;
      }

      this.alive = false;
      return;
    }
  }

  render(ctx) {
    if (!this.alive) return;

    for (let i = 0; i < this.ghostTrail.length; i += 1) {
      const ghost = this.ghostTrail[i];
      const alpha = ((i + 1) / (this.maxGhost + 1)) * 0.45;
      ctx.beginPath();
      ctx.arc(ghost.x, ghost.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(46, 204, 113, ${alpha})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.config.bulletColor;
    ctx.fill();
  }
}

export class ButterBullet extends Bullet {
  constructor(x, y, target, config) {
    super(x, y, target, config);
    this.homX = x;
    this.homY = y;
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.speed = config.bulletSpeed || 300;
    this.radius = 5;
    this.maxTrail = 6;
    this.flyAngle = 0;
  }

  applyDirectDamage(target, damageNumbers, x, y) {
    const { damage = 0 } = this.config;
    return target.takeDamage(damageNumbers, damage, {
      x,
      y,
      variant: 'butter',
      showDamageNumber: true
    });
  }

  update(dt, enemies, ripples, damageNumbers) {
    if (!this.alive) return;
    if (!this.target || !this.target.alive || !this.target.canBeTargeted()) {
      this.alive = false;
      return;
    }

    this.recordTrail();

    const tx = this.target.position.x;
    const ty = this.target.position.y;
    const dx = tx - this.homX;
    const dy = ty - this.homY;
    const dist = Math.hypot(dx, dy);

    if (dist <= this.speed * dt + this.target.radius) {
      this.homX = tx;
      this.homY = ty;
      this.x = tx;
      this.y = ty;
      this.onHit(enemies, tx, ty, ripples, damageNumbers);
      this.alive = false;
      return;
    }

    const nx = dx / dist;
    const ny = dy / dist;
    this.flyAngle = Math.atan2(ny, nx);
    this.homX += nx * this.speed * dt;
    this.homY += ny * this.speed * dt;
    this.wobblePhase += dt * 11;
    const px = -ny;
    const py = nx;
    const w = Math.sin(this.wobblePhase) * 4;
    this.x = this.homX + px * w;
    this.y = this.homY + py * w;
  }

  onHit(enemies, x, y, ripples, damageNumbers) {
    spawnButterSplatter(x, y, ripples);
    const { damage = 0, tower } = this.config;
    const target = this.target;
    if (damage > 0 && target?.alive) {
      this.applyDirectDamage(target, damageNumbers, x, y);
    }
    playBulletHitSound(tower);

    if (tower?.typeId === 'butter' && target) {
      if (tower.level >= 3) {
        for (const e of enemies) {
          if (!e.alive || e === target || e.typeId === 'boss' || e.typeId === 'armor') continue;
          const p = e.position;
          if (Math.hypot(p.x - x, p.y - y) <= 40 + e.radius) {
            e.applySlow(0.7, 2);
          }
        }
      }
      if (target.alive && target.typeId === 'armor') {
        if (Math.random() < tower.getRootChance()) {
          target.triggerControlImmune('butter');
        }
      } else if (target.alive && target.canBeRootedByButter() && Math.random() < tower.getRootChance()) {
        target.applyButterRoot(tower.getRootDuration());
        playButterRootSound();
      }
    }

    if (tower) {
      tower.onHit(target, damageNumbers, x, y);
    }
  }

  render(ctx) {
    if (!this.alive) return;
    this.renderTrail(ctx, 'rgba(255, 224, 120, 0.4)', 2);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.flyAngle);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = 'rgba(255, 225, 130, 0.78)';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius + 2, this.radius - 1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(240, 185, 60, 0.55)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}

const BULLET_CLASSES = {
  normal: Bullet,
  ice: IceBullet,
  titan: TitanBullet,
  hell: HellBullet,
  lava: LavaBullet,
  spread: SpreadBullet
};

export function createTowerBullet(typeId, x, y, target, config) {
  if (typeId === 'spread') {
    return new SpreadBullet(x, y, config);
  }
  if (typeId === 'butter') {
    return new ButterBullet(x, y, target, config);
  }
  const BulletClass = BULLET_CLASSES[typeId] || Bullet;
  return new BulletClass(x, y, target, config);
}
