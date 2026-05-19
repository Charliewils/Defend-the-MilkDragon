import { Enemy } from './Enemy.js';

const CYCLE = 4;
const VISIBLE_TIME = 2;
const FADE_TIME = 0.3;

export class StealthEnemy extends Enemy {
  constructor(options) {
    super({ ...options, typeId: 'stealth' });
    this.cycleTimer = 0;
    this.visibility = 1;
    this.targetVisibility = 1;
  }

  onUpdate(dt) {
    this.cycleTimer = (this.cycleTimer + dt) % CYCLE;
    const visiblePhase = this.cycleTimer < VISIBLE_TIME;
    this.targetVisibility = visiblePhase ? 1 : 0.15;
    this.isInvisible = this.targetVisibility <= 0.2;
    this.invisibleTimer = this.isInvisible ? VISIBLE_TIME - (this.cycleTimer - VISIBLE_TIME) : 0;

    const fadeSpeed = 1 / FADE_TIME;
    if (this.visibility < this.targetVisibility) {
      this.visibility = Math.min(this.targetVisibility, this.visibility + fadeSpeed * dt);
    } else if (this.visibility > this.targetVisibility) {
      this.visibility = Math.max(this.targetVisibility, this.visibility - fadeSpeed * dt);
    }
  }

  applySlow(multiplier, duration) {
    if (this.isInvisible) return;
    super.applySlow(multiplier, duration);
  }

  draw(ctx) {
    if (!this.alive && !this.reachedEnd) return;
    const { x, y } = this.position;

    ctx.save();
    ctx.globalAlpha = this.visibility;

    if (this.isInvisible) {
      ctx.beginPath();
      ctx.arc(x, y, this.radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(155, 89, 182, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    this.drawSlowTrail(ctx);

    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isSlowed ? '#7d3c98' : '#5b2c6f';
    ctx.fill();
    ctx.strokeStyle = '#4a235a';
    ctx.lineWidth = 2;
    ctx.stroke();

    this.drawFace(ctx, x, y);
    this.drawBurnFlames(ctx, x, y);
    this.drawHealthBar(ctx, x, y);
    ctx.restore();
  }

  drawFace(ctx, x, y) {
    ctx.fillStyle = '#f4ecf7';
    ctx.beginPath();
    for (let i = 0; i < 4; i += 1) {
      const angle = (Math.PI / 2) * i - Math.PI / 2;
      const px = x + Math.cos(angle) * 2.5;
      const py = y - 2 + Math.sin(angle) * 2.5;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
}
