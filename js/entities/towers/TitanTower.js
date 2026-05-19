import { Tower } from './Tower.js';

export class TitanTower extends Tower {
  constructor(col, row, battleModifiers = {}) {
    super(col, row, 'titan', battleModifiers);
  }

  getEffectDescription() {
    return `额外造成目标当前血量 ${Math.round(this.config.hpPercent * this.effectStrength * 100)}% 的伤害。`;
  }

  onHit(enemy, damageNumbers, x, y) {
    const bonusDamage = enemy.hp * this.config.hpPercent * this.effectStrength;
    if (bonusDamage <= 0) return;
    const pos = enemy.position;
    enemy.takeDamage(damageNumbers, bonusDamage, {
      x: pos.x,
      y: pos.y - enemy.radius - 6,
      variant: 'titan',
      isBonus: true
    });
  }

  drawTower(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = this.config.color;
    ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
    ctx.strokeStyle = this.config.stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);

    ctx.fillStyle = this.config.barrel;
    ctx.fillRect(6, -5, 18, 10);

    ctx.restore();
  }
}
