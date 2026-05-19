const GRAVITY = 120;

export class Particle {
  constructor({ x, y, vx, vy, radius, color, lifetime }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.maxRadius = radius;
    this.radius = radius;
    this.color = color;
    this.maxLifetime = lifetime;
    this.lifetime = lifetime;
    this.opacity = 1;
  }

  update(dt) {
    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime -= dt;

    const lifeRatio = Math.max(0, this.lifetime / this.maxLifetime);
    this.opacity = lifeRatio;
    this.radius = this.maxRadius * lifeRatio;

    return this.lifetime > 0 && this.opacity > 0;
  }

  render(ctx) {
    if (this.opacity <= 0 || this.radius <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}
