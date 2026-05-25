import { Enemy } from './Enemy.js';
import { drawGroundShadow } from '../../render/vectorArt.js';

export class NormalEnemy extends Enemy {
  constructor(options) {
    super({ ...options, typeId: 'normal' });
  }

  drawBody(ctx, x, y) {
    const r = this.radius;
    const sl = this.isSlowed;

    drawGroundShadow(ctx, x, y, r, 0.25);

    // 小犄角
    const hornCol = sl ? '#1a5276' : '#7b241c';
    ctx.fillStyle = hornCol;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + s * r * 0.3, y - r * 0.72);
      ctx.lineTo(x + s * r * 0.48, y - r * 1.18);
      ctx.lineTo(x + s * r * 0.58, y - r * 0.62);
      ctx.closePath();
      ctx.fill();
    }

    // 主体（椭圆，底部略宽）
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.08, x, y + 2, r);
    if (sl) {
      grad.addColorStop(0, '#aed6f1');
      grad.addColorStop(0.55, '#5dade2');
      grad.addColorStop(1, '#1a5276');
    } else {
      grad.addColorStop(0, '#ff8a7a');
      grad.addColorStop(0.5, '#e74c3c');
      grad.addColorStop(1, '#8e1a1a');
    }
    ctx.beginPath();
    ctx.ellipse(x, y + 1, r * 0.93, r, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = sl ? '#1a5276' : '#6b1515';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 高光
    ctx.beginPath();
    ctx.ellipse(x - r * 0.28, y - r * 0.3, r * 0.24, r * 0.15, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.48)';
    ctx.fill();
  }

  drawFace(ctx, x, y) {
    const r = this.radius;

    // 眼白
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x - 5, y - 1.5, 3.8, 3.2, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 5, y - 1.5, 3.8, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 瞳孔
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(x - 4.8, y - 1.5, 2.1, 0, Math.PI * 2);
    ctx.arc(x + 5.2, y - 1.5, 2.1, 0, Math.PI * 2);
    ctx.fill();

    // 眼神高光
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(x - 5.8, y - 2.5, 0.9, 0, Math.PI * 2);
    ctx.arc(x + 4.2, y - 2.5, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // 愤怒眉毛
    ctx.strokeStyle = '#6b1515';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 9, y - 6.5);
    ctx.lineTo(x - 1.5, y - 4);
    ctx.moveTo(x + 9, y - 6.5);
    ctx.lineTo(x + 1.5, y - 4);
    ctx.stroke();

    // 嘴巴（张口露牙）
    ctx.fillStyle = '#5a0e0e';
    ctx.beginPath();
    ctx.arc(x, y + 5.5, 4.5, 0.08 * Math.PI, 0.92 * Math.PI);
    ctx.fill();

    // 两颗獠牙
    ctx.fillStyle = '#fff8f0';
    ctx.beginPath();
    ctx.moveTo(x - 3.5, y + 5.5);
    ctx.lineTo(x - 2.5, y + 9);
    ctx.lineTo(x - 1, y + 5.5);
    ctx.closePath();
    ctx.moveTo(x + 1, y + 5.5);
    ctx.lineTo(x + 2.5, y + 9);
    ctx.lineTo(x + 3.5, y + 5.5);
    ctx.closePath();
    ctx.fill();
  }
}
