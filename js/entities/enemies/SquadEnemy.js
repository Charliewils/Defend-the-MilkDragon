import { Enemy } from './Enemy.js';
import { drawGroundShadow, rgba } from '../../render/vectorArt.js';

export class SquadEnemy extends Enemy {
  constructor(options) {
    super({
      ...options,
      typeId: 'squad',
      squadIndex: options.squadIndex ?? 1,
      isLeader: Boolean(options.isLeader)
    });
  }

  drawBody(ctx, x, y) {
    const r = this.radius;
    const sl = this.isSlowed;

    drawGroundShadow(ctx, x, y, r, 0.22);

    // 触角
    const antennaCol = sl ? '#1a5276' : '#145a32';
    ctx.strokeStyle = antennaCol;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + s * r * 0.22, y - r * 0.82);
      ctx.bezierCurveTo(
        x + s * r * 0.35, y - r * 1.25,
        x + s * r * 0.55, y - r * 1.35,
        x + s * r * 0.52, y - r * 1.55
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + s * r * 0.52, y - r * 1.58, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = this.isLeader ? '#f1c40f' : antennaCol;
      ctx.fill();
    }
    ctx.lineCap = 'butt';

    // 六边形甲壳身体
    const hexR = r * 0.95;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const hx = x + Math.cos(a) * hexR;
      const hy = y + Math.sin(a) * hexR;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();

    const grad = ctx.createRadialGradient(x - r * 0.28, y - r * 0.3, r * 0.08, x, y, r);
    if (sl) {
      grad.addColorStop(0, '#aed6f1');
      grad.addColorStop(0.55, '#5dade2');
      grad.addColorStop(1, '#1a5276');
    } else {
      grad.addColorStop(0, '#58d68d');
      grad.addColorStop(0.5, '#27ae60');
      grad.addColorStop(1, '#145a32');
    }
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = sl ? '#1a5276' : '#0e4024';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 甲壳纹路（水平线）
    ctx.strokeStyle = sl ? 'rgba(26,82,118,0.45)' : 'rgba(14,64,36,0.45)';
    ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i++) {
      const lineY = y + i * r * 0.32;
      const hw = Math.sqrt(Math.max(0, r * r - (lineY - y) * (lineY - y))) * 0.9;
      ctx.beginPath();
      ctx.moveTo(x - hw, lineY);
      ctx.lineTo(x + hw, lineY);
      ctx.stroke();
    }

    // 高光
    ctx.beginPath();
    ctx.ellipse(x - r * 0.25, y - r * 0.3, r * 0.2, r * 0.12, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.fill();
  }

  drawFace(ctx, x, y) {
    const r = this.radius;

    // 队长徽章（金色方形）
    if (this.isLeader) {
      ctx.fillStyle = '#f1c40f';
      ctx.strokeStyle = '#d4a017';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x - 4, y - r - 12, 8, 7, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7d5200';
      ctx.font = 'bold 6px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', x, y - r - 8.5);
    }

    // 队伍编号
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${r < 11 ? 8 : 9}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(this.squadIndex), x, y + 1);

    // 复眼（两个小点）
    ctx.fillStyle = '#145a32';
    ctx.beginPath();
    ctx.arc(x - 4, y - r * 0.55, 2, 0, Math.PI * 2);
    ctx.arc(x + 4, y - r * 0.55, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(x - 4.6, y - r * 0.6, 0.7, 0, Math.PI * 2);
    ctx.arc(x + 3.4, y - r * 0.6, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
}
