import { Tower } from './Tower.js';

export class IceTower extends Tower {
  constructor(col, row, battleModifiers = {}) {
    super(col, row, 'ice', battleModifiers);
  }

  get damage() {
    const bonus = this.battleModifiers.freezeDamageBonus || 0;
    return Math.round(super.damage * (1 + bonus));
  }

  getSlowMultiplier() {
    const reduction = this.config.slowReduction * this.effectStrength;
    return Math.max(0.1, 1 - reduction);
  }

  getSlowDuration() {
    const bonus = this.battleModifiers.freezeDamageBonus || 0;
    return this.config.slowDuration * this.effectStrength * (1 + bonus);
  }

  getEffectDescription() {
    return `命中减速 ${Math.round((1 - this.getSlowMultiplier()) * 100)}%，持续 ${this.getSlowDuration().toFixed(1)} 秒并可刷新。`;
  }

  onHit(enemy, damageNumbers, x, y) {
    if (enemy.isInvisible) return;
    let multiplier = this.getSlowMultiplier();
    if (enemy.typeId === 'boss') {
      const reduction = this.config.slowReduction * this.effectStrength * 0.5;
      multiplier = Math.max(0.1, 1 - reduction);
    }
    enemy.applySlow(multiplier, this.getSlowDuration());
    if (enemy.typeId === 'rush') {
      enemy.rushActive = false;
      enemy.baseSpeed = enemy.normalBaseSpeed * enemy.slowMultiplier;
    }
  }

  drawTower(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
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

    ctx.fillStyle = this.config.barrel;
    ctx.fillRect(6, -3, 14, 6);

    ctx.restore();
  }
}
