import { Enemy } from './Enemy.js';
import { drawGroundShadow, rgba } from '../../render/vectorArt.js';

export class RushEnemy extends Enemy {
  constructor(options) {
    super({ ...options, typeId: 'rush' });
    this.normalBaseSpeed = this.baseSpeed;
    this.rushActive = false;
    this.rushGhosts = [];
    this._flamePhase = Math.random() * Math.PI * 2;
  }

  get speed() {
    if (this.rushActive) return 160 * this.slowMultiplier;
    return this.normalBaseSpeed * this.slowMultiplier;
  }

  onUpdate(dt) {
    const wasRush = this.rushActive;
    this.rushActive = !this.isSlowed && this.hp / this.maxHp <= 0.5;
    this._flamePhase = (this._flamePhase + dt * 8) % (Math.PI * 2);

    if (this.rushActive) {
      const { x, y } = this.position;
      this.rushGhosts.push({ x, y, life: 0.22 });
    }
    this.rushGhosts = this.rushGhosts
      .map((g) => ({ ...g, life: g.life - dt }))
      .filter((g) => g.life > 0);

    if (this.rushActive && !wasRush) this.rushGhosts = [];
  }

  onSlowApplied() {
    this.rushActive = false;
  }

  drawBody(ctx, x, y) {
    const r = this.radius;
    const sl = this.isSlowed;
    const rushing = this.rushActive && !sl;

    // 残影
    for (const g of this.rushGhosts) {
      ctx.beginPath();
      ctx.ellipse(g.x, g.y, r * 0.88, r * 1.05, 0, 0, Math.PI * 2);
      const a = 0.32 * (g.life / 0.22);
      ctx.fillStyle = `rgba(255, 100, 30, ${a})`;
      ctx.fill();
    }

    drawGroundShadow(ctx, x, y, r, 0.2);

    if (rushing) {
      // 火焰光晕
      const aGrad = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 1.8);
      aGrad.addColorStop(0, 'rgba(255, 140, 30, 0.38)');
      aGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
      ctx.beginPath();
      ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = aGrad;
      ctx.fill();

      // 火焰舌（上方）
      const fp = this._flamePhase;
      for (let i = 0; i < 5; i++) {
        const ang = (-Math.PI / 2) + (i - 2) * 0.35 + Math.sin(fp + i) * 0.15;
        const flen = r * (0.7 + 0.4 * Math.sin(fp * 1.3 + i));
        const fx = x + Math.cos(ang) * flen;
        const fy = y + Math.sin(ang) * flen;
        ctx.beginPath();
        ctx.arc(fx, fy, r * 0.22, 0, Math.PI * 2);
        const fc = `rgba(255,${Math.floor(100 + 80 * Math.sin(fp + i))},0,${0.65 - i * 0.08})`;
        ctx.fillStyle = fc;
        ctx.fill();
      }
    }

    // 主体
    const baseCol = sl ? '#5dade2' : (rushing ? '#ff5252' : '#f39c12');
    const lightCol = sl ? '#aed6f1' : (rushing ? '#ff8a80' : '#ffd180');
    const darkCol = sl ? '#1a5276' : (rushing ? '#b71c1c' : '#d35400');

    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    grad.addColorStop(0, lightCol);
    grad.addColorStop(0.55, baseCol);
    grad.addColorStop(1, darkCol);

    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.9, r * (rushing ? 1.12 : 1), 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = sl ? '#1a5276' : (rushing ? '#7f0000' : '#c0392b');
    ctx.lineWidth = 2;
    ctx.stroke();

    // 高光
    ctx.beginPath();
    ctx.ellipse(x - r * 0.28, y - r * 0.32, r * 0.22, r * 0.14, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.fill();
  }

  drawFace(ctx, x, y) {
    const r = this.radius;
    const rushing = this.rushActive && !this.isSlowed;

    // 眼睛
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x - 5, y - 2, rushing ? 4 : 3.5, rushing ? 2.8 : 3.2, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 5, y - 2, rushing ? 4 : 3.5, rushing ? 2.8 : 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(x - 5, y - 2, 2, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(x - 6, y - 3, 0.8, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 3, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = rushing ? '#7f0000' : '#c0392b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (rushing) {
      // 狂怒眉
      ctx.moveTo(x - 9, y - 7);
      ctx.lineTo(x - 1, y - 3.5);
      ctx.moveTo(x + 9, y - 7);
      ctx.lineTo(x + 1, y - 3.5);
    } else {
      // 担忧眉
      ctx.moveTo(x - 9, y - 4);
      ctx.lineTo(x - 1, y - 6.5);
      ctx.moveTo(x + 9, y - 4);
      ctx.lineTo(x + 1, y - 6.5);
    }
    ctx.stroke();

    // 嘴巴
    ctx.strokeStyle = '#5a0e0e';
    ctx.lineWidth = 1.8;
    if (rushing) {
      ctx.beginPath();
      ctx.moveTo(x - 5, y + 5);
      ctx.lineTo(x - 2, y + 7);
      ctx.lineTo(x + 2, y + 7);
      ctx.lineTo(x + 5, y + 5);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y + 2, 4, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }

    if (rushing) {
      // 速度线
      ctx.strokeStyle = 'rgba(255,230,150,0.8)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const sy = y - 5 + i * 5;
        ctx.beginPath();
        ctx.moveTo(x - r - 4 - i * 2, sy);
        ctx.lineTo(x - r - 14 - i * 2, sy);
        ctx.stroke();
      }
      ctx.lineCap = 'butt';
    }
  }
}
