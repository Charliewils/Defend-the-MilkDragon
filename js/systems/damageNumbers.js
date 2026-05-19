const VARIANT_STYLES = {
  normal: { color: '#ffffff', fontSize: 14, bold: false },
  lightning: { color: '#f1c40f', fontSize: 22, bold: true },
  butter: { color: '#ffe082', fontSize: 15, bold: false },
  ice: { color: '#85c1e9', fontSize: 17, bold: true },
  titan: { color: '#d2b4de', fontSize: 17, bold: true },
  hell: { color: '#f1948a', fontSize: 17, bold: true },
  lava: { color: '#f39c12', fontSize: 16, bold: true }
};

export class DamageNumber {
  constructor({ x, y, value, variant = 'normal', isBonus = false }) {
    const style = VARIANT_STYLES[variant] || VARIANT_STYLES.normal;
    this.x = x;
    this.y = y;
    this.value = Math.max(1, Math.round(value));
    this.color = style.color;
    this.fontSize = isBonus ? style.fontSize + 2 : style.fontSize;
    this.bold = style.bold || isBonus;
    this.lifetime = 1;
    this.elapsed = 0;
    this.alive = true;
  }

  update(dt) {
    this.elapsed += dt;
    this.y -= 28 * dt;
    this.alive = this.elapsed < this.lifetime;
    return this.alive;
  }

  render(ctx) {
    const alpha = Math.max(0, 1 - this.elapsed / this.lifetime);
    if (alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = `${this.bold ? 'bold ' : ''}${this.fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(this.value), this.x, this.y);
    ctx.restore();
  }
}

export function spawnDamageNumber(damageNumbers, { x, y, value, variant = 'normal', isBonus = false }) {
  if (!damageNumbers || value <= 0) return;
  damageNumbers.push(new DamageNumber({ x, y, value, variant, isBonus }));
}
