/** @param {CanvasRenderingContext2D} ctx */
export function drawItemIcon(ctx, itemId, cx, cy, size = 40) {
  ctx.save();
  ctx.translate(cx, cy);
  const s = size / 40;
  ctx.scale(s, s);
  switch (itemId) {
    case 'lightning_storm':
      drawLightningIcon(ctx);
      break;
    case 'time_freeze':
      drawHourglassIcon(ctx);
      break;
    case 'gold_rain':
      drawCoinIcon(ctx);
      break;
    case 'power_surge':
      drawPowerSurgeIcon(ctx);
      break;
    default:
      break;
  }
  ctx.restore();
}

function drawLightningIcon(ctx) {
  ctx.strokeStyle = '#f1c40f';
  ctx.fillStyle = '#f9e79f';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(2, -12);
  ctx.lineTo(-6, 2);
  ctx.lineTo(-1, 2);
  ctx.lineTo(-4, 14);
  ctx.lineTo(8, -4);
  ctx.lineTo(1, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawHourglassIcon(ctx) {
  ctx.strokeStyle = '#5dade2';
  ctx.fillStyle = 'rgba(93, 173, 226, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, -12);
  ctx.lineTo(10, -12);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-10, 12);
  ctx.lineTo(10, 12);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawCoinIcon(ctx) {
  ctx.fillStyle = '#f4d03f';
  ctx.strokeStyle = '#d4ac0d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#b7950b';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('¥', 0, 1);
}

function drawPowerSurgeIcon(ctx) {
  ctx.strokeStyle = '#e67e22';
  ctx.fillStyle = 'rgba(230, 126, 34, 0.45)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

export const ITEM_DEFINITIONS = {
  lightning_storm: {
    id: 'lightning_storm',
    name: '闪电风暴',
    description: '对全场敌人造成150点伤害',
    cooldown: 60
  },
  time_freeze: {
    id: 'time_freeze',
    name: '时间冻结',
    description: '全场敌人静止3秒',
    cooldown: 90
  },
  gold_rain: {
    id: 'gold_rain',
    name: '金币雨',
    description: '立即获得120金币',
    cooldown: 45
  },
  power_surge: {
    id: 'power_surge',
    name: '强化脉冲',
    description: '所有炮台攻速×2，持续8秒',
    cooldown: 80
  }
};

export const ALL_ITEM_IDS = Object.keys(ITEM_DEFINITIONS);
