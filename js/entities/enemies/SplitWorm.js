import { audioManager } from '../../audio/index.js';
import { getPathTotalLength, positionOnPath } from '../../map/grid.js';
import { spawnDamageNumber } from '../../systems/damageNumbers.js';
import { Particle } from '../Particle.js';
import { Enemy } from './Enemy.js';

const HISTORY_MAX = 90;

function copyPersistentEffectsTo(parent, child) {
  child.burnTimer = parent.burnTimer;
  child.burnDamagePerTick = parent.burnDamagePerTick;
  child.burnTickTimer = parent.burnTickTimer;
  child.burnTickInterval = parent.burnTickInterval;
  child.burnFlashTimer = parent.burnFlashTimer;
  child.slowMultiplier = parent.slowMultiplier;
  child.slowTimer = parent.slowTimer;
  child.isSlowed = parent.isSlowed;
  child.slowTrail = [...parent.slowTrail.map((p) => ({ ...p }))];
  child.butterRootTimer = parent.butterRootTimer;
  child.butterSlipTimer = parent.butterSlipTimer;
  child.butterGooPhase = parent.butterGooPhase;
}

export class SplitWorm extends Enemy {
  constructor(options) {
    const tid = options.typeId === 'mini_split_worm' ? 'mini_split_worm' : 'split_worm';
    super({ ...options, typeId: tid });
    this.isMiniSplit = tid === 'mini_split_worm';
    this.history = [];
    this.splitAnimT = 0;
    this.splitPopOffset = 0;
    this.hurtJiggleT = 0;
    this._splitBurstDone = false;
    this.segmentDelays = this.isMiniSplit ? [0, 7] : [0, 6, 13, 20];
    this.headRadius = this.isMiniSplit ? 10 : 16;
  }

  get position() {
    return positionOnPath(this.progress);
  }

  takeDamage(damageNumbers, amount, options = {}) {
    if (this.splitAnimT > 0) return 0;
    const dealt = super.takeDamage(damageNumbers, amount, options);
    if (!this.isMiniSplit && this.hp <= 0 && this.alive === false) {
      this.alive = true;
      this.splitAnimT = 0.52;
      this.splitPopOffset = 0;
      this._splitBurstDone = false;
    }
    if (this.isMiniSplit && dealt > 0) {
      this.hurtJiggleT = 0.15;
    }
    if (!this.isMiniSplit && dealt > 0 && this.hp > 0) {
      this.hurtJiggleT = 0.15;
    }
    return dealt;
  }

  canBeTargeted() {
    return super.canBeTargeted() && this.splitAnimT <= 0;
  }

  update(dt, damageNumbers = null, env = {}) {
    if (!this.alive) return;

    if (this.splitAnimT > 0) {
      this.splitAnimT -= dt;
      this.splitPopOffset += dt * 2.4;
      this.updateStatusTimers(dt);
      this.updateBurn(dt, damageNumbers);
      if (!this._splitBurstDone && this.splitAnimT < 0.45) {
        this._splitBurstDone = true;
        audioManager.playSound('worm_split');
      }
      if (this.splitAnimT <= 0) {
        this.alive = false;
      }
      return;
    }

    super.update(dt, damageNumbers, env);
    if (!this.alive || env.worldFrozen) return;

    const { x, y } = this.position;
    this.history.unshift({ x, y, pr: this.progress });
    if (this.history.length > HISTORY_MAX) {
      this.history.length = HISTORY_MAX;
    }
    if (this.hurtJiggleT > 0) this.hurtJiggleT -= dt;
  }

  getSegmentPos(delayIdx) {
    const idx = Math.min(this.history.length - 1, delayIdx);
    if (idx < 0 || !this.history[idx]) return this.position;
    return { x: this.history[idx].x, y: this.history[idx].y };
  }

  shouldSplitOnDeath() {
    return !this.isMiniSplit;
  }

  createSplitChildren() {
    const { wave, mode, progress } = this;
    const a = new SplitWorm({
      wave,
      mode,
      typeId: 'mini_split_worm',
      progress: Math.max(0.002, progress - 0.012)
    });
    const b = new SplitWorm({
      wave,
      mode,
      typeId: 'mini_split_worm',
      progress: Math.min(0.998, progress + 0.012)
    });
    copyPersistentEffectsTo(this, a);
    copyPersistentEffectsTo(this, b);
    return [a, b];
  }

  onDeath() {
    return { explosionScale: 1.25, wormGreenBurst: true };
  }

  drawWormBody(ctx, splitShift = 0) {
    const delays = this.segmentDelays;
    const ratio = this.hp / this.maxHp;
    const hurt = ratio <= 0.5;
    const pulse = ratio <= 0.25 ? 0.5 + 0.5 * Math.sin(performance.now() * 0.01) : 1;
    const jiggle = this.hurtJiggleT > 0 ? Math.sin(this.hurtJiggleT * 40) * 2.5 : 0;
    const gapBroken = this.hurtJiggleT > 0;

    const greens = this.isMiniSplit
      ? ['#58d68d', '#45b369']
      : ['#2d6a2d', '#348834', '#3d9c3d', '#4caf50'];

    const positions = delays.map((d) => this.getSegmentPos(d));
    if (splitShift > 0) {
      const mid = Math.floor(positions.length / 2);
      for (let i = 0; i < positions.length; i += 1) {
        const dir = i <= mid ? -1 : 1;
        positions[i] = {
          x: positions[i].x + dir * splitShift * (8 + i * 3),
          y: positions[i].y + Math.sin(splitShift + i) * 3
        };
      }
    }

    for (let i = positions.length - 1; i >= 1; i -= 1) {
      const p0 = positions[i];
      const p1 = positions[i - 1];
      ctx.strokeStyle = hurt
        ? `rgba(192, 57, 43, ${0.55 + (ratio <= 0.25 ? 0.35 * pulse : 0)})`
        : 'rgba(20, 60, 25, 0.55)';
      ctx.lineWidth = gapBroken ? 1 + jiggle * 0.08 : 1.5;
      if (!gapBroken || (i + Math.floor(performance.now() * 0.02)) % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }

    for (let i = positions.length - 1; i >= 0; i -= 1) {
      const p = positions[i];
      const rad = i === 0 ? this.headRadius : this.headRadius * (0.72 - i * 0.08);
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, rad, rad * 0.88, this.progress * 3 + i * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = greens[Math.min(i, greens.length - 1)];
      ctx.fill();
      ctx.strokeStyle = 'rgba(10, 40, 15, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    const h = positions[0];
    ctx.fillStyle = '#f7dc6f';
    ctx.beginPath();
    ctx.arc(h.x - 5, h.y - 2, 3, 0, Math.PI * 2);
    ctx.arc(h.x + 5, h.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(h.x - 5 - 0.5, h.y - 5, 1.2, 5);
    ctx.fillRect(h.x + 5 - 0.5, h.y - 5, 1.2, 5);

    ctx.save();
    ctx.translate(h.x, h.y - this.headRadius - 8);
    ctx.strokeStyle = 'rgba(255, 255, 200, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(-7, -4);
    ctx.moveTo(2, 0);
    ctx.lineTo(7, -4);
    ctx.stroke();
    ctx.restore();
  }

  drawBody(ctx, x, y) {
    const splitShift = this.splitAnimT > 0 ? this.splitPopOffset * 14 : 0;
    this.drawWormBody(ctx, splitShift);
  }

  draw(ctx) {
    if (!this.alive && !this.reachedEnd) return;
    this.drawSlowTrail(ctx);
    const { x, y } = this.position;
    this.drawBody(ctx, x, y);
    this.drawBurnFlames(ctx, x, y);
    this.drawButterRootOverlay(ctx, x, y);
    this.drawButterRootStar(ctx, x, y);
    this.drawHealthBar(ctx, x, y);
  }

  render(ctx) {
    this.draw(ctx);
  }
}

/** 分裂结束瞬间在战场生成绿色粒子（由 game 调用） */
export function spawnWormSplitParticles(particles, enemy) {
  const { x, y } = enemy.position;
  for (let i = 0; i < 32; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 120;
    particles.push(
      new Particle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        radius: 2 + Math.random() * 3,
        color: Math.random() > 0.4 ? '#27ae60' : '#2ecc71',
        lifetime: 0.35 + Math.random() * 0.2
      })
    );
  }
}
