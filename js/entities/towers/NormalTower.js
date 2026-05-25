import { Tower } from './Tower.js';
import { drawTowerShadow, rgba } from '../../render/vectorArt.js';

export class NormalTower extends Tower {
  constructor(col, row, battleModifiers = {}) {
    super(col, row, 'normal', battleModifiers);
  }

  getEffectDescription() {
    return '发射普通子弹，造成稳定单体伤害。';
  }

  drawTower(ctx) {
    const r = this.radius;
    ctx.save();
    ctx.translate(this.x, this.y);

    drawTowerShadow(ctx, 0, 0, r);

    // ── 石头底座（八边形）──
    const baseR = r * 1.08;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const bx = Math.cos(a) * baseR;
      const by = Math.sin(a) * baseR;
      if (i === 0) ctx.moveTo(bx, by);
      else ctx.lineTo(bx, by);
    }
    ctx.closePath();
    const baseGrad = ctx.createLinearGradient(0, -baseR, 0, baseR);
    baseGrad.addColorStop(0, '#b0b8c8');
    baseGrad.addColorStop(0.5, '#7f8c8d');
    baseGrad.addColorStop(1, '#5d6d7e');
    ctx.fillStyle = baseGrad;
    ctx.fill();
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 底座石块线条纹路
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 0.8;
    for (const dy of [-r * 0.35, 0, r * 0.35]) {
      const hw = Math.sqrt(Math.max(0, (baseR * 0.9) ** 2 - dy * dy));
      ctx.beginPath();
      ctx.moveTo(-hw, dy);
      ctx.lineTo(hw, dy);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.moveTo(0, -baseR * 0.6);
    ctx.lineTo(0, baseR * 0.6);
    ctx.stroke();

    // 底座阴影槽
    ctx.beginPath();
    ctx.ellipse(0, baseR * 0.6, baseR * 0.75, baseR * 0.22, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    ctx.fill();

    // ── 顶部城垛（旋转跟随角度）──
    ctx.rotate(this.angle);
    const merlonH = r * 0.42;
    const merlonCount = 5;
    for (let i = 0; i < merlonCount; i++) {
      const a = (i / merlonCount) * Math.PI * 2;
      const mx = Math.cos(a) * r * 0.82;
      const my = Math.sin(a) * r * 0.82;
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.rect(-r * 0.13, -merlonH * 0.5, r * 0.26, merlonH);
      const mg = ctx.createLinearGradient(0, -merlonH * 0.5, 0, merlonH * 0.5);
      mg.addColorStop(0, '#c8d0d8');
      mg.addColorStop(1, '#8a9aaa');
      ctx.fillStyle = mg;
      ctx.fill();
      ctx.strokeStyle = '#5d6d7e';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // ── 炮台中心圆体 ──
    const bodyGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.28, r * 0.06, 0, 0, r * 0.78);
    bodyGrad.addColorStop(0, '#c0c8d0');
    bodyGrad.addColorStop(0.55, '#95a5a6');
    bodyGrad.addColorStop(1, '#5d6d7e');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 高光
    ctx.beginPath();
    ctx.ellipse(-r * 0.22, -r * 0.25, r * 0.2, r * 0.12, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();

    // ── 炮管（青铜色）──
    const bx = r * 0.22;
    const blen = r * 1.05;
    const bw = r * 0.38;
    const by = -bw / 2;
    const bGrad = ctx.createLinearGradient(0, by, 0, by + bw);
    bGrad.addColorStop(0, '#c6a55a');
    bGrad.addColorStop(0.4, '#a0814a');
    bGrad.addColorStop(1, '#5a3e22');
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, blen, bw, bw * 0.45);
    else ctx.rect(bx, by, blen, bw);
    ctx.fillStyle = bGrad;
    ctx.fill();
    ctx.strokeStyle = '#3d2b0f';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // 炮管高光
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(bx + 2, by + 2, blen * 0.55, bw * 0.3);
    // 炮管箍环
    for (const bx2 of [bx + blen * 0.3, bx + blen * 0.65]) {
      ctx.beginPath();
      ctx.rect(bx2, by - 1, blen * 0.07, bw + 2);
      ctx.fillStyle = 'rgba(60,40,15,0.45)';
      ctx.fill();
    }

    ctx.restore();
  }
}
