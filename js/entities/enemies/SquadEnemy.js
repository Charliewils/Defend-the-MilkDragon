import { Enemy } from './Enemy.js';

export class SquadEnemy extends Enemy {
  constructor(options) {
    super({
      ...options,
      typeId: 'squad',
      squadIndex: options.squadIndex ?? 1,
      isLeader: Boolean(options.isLeader)
    });
  }

  drawBody(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isSlowed ? '#58d68d' : '#27ae60';
    ctx.fill();
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawFace(ctx, x, y) {
    ctx.strokeStyle = '#145a32';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 3, y - this.radius - 1);
    ctx.lineTo(x - 3, y - this.radius - 5);
    ctx.moveTo(x + 3, y - this.radius - 1);
    ctx.lineTo(x + 3, y - this.radius - 5);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(this.squadIndex), x, y - 1);

    if (this.isLeader) {
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(x - 3, y - this.radius - 10, 6, 4);
      ctx.beginPath();
      ctx.moveTo(x + 3, y - this.radius - 10);
      ctx.lineTo(x + 6, y - this.radius - 8);
      ctx.lineTo(x + 3, y - this.radius - 6);
      ctx.fill();
    }
  }
}
