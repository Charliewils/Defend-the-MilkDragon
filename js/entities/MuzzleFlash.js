const DURATION = 0.12;

const TYPE_STYLES = {
  normal: {
    size: 12,
    primary: '#FFE566',
    rayWidth: 4
  },
  ice: {
    size: 10,
    primary: '#BFEFFF',
    secondary: '#E8F6FF',
    rayWidth: 3,
    iceLines: true
  },
  titan: {
    size: 14,
    primary: '#D2B4DE',
    secondary: '#A569BD',
    rayWidth: 5
  },
  hell: {
    size: 13,
    primary: '#FF8A80',
    secondary: '#FF5252',
    rayWidth: 5
  },
  lava: {
    size: 14,
    primary: '#FFB74D',
    secondary: '#FF7043',
    rayWidth: 6
  },
  spread: {
    size: 11,
    primary: '#7DCEA0',
    secondary: '#2ECC71',
    rayWidth: 4
  },
  butter: {
    size: 11,
    primary: '#FFE566',
    secondary: '#F0B429',
    rayWidth: 4
  }
};

export class MuzzleFlash {
  constructor({ typeId, x, y, angle }) {
    const style = TYPE_STYLES[typeId] || TYPE_STYLES.normal;
    this.typeId = typeId;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.size = style.size;
    this.style = style;
    this.duration = DURATION;
    this.elapsed = 0;
    this.opacity = 1;
    this.rayCount = 4 + Math.floor(Math.random() * 3);
  }

  static fromTower(tower, x = null, y = null, angle = null) {
    const aimAngle = angle ?? tower.angle;
    const muzzleX = x ?? tower.x + Math.cos(aimAngle) * tower.radius;
    const muzzleY = y ?? tower.y + Math.sin(aimAngle) * tower.radius;
    return new MuzzleFlash({
      typeId: tower.typeId,
      x: muzzleX,
      y: muzzleY,
      angle: aimAngle
    });
  }

  update(dt) {
    this.elapsed += dt;
    const progress = Math.min(1, this.elapsed / this.duration);
    this.opacity = 1 - progress;
    return this.elapsed < this.duration && this.opacity > 0;
  }

  drawRay(ctx, rayAngle, length, width, color) {
    ctx.save();
    ctx.rotate(rayAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, width * 0.5);
    ctx.lineTo(length, -width * 0.5);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  render(ctx) {
    if (this.opacity <= 0) return;

    const { primary, secondary, rayWidth, iceLines } = this.style;
    const rayColor = secondary || primary;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = this.opacity;

    for (let i = 0; i < this.rayCount; i += 1) {
      const rayAngle = (Math.PI * 2 * i) / this.rayCount;
      this.drawRay(ctx, rayAngle, this.size, rayWidth, rayColor);
    }

    if (iceLines) {
      ctx.strokeStyle = 'rgba(232, 246, 255, 0.9)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i += 1) {
        const lineAngle = (Math.PI * 2 * i) / 6;
        ctx.save();
        ctx.rotate(lineAngle);
        ctx.beginPath();
        ctx.moveTo(this.size * 0.35, 0);
        ctx.lineTo(this.size * 1.15, 0);
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = primary;
    ctx.globalAlpha = this.opacity * 0.75;
    ctx.fill();

    ctx.restore();
  }
}
