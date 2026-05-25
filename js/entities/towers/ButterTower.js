import { createTowerBullet } from '../Bullet.js';
import { MuzzleFlash } from '../MuzzleFlash.js';
import { playTowerShootSound } from '../../audio/combatSounds.js';
import { Tower } from './Tower.js';
import { drawTowerShadow, rgba } from '../../render/vectorArt.js';

export class ButterTower extends Tower {
  constructor(col, row, battleModifiers = {}) {
    super(col, row, 'butter', battleModifiers);
    this.muzzleDripRemaining = 0;
    this._swishPhase = Math.random() * Math.PI * 2;
  }

  get damage() {
    const mult = 1 + 0.15 * (this.level - 1);
    return Math.round(this.config.damage * mult);
  }

  getRootChance() {
    return [0.35, 0.45, 0.55][this.level - 1] ?? 0.35;
  }

  getRootDuration() {
    return [1.5, 1.8, 2.2][this.level - 1] ?? 1.5;
  }

  getEffectDescription() {
    if (this.level >= 3) return '55%概率定身2.2秒，伤害+30%，命中附带40px范围30%减速2秒。';
    if (this.level >= 2) return '45%概率定身1.8秒，伤害+15%。';
    return '35%概率定身1.5秒。';
  }

  update(dt, enemies, bullets, muzzleFlashes, damageNumbers) {
    this._swishPhase = (this._swishPhase + dt * 1.8) % (Math.PI * 2);
    if (this.muzzleDripRemaining > 0) {
      this.muzzleDripRemaining = Math.max(0, this.muzzleDripRemaining - dt);
    }
    super.update(dt, enemies, bullets, muzzleFlashes, damageNumbers);
  }

  shoot(targets, bullets, muzzleFlashes, damageNumbers) {
    this.muzzleDripRemaining = 0.22;
    for (const target of targets) {
      bullets.push(this.createBullet(target, damageNumbers));
    }
    for (const target of targets) {
      const aim = Math.atan2(target.position.y - this.y, target.position.x - this.x);
      const mx = this.x + Math.cos(aim) * (this.radius + 8);
      const my = this.y + Math.sin(aim) * (this.radius + 8);
      muzzleFlashes.push(MuzzleFlash.fromTower(this, mx, my, aim));
    }
    playTowerShootSound(this.typeId);
  }

  createBullet(target, damageNumbers) {
    const muzzle = this.getMuzzlePoint();
    return createTowerBullet('butter', muzzle.x, muzzle.y, target, {
      damage: this.damage,
      bulletSpeed: this.config.bulletSpeed,
      bulletColor: this.config.bulletColor,
      tower: this,
      damageNumbers
    });
  }

  drawTower(ctx) {
    const r = this.radius;
    ctx.save();
    ctx.translate(this.x, this.y);

    drawTowerShadow(ctx, 0, 0, r);

    // ── 黄金蜂蜜光晕 ──
    const glowAmp = 0.25 + 0.1 * Math.sin(this._swishPhase);
    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 1.5);
    glowGrad.addColorStop(0, `rgba(255, 220, 80, ${glowAmp})`);
    glowGrad.addColorStop(1, 'rgba(180, 120, 0, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    ctx.rotate(this.angle);

    // ── 大锅底座（扁圆形） ──
    const potW = r * 1.1;
    const potH = r * 0.72;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.15, potW, potH, 0, 0, Math.PI * 2);
    const potGrad = ctx.createLinearGradient(-potW, 0, potW, 0);
    potGrad.addColorStop(0, '#d4a017');
    potGrad.addColorStop(0.3, '#f0b429');
    potGrad.addColorStop(0.7, '#e8a800');
    potGrad.addColorStop(1, '#a07800');
    ctx.fillStyle = potGrad;
    ctx.fill();
    ctx.strokeStyle = '#7a5800';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ── 锅沿 ──
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.18, r * 1.05, r * 0.28, 0, 0, Math.PI * 2);
    const rimGrad = ctx.createLinearGradient(0, -r * 0.45, 0, r * 0.1);
    rimGrad.addColorStop(0, '#ffe566');
    rimGrad.addColorStop(1, '#c8920a');
    ctx.fillStyle = rimGrad;
    ctx.fill();
    ctx.strokeStyle = '#7a5800';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── 锅内黄油旋涡 ──
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.18, r * 0.95, r * 0.22, 0, 0, Math.PI * 2);
    ctx.clip();
    // 黄油颜色背景
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.18, r * 0.95, r * 0.22, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe090';
    ctx.fill();
    // 旋涡条纹
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + this._swishPhase;
      ctx.beginPath();
      ctx.arc(r * 0.35 * Math.cos(ang), -r * 0.18 + r * 0.08 * Math.sin(ang), r * 0.38, ang, ang + Math.PI * 0.9);
      ctx.strokeStyle = `rgba(200, 140, 30, 0.55)`;
      ctx.lineWidth = r * 0.12;
      ctx.stroke();
    }
    ctx.restore();

    // ── 锅耳（两侧） ──
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(s * r * 1.0, -r * 0.08, r * 0.2, Math.PI * (s < 0 ? 0.5 : -0.5), Math.PI * (s < 0 ? 1.5 : 0.5));
      ctx.strokeStyle = '#c8920a';
      ctx.lineWidth = r * 0.22;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.lineCap = 'butt';
    }

    // ── 奶油炮管 ──
    const blen = r * 1.08;
    const bw = r * 0.38;
    const bx = r * 0.28;
    const by = -bw / 2;
    const bGrad = ctx.createLinearGradient(0, by, 0, by + bw);
    bGrad.addColorStop(0, '#fff5b0');
    bGrad.addColorStop(0.5, '#e8b800');
    bGrad.addColorStop(1, '#9a6800');
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, blen, bw, bw * 0.42);
    else ctx.rect(bx, by, blen, bw);
    ctx.fillStyle = bGrad;
    ctx.fill();
    ctx.strokeStyle = '#7a5800';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,200,0.38)';
    ctx.fillRect(bx + 2, by + 2, blen * 0.5, bw * 0.28);

    // ── 奶油滴落动效 ──
    if (this.muzzleDripRemaining > 0) {
      const p = 1 - this.muzzleDripRemaining / 0.22;
      const fy = 4 + p * 18;
      const dripAlpha = 0.9 * (1 - p * 0.4);
      const dripGrad = ctx.createLinearGradient(bx + blen, fy - 4, bx + blen, fy + p * 12);
      dripGrad.addColorStop(0, `rgba(255,240,100,${dripAlpha})`);
      dripGrad.addColorStop(1, `rgba(220,160,20,${dripAlpha * 0.4})`);
      ctx.beginPath();
      ctx.ellipse(bx + blen, fy, 3.5 * (1 - p * 0.2), 4 + p * 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = dripGrad;
      ctx.fill();
    }

    ctx.restore();
  }
}
