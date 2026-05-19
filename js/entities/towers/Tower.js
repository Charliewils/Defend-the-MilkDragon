import {
  MAX_TOWER_LEVEL,
  TOWER_DAMAGE_GROWTH,
  TOWER_EFFECT_GROWTH,
  TOWER_RANGE_GROWTH,
  getTowerConfig
} from '../../config/towers.js';
import { applyTowerSkinToConfig } from '../../cosmetics/towerSkins.js';
import { getEquippedTowerSkin } from '../../storage/gemInventory.js';
import { cellCenter } from '../../map/grid.js';
import { createTowerBullet } from '../Bullet.js';
import { MuzzleFlash } from '../MuzzleFlash.js';
import { playTowerShootSound } from '../../audio/combatSounds.js';

export class Tower {
  constructor(col, row, typeId, battleModifiers = {}) {
    const baseConfig = getTowerConfig(typeId);
    const config = applyTowerSkinToConfig(baseConfig, getEquippedTowerSkin());
    this.typeId = typeId;
    this.config = config;
    this.col = col;
    this.row = row;
    this.battleModifiers = battleModifiers;
    this.level = 1;
    this.cost = config.cost;
    this.name = config.name;
    this.color = config.color;

    const center = cellCenter(col, row);
    this.position = center;
    this.x = center.x;
    this.y = center.y;
    this.fireCooldown = 0;
    this.angle = 0;
    this.radius = 16;
    this.lockedTarget = null;
    this.fireRateMultiplier = 1;
  }

  get damageMultiplier() {
    return 1 + TOWER_DAMAGE_GROWTH * (this.level - 1);
  }

  get rangeMultiplier() {
    return 1 + TOWER_RANGE_GROWTH * (this.level - 1);
  }

  get effectStrength() {
    return 1 + TOWER_EFFECT_GROWTH * (this.level - 1);
  }

  get damage() {
    return Math.round(this.config.damage * this.damageMultiplier);
  }

  get range() {
    return this.config.range * this.rangeMultiplier;
  }

  get fireRate() {
    return this.config.fireRate * this.fireRateMultiplier;
  }

  get fireInterval() {
    return 1 / this.config.fireRate;
  }

  get upgradeCost() {
    if (this.level >= MAX_TOWER_LEVEL) return null;
    return this.config.upgradeCosts[this.level - 1];
  }

  getSellValue() {
    return Math.floor(this.cost * 0.5);
  }

  canUpgrade() {
    return this.level < MAX_TOWER_LEVEL;
  }

  upgrade() {
    if (!this.canUpgrade()) return false;
    this.level += 1;
    return true;
  }

  getEffectDescription() {
    return '稳定输出，无额外特效。';
  }

  getStats() {
    return {
      name: this.name,
      level: this.level,
      damage: this.damage,
      range: Math.round(this.range),
      fireRate: this.fireRate,
      effectDescription: this.getEffectDescription()
    };
  }

  getDistanceTo(enemy) {
    const pos = enemy.position;
    return Math.hypot(pos.x - this.x, pos.y - this.y);
  }

  isTargetValid(enemy) {
    if (!enemy || !enemy.alive || !enemy.canBeTargeted()) return false;
    return this.getDistanceTo(enemy) <= this.range;
  }

  findNearestTarget(enemies, exclude = []) {
    let nearest = null;
    let nearestDist = Infinity;
    for (const enemy of enemies) {
      if (!enemy.alive || !enemy.canBeTargeted()) continue;
      if (exclude.includes(enemy)) continue;
      const dist = this.getDistanceTo(enemy);
      if (dist <= this.range && dist < nearestDist) {
        nearest = enemy;
        nearestDist = dist;
      }
    }
    return nearest;
  }

  findTarget(enemies) {
    return this.findNearestTarget(enemies);
  }

  findTargetsForShot(enemies) {
    if (this.isTargetValid(this.lockedTarget)) {
      return [this.lockedTarget];
    }

    this.lockedTarget = this.findNearestTarget(enemies);
    return this.lockedTarget ? [this.lockedTarget] : [];
  }

  rotateTo(target) {
    const pos = target.position;
    this.angle = Math.atan2(pos.y - this.y, pos.x - this.x);
  }

  getMuzzlePoint(angle = this.angle) {
    return {
      x: this.x + Math.cos(angle) * this.radius,
      y: this.y + Math.sin(angle) * this.radius
    };
  }

  createBullet(target, damageNumbers) {
    const muzzle = this.getMuzzlePoint();
    return createTowerBullet(this.typeId, muzzle.x, muzzle.y, target, {
      damage: this.damage,
      bulletColor: this.config.bulletColor,
      tower: this,
      damageNumbers
    });
  }

  shoot(targets, bullets, muzzleFlashes, damageNumbers) {
    for (const target of targets) {
      bullets.push(this.createBullet(target, damageNumbers));
    }
    muzzleFlashes.push(MuzzleFlash.fromTower(this));
    playTowerShootSound(this.typeId);
  }

  onHit(enemy, damageNumbers, x, y) {}

  update(dt, enemies, bullets, muzzleFlashes, damageNumbers) {
    this.fireCooldown -= dt;
    const targets = this.findTargetsForShot(enemies);
    if (!targets.length) return;

    this.rotateTo(targets[0]);
    if (this.fireCooldown > 0) return;

    this.shoot(targets, bullets, muzzleFlashes, damageNumbers);
    this.fireCooldown = this.fireInterval;
  }

  drawRange(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(241, 196, 15, 0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(241, 196, 15, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawLevelBadge(ctx) {
    if (this.level <= 1) return;
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Lv${this.level}`, this.x, this.y - this.radius - 8);
  }

  draw(ctx, showRange) {
    if (showRange) {
      this.drawRange(ctx);
    }
    this.drawTower(ctx);
    this.drawLevelBadge(ctx);
  }

  drawTower(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.config.color;
    ctx.fill();
    ctx.strokeStyle = this.config.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = this.config.barrel;
    ctx.fillRect(6, -3, 14, 6);

    ctx.restore();
  }

  render(ctx, showRange) {
    this.draw(ctx, showRange);
  }
}
