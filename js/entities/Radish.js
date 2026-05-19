import { cellCenter, getPathEndCell } from '../map/grid.js';
import { getEquippedRadishStyle } from '../storage/gemInventory.js';
import { getRadishStyleRenderer } from '../cosmetics/radishStyles.js';

const HURT_DURATION = 0.8;
const SHAKE_DURATION = 0.45;
const SHAKE_DISTANCE = 3;
const SHAKE_COUNT = 3;

export class Radish {
  constructor(maxLives = 5) {
    const [col, row] = getPathEndCell();
    this.col = col;
    this.row = row;
    this.maxLives = maxLives;
    this.lives = maxLives;
    this.hurtTimer = 0;
    this.shakeTimer = 0;
  }

  setEndCell(col, row) {
    this.col = col;
    this.row = row;
  }

  reset(maxLives = this.maxLives) {
    const [col, row] = getPathEndCell();
    this.col = col;
    this.row = row;
    this.maxLives = maxLives;
    this.lives = maxLives;
    this.hurtTimer = 0;
    this.shakeTimer = 0;
  }

  loseLife() {
    if (this.lives <= 0) return;
    this.lives -= 1;
    this.hurtTimer = HURT_DURATION;
    this.shakeTimer = SHAKE_DURATION;
  }

  update(dt) {
    if (this.hurtTimer > 0) {
      this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    }
    if (this.shakeTimer > 0) {
      this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    }
  }

  get isHurt() {
    return this.hurtTimer > 0;
  }

  getShakeOffset() {
    if (this.shakeTimer <= 0) return 0;
    const progress = 1 - this.shakeTimer / SHAKE_DURATION;
    const wave = Math.sin(progress * Math.PI * SHAKE_COUNT * 2);
    const fade = this.shakeTimer / SHAKE_DURATION;
    return wave * SHAKE_DISTANCE * fade;
  }

  drawBody(ctx) {
    getRadishStyleRenderer(getEquippedRadishStyle()).drawBody(ctx);
  }

  drawLeaves(ctx) {
    getRadishStyleRenderer(getEquippedRadishStyle()).drawLeaves(ctx);
  }

  drawEyes(ctx) {
    const renderer = getRadishStyleRenderer(getEquippedRadishStyle());
    if (renderer.drawEyes) {
      renderer.drawEyes(ctx, this.isHurt);
      return;
    }

    if (this.isHurt) {
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(-10, -2);
      ctx.lineTo(-4, 2);
      ctx.lineTo(-10, 6);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(10, -2);
      ctx.lineTo(4, 2);
      ctx.lineTo(10, 6);
      ctx.stroke();
      return;
    }

    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(-7, 0, 2.5, 0, Math.PI * 2);
    ctx.arc(7, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-7, 2, 4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(7, 2, 4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  render(ctx) {
    const center = cellCenter(this.col, this.row);
    const x = center.x + this.getShakeOffset();
    const y = center.y + 2;

    ctx.save();
    ctx.translate(x, y);
    this.drawLeaves(ctx);
    this.drawBody(ctx);
    this.drawEyes(ctx);
    ctx.restore();
  }
}
