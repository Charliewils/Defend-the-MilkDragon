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
import {
  drawCannonBarrel,
  drawRadialBody,
  drawTowerPlatform,
  drawTowerShadow
} from '../../render/vectorArt.js';
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
    const g = ctx.createRadialGradient(this.x, this.y, this.range * 0.3, this.x, this.y, this.range);
    g.addColorStop(0, 'rgba(241, 196, 15, 0.14)');
    g.addColorStop(1, 'rgba(241, 196, 15, 0.04)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(241, 196, 15, 0.75)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawLevelBadge(ctx) {
    if (this.level <= 1) return;
    const bx = this.x;
    const by = this.y - this.radius - 9;
    ctx.save();
    // 徽章背景
    const badgeW = 26;
    const badgeH = 13;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx - badgeW / 2, by - badgeH / 2, badgeW, badgeH, 4);
    else ctx.rect(bx - badgeW / 2, by - badgeH / 2, badgeW, badgeH);
    const bg = ctx.createLinearGradient(bx, by - badgeH / 2, bx, by + badgeH / 2);
    bg.addColorStop(0, '#ffe566');
    bg.addColorStop(1, '#c8a200');
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = '#7a6000';
    ctx.lineWidth = 1;
    ctx.stroke();
    // 文字
    ctx.fillStyle = '#1a0e00';
    ctx.font = 'bold 9px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Lv${this.level}`, bx, by + 0.5);
    ctx.restore();
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
    drawTowerShadow(ctx, 0, 0, this.radius);
    ctx.rotate(this.angle);
    drawTowerPlatform(ctx, this.radius, this.config.color, this.config.stroke);
    drawRadialBody(ctx, 0, 0, this.radius * 0.82, {
      light: this.config.color,
      base: this.config.color,
      dark: this.config.stroke,
      stroke: this.config.stroke
    });
    drawCannonBarrel(ctx, 14, 6, this.config.barrel, this.config.stroke);
    ctx.restore();
  }

  render(ctx, showRange) {
    this.draw(ctx, showRange);
  }
}
