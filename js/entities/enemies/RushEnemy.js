import { Enemy } from './Enemy.js';

export class RushEnemy extends Enemy {
  constructor(options) {
    super({ ...options, typeId: 'rush' });
    this.normalBaseSpeed = this.baseSpeed;
    this.rushActive = false;
    this.rushGhosts = [];
  }

  get speed() {
    if (this.rushActive) {
      return 160 * this.slowMultiplier;
    }
    return this.normalBaseSpeed * this.slowMultiplier;
  }

  onUpdate(dt) {
    const wasRush = this.rushActive;
    this.rushActive = !this.isSlowed && this.hp / this.maxHp <= 0.5;

    if (this.rushActive) {
      const { x, y } = this.position;
      this.rushGhosts.push({ x, y, life: 0.2 });
    }
    this.rushGhosts = this.rushGhosts
      .map((ghost) => ({ ...ghost, life: ghost.life - dt }))
      .filter((ghost) => ghost.life > 0);

    if (this.rushActive && !wasRush) {
      this.rushGhosts = [];
    }
  }

  onSlowApplied() {
    this.rushActive = false;
  }

  drawBody(ctx, x, y) {
    for (const ghost of this.rushGhosts) {
      ctx.beginPath();
      ctx.arc(ghost.x, ghost.y, this.radius * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(231, 76, 60, ${0.3 * (ghost.life / 0.2)})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.rushActive ? '#ff5252' : '#f39c12';
    ctx.fill();
    ctx.strokeStyle = '#d35400';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - this.radius - 2, y - 2);
    ctx.lineTo(x - this.radius - 8, y - 2);
    ctx.moveTo(x + this.radius + 2, y + 2);
    ctx.lineTo(x + this.radius + 8, y + 2);
    ctx.stroke();
  }

  drawFace(ctx, x, y) {
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 4);
    ctx.lineTo(x - 2, y - 1);
    ctx.moveTo(x + 6, y - 4);
    ctx.lineTo(x + 2, y - 1);
    ctx.stroke();
  }
}
