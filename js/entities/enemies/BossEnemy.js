import { Enemy } from './Enemy.js';

export class BossEnemy extends Enemy {
  constructor(options) {
    super({ ...options, typeId: 'boss' });
    this.normalBaseSpeed = this.baseSpeed;
    this.rageActive = false;
    this.pulseTimer = 0;
  }

  onUpdate(dt) {
    this.rageActive = this.hp / this.maxHp <= 0.5;
    if (this.rageActive) {
      this.baseSpeed = this.normalBaseSpeed * 1.3;
      this.pulseTimer += dt * 6;
    } else {
      this.baseSpeed = this.normalBaseSpeed;
    }
  }

  onDeath() {
    return { screenShake: false, explosionScale: 3 };
  }

  drawBody(ctx, x, y) {
    if (this.rageActive) {
      const pulse = 0.35 + Math.sin(this.pulseTimer) * 0.15;
      ctx.beginPath();
      ctx.arc(x, y, this.radius + 8, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(231, 76, 60, ${pulse})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#922b21';
    ctx.fill();
    ctx.strokeStyle = '#641e16';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  drawFace(ctx, x, y) {
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(x - 10, y - this.radius - 4);
    ctx.lineTo(x - 4, y - this.radius - 14);
    ctx.lineTo(x, y - this.radius - 6);
    ctx.lineTo(x + 4, y - this.radius - 14);
    ctx.lineTo(x + 10, y - this.radius - 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ff7675';
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 2);
    ctx.lineTo(x - 2, y + 2);
    ctx.lineTo(x - 8, y + 4);
    ctx.closePath();
    ctx.moveTo(x + 8, y - 2);
    ctx.lineTo(x + 2, y + 2);
    ctx.lineTo(x + 8, y + 4);
    ctx.fill();
  }
}
