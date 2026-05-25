import { Enemy } from './Enemy.js';
import { drawWings, drawCrown, drawHorns, drawGlowRing, rgba } from '../../render/vectorArt.js';

export class BossEnemy extends Enemy {
  constructor(options) {
    super({ ...options, typeId: 'boss' });
    this.normalBaseSpeed = this.baseSpeed;
    this.rageActive = false;
    this.pulseTimer = 0;
    this._auraPhase = 0;
  }

  onUpdate(dt) {
    this.rageActive = this.hp / this.maxHp <= 0.5;
    this._auraPhase += dt * (this.rageActive ? 5 : 2.5);
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
    const r = this.radius;
    const sl = this.isSlowed;
    const rage = this.rageActive;
    const hp = this.hp / this.maxHp;

    // ── 翅膀（在身体后方绘制）──
    if (!sl) {
      drawWings(ctx, x, y, r, rage ? '#7f0000' : '#4a0e0e', rage ? 0.7 : 0.5);
    }

    // ── 愤怒脉冲光环 ──
    if (rage) {
      const pulse = 0.38 + Math.sin(this.pulseTimer) * 0.18;
      drawGlowRing(ctx, x, y, r + 10, '#e74c3c', pulse, 12);
    }

    // ── 地面阴影 ──
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.9, r * 1.2, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();

    // ── 犄角（身体之前绘制让其叠在身上） ──
    if (!sl) {
      drawHorns(ctx, x, y, r, rage ? '#8b0000' : '#4a0e0e', rage ? '#ff2222' : '#7a1a1a');
    }

    // ── 主体 ──
    const bodyGrad = ctx.createRadialGradient(x - r * 0.32, y - r * 0.35, r * 0.08, x, y, r);
    if (sl) {
      bodyGrad.addColorStop(0, '#aed6f1');
      bodyGrad.addColorStop(0.5, '#5dade2');
      bodyGrad.addColorStop(1, '#1a5276');
    } else if (rage) {
      bodyGrad.addColorStop(0, '#ff5252');
      bodyGrad.addColorStop(0.45, '#c0392b');
      bodyGrad.addColorStop(1, '#3d0000');
    } else {
      bodyGrad.addColorStop(0, '#e05252');
      bodyGrad.addColorStop(0.45, '#922b21');
      bodyGrad.addColorStop(1, '#3d0e0e');
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = sl ? '#1a5276' : (rage ? '#ff2222' : '#4a0e0e');
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // ── 鳞片纹路 ──
    if (!sl) {
      const scaleAlpha = rage ? 0.25 : 0.18;
      ctx.strokeStyle = `rgba(${rage ? '255,80,80' : '200,60,60'}, ${scaleAlpha})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + this._auraPhase * 0.1;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * r * 0.35, y + Math.sin(a) * r * 0.35, r * 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // ── 高光 ──
    ctx.beginPath();
    ctx.ellipse(x - r * 0.3, y - r * 0.32, r * 0.25, r * 0.16, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();

    // ── 王冠 ──
    if (!sl) {
      drawCrown(ctx, x, y, r, rage ? '#ffd700' : '#f1c40f', rage ? '#ff8c00' : '#d4a017');
      // 王冠宝石
      ctx.beginPath();
      ctx.arc(x, y - r - 2, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = rage ? '#ff4444' : '#e74c3c';
      ctx.fill();
    }
  }

  drawFace(ctx, x, y) {
    const r = this.radius;
    const rage = this.rageActive;

    // 眼白
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x - r * 0.32, y - r * 0.08, r * 0.24, r * 0.2, 0, 0, Math.PI * 2);
    ctx.ellipse(x + r * 0.32, y - r * 0.08, r * 0.24, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 发光瞳孔
    const eyeColor = rage ? '#ff2222' : '#cc0000';
    const eyeGrad1 = ctx.createRadialGradient(x - r * 0.32, y - r * 0.08, 0, x - r * 0.32, y - r * 0.08, r * 0.2);
    eyeGrad1.addColorStop(0, '#ff8888');
    eyeGrad1.addColorStop(0.5, eyeColor);
    eyeGrad1.addColorStop(1, '#1a0000');
    ctx.fillStyle = eyeGrad1;
    ctx.beginPath();
    ctx.arc(x - r * 0.32, y - r * 0.08, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    const eyeGrad2 = ctx.createRadialGradient(x + r * 0.32, y - r * 0.08, 0, x + r * 0.32, y - r * 0.08, r * 0.2);
    eyeGrad2.addColorStop(0, '#ff8888');
    eyeGrad2.addColorStop(0.5, eyeColor);
    eyeGrad2.addColorStop(1, '#1a0000');
    ctx.fillStyle = eyeGrad2;
    ctx.beginPath();
    ctx.arc(x + r * 0.32, y - r * 0.08, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // 眼神高光
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(x - r * 0.38, y - r * 0.16, r * 0.055, 0, Math.PI * 2);
    ctx.arc(x + r * 0.26, y - r * 0.16, r * 0.055, 0, Math.PI * 2);
    ctx.fill();

    // 愤怒眉
    ctx.strokeStyle = rage ? '#ff2222' : '#7a0000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - r * 0.55, y - r * 0.3);
    ctx.lineTo(x - r * 0.1, y - r * 0.05);
    ctx.moveTo(x + r * 0.55, y - r * 0.3);
    ctx.lineTo(x + r * 0.1, y - r * 0.05);
    ctx.stroke();

    // 嘴巴（大口露牙）
    ctx.fillStyle = '#3d0000';
    ctx.beginPath();
    ctx.arc(x, y + r * 0.32, r * 0.35, 0.05 * Math.PI, 0.95 * Math.PI);
    ctx.fill();

    // 獠牙
    ctx.fillStyle = '#fffbf0';
    ctx.beginPath();
    const toothW = r * 0.1;
    const toothH = r * 0.22;
    const toothY = y + r * 0.32;
    for (const tx of [-r * 0.22, -r * 0.07, r * 0.07, r * 0.22]) {
      ctx.moveTo(tx - toothW, toothY);
      ctx.lineTo(tx, toothY + toothH);
      ctx.lineTo(tx + toothW, toothY);
    }
    ctx.fill();
  }
}
