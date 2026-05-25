import { getEnemyConfig } from '../../config/enemies.js';
import { drawStyledHealthBar } from '../../render/vectorArt.js';
import {
  getEndlessWaveHpMultiplier,
  getEndlessWaveSpeedMultiplier
} from '../../wave/endless.js';
import { getPathTotalLength, positionOnPath } from '../../map/grid.js';
import { spawnDamageNumber } from '../../systems/damageNumbers.js';

export class Enemy {
  constructor({
    typeId = 'normal',
    wave = 1,
    mode = 'campaign',
    progress = 0,
    squadIndex = null,
    isLeader = false,
    difficultyScale = 1
  }) {
    const config = getEnemyConfig(typeId);
    this.typeId = typeId;
    this.name = config.name;
    this.wave = wave;
    this.mode = mode;
    this.difficultyScale = difficultyScale;
    this.progress = progress;
    this.squadIndex = squadIndex;
    this.isLeader = isLeader;
    this.alive = true;
    this.reachedEnd = false;

    this.size = config.size;
    this.radius = config.size;
    this.reward = config.reward;
    this.damageReduction = 0;

    const scaled = this.getScaledStats(config);
    this.maxHp = scaled.hp;
    this.hp = scaled.hp;
    this.baseSpeed = scaled.speed;

    this.slowMultiplier = 1;
    this.slowTimer = 0;
    this.isSlowed = false;
    this.isInvisible = false;
    this.invisibleTimer = 0;

    this.burnTimer = 0;
    this.burnTickTimer = 0;
    this.burnDamagePerTick = 0;
    this.burnTickInterval = 0.5;
    this.burnFlashTimer = 0;
    this.slowTrail = [];
    this.rushGhosts = [];

    this.butterRootTimer = 0;
    this.butterSlipTimer = 0;
    this.butterGooPhase = 0;
  }

  getScaledStats(config) {
    let hp = config.hp;
    let speed = config.speed;

    if (this.mode === 'endless') {
      hp = Math.round(hp * getEndlessWaveHpMultiplier(this.wave));
      speed = speed * getEndlessWaveSpeedMultiplier(this.wave);
    }

    if (this.wave >= 6 && this.difficultyScale && this.difficultyScale !== 1) {
      const scale = this.difficultyScale;
      hp = Math.round(hp * scale);
      speed = speed * (0.7 + scale * 0.3);
    }

    return { hp, speed };
  }

  get speed() {
    return this.baseSpeed * this.slowMultiplier;
  }

  get isBoss() {
    return this.typeId === 'boss';
  }

  canBeTargeted() {
    return this.alive && !this.isInvisible;
  }

  applySlow(multiplier, duration) {
    if (!this.alive || this.isInvisible) return;
    this.slowMultiplier = Math.min(this.slowMultiplier, multiplier);
    this.slowTimer = Math.max(this.slowTimer, duration);
    this.isSlowed = this.slowTimer > 0;
    this.onSlowApplied();
  }

  onSlowApplied() {}

  applyBurn(damagePerTick, duration, tickInterval = 0.5) {
    this.burnDamagePerTick = damagePerTick;
    this.burnTickInterval = tickInterval;
    this.burnTimer = duration;
    this.burnTickTimer = Math.min(this.burnTickTimer, tickInterval);
  }

  /** 时间冻结道具期间是否仍沿路径移动（霸体战士为 true） */
  ignoresWorldFreeze() {
    return false;
  }

  update(dt, damageNumbers = null, env = {}) {
    if (!this.alive) return;
    if (env.worldFrozen && !this.ignoresWorldFreeze()) return;

    this.updateStatusTimers(dt);
    this.updateBurn(dt, damageNumbers);
    this.onUpdate(dt);
    this.moveAlongPath(dt);
    this.updateSlowTrail();
  }

  updateStatusTimers(dt) {
    if (this.burnFlashTimer > 0) {
      this.burnFlashTimer = Math.max(0, this.burnFlashTimer - dt);
    }

    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) {
        this.slowTimer = 0;
        this.slowMultiplier = 1;
        this.isSlowed = false;
        this.slowTrail = [];
        this.onSlowEnded();
      } else {
        this.isSlowed = true;
      }
    }

    if (this.butterRootTimer > 0) {
      this.butterRootTimer -= dt;
      if (this.butterRootTimer <= 0) {
        this.butterRootTimer = 0;
        this.butterSlipTimer = 0.3;
      }
    } else if (this.butterSlipTimer > 0) {
      this.butterSlipTimer = Math.max(0, this.butterSlipTimer - dt);
    }

    if (this.butterRootTimer > 0 || this.butterSlipTimer > 0) {
      this.butterGooPhase += dt * 4;
    }
  }

  onSlowEnded() {}

  updateBurn(dt, damageNumbers) {
    if (this.burnTimer <= 0) return;

    this.burnTimer -= dt;
    this.burnTickTimer -= dt;
    while (this.burnTickTimer <= 0 && this.burnTimer > 0) {
      const { x, y } = this.position;
      const dealt = this.takeDamage(damageNumbers, this.burnDamagePerTick, {
        x,
        y: y - this.radius,
        variant: 'lava',
        isBonus: true,
        showDamageNumber: Boolean(damageNumbers)
      });
      if (dealt > 0) {
        this.burnFlashTimer = 0.25;
      }
      this.burnTickTimer += this.burnTickInterval;
    }
    if (this.burnTimer <= 0) {
      this.burnTimer = 0;
      this.burnTickTimer = 0;
    }
  }

  onUpdate(dt) {}

  canBeRootedByButter() {
    return this.alive && !this.isInvisible && this.typeId !== 'boss';
  }

  applyButterRoot(duration) {
    if (!this.canBeRootedByButter()) return;
    if (duration <= 0) return;
    this.butterRootTimer = Math.max(this.butterRootTimer, duration);
  }

  moveAlongPath(dt) {
    if (this.butterRootTimer > 0) return;
    this.progress += (this.speed * dt) / getPathTotalLength();
    if (this.progress >= 1) {
      this.progress = 1;
      this.alive = false;
      this.reachedEnd = true;
    }
  }

  updateSlowTrail() {
    if (!this.isSlowed) return;
    if (this.butterRootTimer > 0) return;
    const { x, y } = this.position;
    this.slowTrail.push({ x, y });
    if (this.slowTrail.length > 6) {
      this.slowTrail.shift();
    }
  }

  get position() {
    return positionOnPath(this.progress);
  }

  takeDamage(damageNumbers, amount, options = {}) {
    if (!this.alive) return 0;
    const finalDamage = amount * (1 - this.damageReduction);
    this.hp -= finalDamage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }

    if (damageNumbers && options.showDamageNumber !== false && finalDamage > 0) {
      const { x, y } = this.position;
      spawnDamageNumber(damageNumbers, {
        x: options.x ?? x,
        y: options.y ?? (y - this.radius),
        value: finalDamage,
        variant: options.variant || 'normal',
        isBonus: Boolean(options.isBonus)
      });
    }

    return finalDamage;
  }

  onDeath() {
    return { screenShake: false, explosionScale: 1 };
  }

  shouldSplitOnDeath() {
    return false;
  }

  createSplitChildren() {
    return [];
  }

  getHealthBarColor(ratio) {
    if (ratio > 0.6) return '#4caf50';
    if (ratio > 0.3) return '#ffeb3b';
    return '#f44336';
  }

  drawHealthBar(ctx, x, y) {
    if (!this.alive || this.isInvisible) return;
    drawStyledHealthBar(ctx, x, y, this.radius, this.hp / this.maxHp, {
      isBoss: this.isBoss,
      hpText: this.isBoss ? `${Math.ceil(this.hp)}/${this.maxHp}` : ''
    });
  }

  drawButterRootOverlay(ctx, x, y) {
    if (!(this.butterRootTimer > 0 || this.butterSlipTimer > 0)) return;
    const slipping = this.butterRootTimer <= 0 && this.butterSlipTimer > 0;
    const slipT = slipping ? 1 - this.butterSlipTimer / 0.3 : 0;
    const yOff = slipT * 16;
    const alpha = slipping ? 0.5 * (1 - slipT) : 0.48;

    ctx.save();
    ctx.translate(x, y + yOff);
    const segments = 36;
    const baseR = this.radius + 4;
    ctx.beginPath();
    for (let i = 0; i <= segments; i += 1) {
      const ang = (i / segments) * Math.PI * 2;
      const wave =
        Math.sin(ang * 6 + this.butterGooPhase) * 2.8 +
        Math.sin(ang * 4 - this.butterGooPhase * 1.2) * 1.6;
      const r = baseR + wave;
      const px = Math.cos(ang) * r;
      const py = Math.sin(ang) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 224, 130, ${alpha * 0.55})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(230, 180, 50, ${alpha * 0.7})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  drawButterRootStar(ctx, x, y) {
    if (this.butterRootTimer <= 0) return;
    ctx.save();
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#f1c40f';
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 2;
    ctx.strokeText('★', x, y - this.radius - 10);
    ctx.fillText('★', x, y - this.radius - 10);
    ctx.restore();
  }

  drawSlowTrail(ctx) {
    if (this.slowTrail.length < 2) return;
    for (let i = 0; i < this.slowTrail.length; i += 1) {
      const point = this.slowTrail[i];
      const alpha = (i + 1) / this.slowTrail.length * 0.35;
      ctx.beginPath();
      ctx.arc(point.x, point.y, this.radius * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(133, 193, 233, ${alpha})`;
      ctx.fill();
    }
  }

  drawBurnFlames(ctx, x, y) {
    if (this.burnTimer <= 0) return;
    const flash = this.burnFlashTimer > 0 ? 0.35 : 0;
    for (let i = 0; i < 4; i += 1) {
      const angle = (Math.PI * 2 * i) / 4 + this.progress * 8;
      const flameX = x + Math.cos(angle) * (this.radius + 4);
      const flameY = y + Math.sin(angle) * (this.radius + 4) - 2;
      ctx.beginPath();
      ctx.arc(flameX, flameY, 3 + flash, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 167, 38, ${0.55 + flash})`;
      ctx.fill();
    }
  }

  drawBody(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.strokeStyle = '#922b21';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawFace(ctx, x, y) {}

  draw(ctx) {
    if (!this.alive && !this.reachedEnd) return;
    const { x, y } = this.position;
    this.drawSlowTrail(ctx);
    this.drawBody(ctx, x, y);
    this.drawFace(ctx, x, y);
    this.drawBurnFlames(ctx, x, y);
    this.drawButterRootOverlay(ctx, x, y);
    this.drawButterRootStar(ctx, x, y);
    this.drawHealthBar(ctx, x, y);
  }

  render(ctx) {
    this.draw(ctx);
  }
}
