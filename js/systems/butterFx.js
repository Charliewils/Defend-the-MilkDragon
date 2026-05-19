/** Irregular butter splat chunk for hit effect (≈0.4s) */
export class ButterSplatChunk {
  constructor({ x, y }) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 120;
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 40;
    this.rot = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 10;
    this.w = 4 + Math.random() * 6;
    this.h = 3 + Math.random() * 5;
    this.life = 0.4;
    this.maxLife = 0.4;
  }

  update(dt) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 140 * dt;
    this.vx *= 1 - 1.2 * dt;
    this.rot += this.spin * dt;
    return this.life > 0;
  }

  render(ctx) {
    const a = Math.max(0, this.life / this.maxLife);
    if (a <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.globalAlpha = 0.55 * a + 0.15;
    ctx.fillStyle = `rgba(255, 224, 102, ${0.75 + 0.2 * a})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.w, this.h, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(240, 180, 50, ${0.5 * a})`;
    ctx.beginPath();
    ctx.ellipse(-this.w * 0.15, this.h * 0.1, this.w * 0.45, this.h * 0.35, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function spawnButterSplatter(x, y, ripples) {
  const count = 6 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i += 1) {
    ripples.push(new ButterSplatChunk({ x, y }));
  }
}
