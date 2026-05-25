import { Enemy } from './Enemy.js';
import { rgba } from '../../render/vectorArt.js';

const CYCLE = 4;
const VISIBLE_TIME = 2;
const FADE_TIME = 0.3;

export class StealthEnemy extends Enemy {
  constructor(options) {
    super({ ...options, typeId: 'stealth' });
    this.cycleTimer = 0;
    this.visibility = 1;
    this.targetVisibility = 1;
    this._sparkles = [];
    this._sparkTimer = 0;
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

    this._sparkTimer -= dt;
    if (this._sparkTimer <= 0) {
      this._sparkTimer = 0.12 + Math.random() * 0.1;
      if (this.isInvisible || this.visibility < 0.6) {
        const { x, y } = this.position;
        const ang = Math.random() * Math.PI * 2;
        const dist = this.radius * (0.7 + Math.random() * 0.6);
        this._sparkles.push({
          x: x + Math.cos(ang) * dist,
          y: y + Math.sin(ang) * dist,
          life: 0.35 + Math.random() * 0.2,
          maxLife: 0.35 + Math.random() * 0.2
        });
      }
    }
    this._sparkles = this._sparkles
      .map((s) => ({ ...s, life: s.life - dt }))
      .filter((s) => s.life > 0);
  }

  applySlow(multiplier, duration) {
    if (this.isInvisible) return;
    super.applySlow(multiplier, duration);
  }

  draw(ctx) {
    if (!this.alive && !this.reachedEnd) return;
    const { x, y } = this.position;
    const r = this.radius;

    ctx.save();
    ctx.globalAlpha = this.visibility;

    this.drawSlowTrail(ctx);

    // 幽灵闪烁粒子
    for (const sp of this._sparkles) {
      const t = sp.life / sp.maxLife;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 1.5 * t, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(187, 143, 206, ${0.8 * t})`;
      ctx.fill();
    }

    // 当隐身时显示虚线轮廓提示
    if (this.isInvisible) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(187, 143, 206, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, r + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    this._drawGhostBody(ctx, x, y, r);
    this._drawGhostFace(ctx, x, y, r);
    this.drawBurnFlames(ctx, x, y);
    this.drawButterRootOverlay(ctx, x, y);
    this.drawButterRootStar(ctx, x, y);
    this.drawHealthBar(ctx, x, y);

    ctx.restore();
  }

  _drawGhostBody(ctx, x, y, r) {
    const sl = this.isSlowed;
    // 地面阴影（半透明）
    ctx.save();
    ctx.globalAlpha *= 0.35;
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.85, r * 1.1, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();
    ctx.restore();

    // 外发光
    const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 1.5);
    glow.addColorStop(0, sl ? 'rgba(93,173,226,0.28)' : 'rgba(142,68,173,0.28)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // 幽灵身体（顶部圆形，底部波浪飘荡）
    const waveAmp = r * 0.28;
    const waveCount = 3;
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI, 0);
    // 底部波浪边缘
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = x + r - t * 2 * r;
      const phase = t * Math.PI * 2 * waveCount + this.cycleTimer * 3;
      const by = y + r * 0.15 + Math.sin(phase) * waveAmp;
      ctx.lineTo(bx, by);
    }
    ctx.closePath();

    const bodyGrad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.28, r * 0.08, x, y, r);
    if (sl) {
      bodyGrad.addColorStop(0, '#aed6f1');
      bodyGrad.addColorStop(0.55, '#5dade2');
      bodyGrad.addColorStop(1, '#1a5276');
    } else {
      bodyGrad.addColorStop(0, '#d2b4de');
      bodyGrad.addColorStop(0.5, '#8e44ad');
      bodyGrad.addColorStop(1, '#4a235a');
    }
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = sl ? '#2471a3' : '#6c3483';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 高光
    ctx.beginPath();
    ctx.ellipse(x - r * 0.28, y - r * 0.32, r * 0.22, r * 0.14, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.fill();
  }

  _drawGhostFace(ctx, x, y, r) {
    // 大眼睛（幽灵特色）
    const eyeR = r * 0.32;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x - r * 0.38, y - r * 0.1, eyeR * 1.05, eyeR, 0, 0, Math.PI * 2);
    ctx.ellipse(x + r * 0.38, y - r * 0.1, eyeR * 1.05, eyeR, 0, 0, Math.PI * 2);
    ctx.fill();

    // 发光瞳孔（紫色）
    const pupilGrad1 = ctx.createRadialGradient(x - r * 0.38, y - r * 0.1, 0, x - r * 0.38, y - r * 0.1, eyeR * 0.65);
    pupilGrad1.addColorStop(0, '#d7bde2');
    pupilGrad1.addColorStop(0.5, '#8e44ad');
    pupilGrad1.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = pupilGrad1;
    ctx.beginPath();
    ctx.arc(x - r * 0.38, y - r * 0.1, eyeR * 0.62, 0, Math.PI * 2);
    ctx.fill();

    const pupilGrad2 = ctx.createRadialGradient(x + r * 0.38, y - r * 0.1, 0, x + r * 0.38, y - r * 0.1, eyeR * 0.65);
    pupilGrad2.addColorStop(0, '#d7bde2');
    pupilGrad2.addColorStop(0.5, '#8e44ad');
    pupilGrad2.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = pupilGrad2;
    ctx.beginPath();
    ctx.arc(x + r * 0.38, y - r * 0.1, eyeR * 0.62, 0, Math.PI * 2);
    ctx.fill();

    // 眼神高光
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(x - r * 0.44, y - r * 0.18, eyeR * 0.18, 0, Math.PI * 2);
    ctx.arc(x + r * 0.32, y - r * 0.18, eyeR * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // 嘴巴（O形）
    ctx.strokeStyle = '#6c3483';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y + r * 0.38, r * 0.2, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawBody(ctx, x, y) {}
  drawFace(ctx, x, y) {}
}
