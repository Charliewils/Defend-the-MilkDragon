import { audioManager } from '../../audio/index.js';
import { Enemy } from './Enemy.js';

export class ArmorEnemy extends Enemy {
  constructor(options) {
    super({ ...options, typeId: 'armor' });
    this.immuneFxKind = null;
    this.immuneFxT = 0;
    this.armorFlashT = 0;
    this.auraBoostT = 0;
    this.auraPhase = Math.random() * Math.PI * 2;
  }

  ignoresWorldFreeze() {
    return true;
  }

  get hpRatio() {
    return this.maxHp > 0 ? this.hp / this.maxHp : 1;
  }

  get speed() {
    let mult = 1;
    const r = this.hpRatio;
    if (r <= 0.25) mult = 120 / 70;
    else if (r <= 0.5) mult = 100 / 70;
    return this.baseSpeed * mult * this.slowMultiplier;
  }

  triggerControlImmune(kind) {
    this.immuneFxKind = kind;
    this.immuneFxT = 0.38;
    this.armorFlashT = 0.2;
    this.auraBoostT = 0.35;
    audioManager.playSound('armor_immune');
  }

  applySlow(multiplier, duration) {
    if (!this.alive || this.isInvisible) return;
    this.triggerControlImmune('ice');
  }

  applyButterRoot(duration) {
    if (!this.alive || this.isInvisible) return;
    this.triggerControlImmune('butter');
  }

  onUpdate(dt) {
    this.auraPhase += dt * Math.PI * 2 * (this.hpRatio <= 0.5 ? 2 : 1);
    if (this.immuneFxT > 0) this.immuneFxT -= dt;
    if (this.armorFlashT > 0) this.armorFlashT -= dt;
    if (this.auraBoostT > 0) this.auraBoostT -= dt;
  }

  drawArmorRing(ctx, x, y) {
    const r = this.radius + 8;
    const n = 8;
    const boost = this.auraBoostT > 0 ? 0.45 + 0.55 * (this.auraBoostT / 0.35) : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.auraPhase);
    for (let i = 0; i < n; i += 1) {
      const ang = (i / n) * Math.PI * 2;
      const px = Math.cos(ang) * r;
      const py = Math.sin(ang) * r;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-this.auraPhase + ang);
      ctx.fillStyle = `rgba(241, 196, 15, ${0.55 * boost})`;
      ctx.strokeStyle = `rgba(255, 248, 220, ${0.65 * boost})`;
      ctx.lineWidth = 1;
      ctx.fillRect(-2.5, -2.5, 5, 5);
      ctx.strokeRect(-2.5, -2.5, 5, 5);
      ctx.restore();
    }
    ctx.restore();
  }

  drawBody(ctx, x, y) {
    const hurt = this.hpRatio <= 0.5;
    const crack = this.hpRatio <= 0.25;
    const flash = this.armorFlashT > 0 ? 0.35 * (this.armorFlashT / 0.2) : 0;

    this.drawArmorRing(ctx, x, y);

    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    const bodyGrad = ctx.createRadialGradient(x - 6, y - 6, 2, x, y, this.radius);
    bodyGrad.addColorStop(0, hurt ? '#7a3a3a' : '#6a6a6a');
    bodyGrad.addColorStop(1, hurt ? '#3d2020' : '#3a3a3a');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    const arcCount = 10;
    for (let i = 0; i < arcCount; i += 1) {
      const a0 = (i / arcCount) * Math.PI * 2 + this.progress * 4;
      const a1 = a0 + 0.35;
      ctx.beginPath();
      ctx.arc(x, y, this.radius - 2.5, a0, a1);
      ctx.strokeStyle = i % 2 === 0 ? (hurt ? '#c0392b' : '#555555') : (hurt ? '#e74c3c' : '#999999');
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }

    if (flash > 0) {
      ctx.beginPath();
      ctx.arc(x, y, this.radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 236, 160, ${flash})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    if (crack) {
      const flick = 0.45 + 0.55 * Math.sin(performance.now() * 0.012);
      for (let k = 0; k < 5; k += 1) {
        const ang = (k / 5) * Math.PI * 2 + this.progress * 6;
        ctx.strokeStyle = `rgba(192, 57, 43, ${flick * 0.85})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(ang) * (this.radius - 4), y + Math.sin(ang) * (this.radius - 4));
        ctx.lineTo(x + Math.cos(ang) * (this.radius + 2), y + Math.sin(ang) * (this.radius + 2));
        ctx.stroke();
      }
    }

    ctx.strokeStyle = 'rgba(200, 200, 210, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawFace(ctx, x, y) {
    ctx.fillStyle = '#c0392b';
    const ew = 5;
    const eh = 4;
    ctx.fillRect(x - 7 - ew / 2, y - 3 - eh / 2, ew, eh);
    ctx.fillRect(x + 7 - ew / 2, y - 3 - eh / 2, ew, eh);
    ctx.strokeStyle = '#2c0b0b';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 7 - ew / 2, y - 3 - eh / 2, ew, eh);
    ctx.strokeRect(x + 7 - ew / 2, y - 3 - eh / 2, ew, eh);
  }

  drawImmuneFx(ctx, x, y) {
    if (this.immuneFxT <= 0 || !this.immuneFxKind) return;
    const t = 1 - this.immuneFxT / 0.38;
    const alpha = 1 - t;
    const yLift = t * 18;
    ctx.save();
    ctx.translate(x, y - this.radius - 14 - yLift);
    const col = this.immuneFxKind === 'ice' ? '#85c1e9' : '#f4d03f';
    ctx.strokeStyle = col;
    ctx.fillStyle = `${col}33`;
    ctx.lineWidth = 2.5;
    if (this.immuneFxKind === 'ice') {
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const ang = (Math.PI / 3) * i - Math.PI / 6;
        const px = Math.cos(ang) * 7;
        const py = Math.sin(ang) * 7;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(231, 76, 60, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8 * t, -8 * t);
    ctx.lineTo(8 * t, 8 * t);
    ctx.moveTo(8 * t, -8 * t);
    ctx.lineTo(-8 * t, 8 * t);
    ctx.stroke();
    ctx.restore();
  }

  draw(ctx) {
    if (!this.alive && !this.reachedEnd) return;
    const { x, y } = this.position;
    this.drawSlowTrail(ctx);
    this.drawBody(ctx, x, y);
    this.drawFace(ctx, x, y);
    this.drawBurnFlames(ctx, x, y);
    this.drawImmuneFx(ctx, x, y);
    this.drawButterRootOverlay(ctx, x, y);
    this.drawButterRootStar(ctx, x, y);
    this.drawHealthBar(ctx, x, y);
  }
}
