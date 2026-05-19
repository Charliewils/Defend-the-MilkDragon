const EXPAND_SPEED = 180;

export class RippleEffect {
  constructor({ x, y, maxRadius, color, spawnDelay = 0 }) {
    this.x = x;
    this.y = y;
    this.maxRadius = maxRadius;
    this.currentRadius = 0;
    this.color = color;
    this.spawnDelay = spawnDelay;
    this.opacity = 0.8;
  }

  update(dt) {
    if (this.spawnDelay > 0) {
      this.spawnDelay -= dt;
      return true;
    }

    this.currentRadius += EXPAND_SPEED * dt;
    const progress = Math.min(1, this.currentRadius / this.maxRadius);
    this.opacity = 0.8 * (1 - progress);
    return this.currentRadius < this.maxRadius;
  }

  render(ctx) {
    if (this.spawnDelay > 0 || this.opacity <= 0 || this.currentRadius <= 0) return;

    const progress = Math.min(1, this.currentRadius / this.maxRadius);
    const lineWidth = 3 - 2.5 * progress;
    const [r, g, b] = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

export function spawnBasicRipples(x, y, ripples) {
  ripples.push(new RippleEffect({
    x,
    y,
    maxRadius: 30,
    color: [255, 255, 255]
  }));
}

export function spawnFreezeRipples(x, y, ripples) {
  const color = [92, 172, 255];
  ripples.push(new RippleEffect({ x, y, maxRadius: 40, color }));
  ripples.push(new RippleEffect({ x, y, maxRadius: 40, color, spawnDelay: 0.1 }));
}

export function spawnBombRipples(x, y, ripples) {
  const color = [255, 112, 67];
  ripples.push(new RippleEffect({ x, y, maxRadius: 70, color }));
  ripples.push(new RippleEffect({ x, y, maxRadius: 70, color, spawnDelay: 0.06 }));
  ripples.push(new RippleEffect({ x, y, maxRadius: 70, color, spawnDelay: 0.12 }));
}

export function spawnTitanRipples(x, y, ripples) {
  const color = [155, 89, 182];
  ripples.push(new RippleEffect({ x, y, maxRadius: 56, color }));
  ripples.push(new RippleEffect({ x, y, maxRadius: 56, color, spawnDelay: 0.08 }));
}

export function spawnLavaRipples(x, y, ripples) {
  const color = [255, 152, 0];
  ripples.push(new RippleEffect({ x, y, maxRadius: 42, color }));
  ripples.push(new RippleEffect({ x, y, maxRadius: 42, color, spawnDelay: 0.08 }));
}
