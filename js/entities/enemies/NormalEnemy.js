import { Enemy } from './Enemy.js';

export class NormalEnemy extends Enemy {
  constructor(options) {
    super({ ...options, typeId: 'normal' });
  }

  drawBody(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isSlowed ? '#5dade2' : '#e74c3c';
    ctx.fill();
    ctx.strokeStyle = '#922b21';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawFace(ctx, x, y) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 4, y - 2, 2.2, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 2, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y + 4, 4, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }
}
