import { Tower } from './Tower.js';

export class NormalTower extends Tower {
  constructor(col, row, battleModifiers = {}) {
    super(col, row, 'normal', battleModifiers);
  }

  getEffectDescription() {
    return '发射普通子弹，造成稳定单体伤害。';
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
}
