import { audioManager } from '../../audio/index.js';
import { Tower } from './Tower.js';

export class LavaTower extends Tower {
  constructor(col, row, battleModifiers = {}) {
    super(col, row, 'lava', battleModifiers);
  }

  getEffectDescription() {
    const tickDamage = Math.round(this.config.burnTickDamage * this.effectStrength);
    const duration = (this.config.burnDuration * this.effectStrength).toFixed(1);
    return `附加灼烧：每 ${this.config.burnTickInterval} 秒 ${tickDamage} 点，持续 ${duration} 秒。`;
  }

  onHit(enemy, damageNumbers, x, y) {
    audioManager.playSound('hit_burn');
    enemy.applyBurn(
      this.config.burnTickDamage * this.effectStrength,
      this.config.burnDuration * this.effectStrength,
      this.config.burnTickInterval
    );
  }

  drawTower(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = this.config.color;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.config.color;
    ctx.fill();
    ctx.strokeStyle = this.config.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowColor = this.config.barrel;
    ctx.shadowBlur = 8;
    ctx.fillStyle = this.config.barrel;
    ctx.fillRect(6, -3, 14, 6);
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}
