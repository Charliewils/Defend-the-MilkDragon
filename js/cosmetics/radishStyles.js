function drawDefaultBody(ctx) {
  const gradient = ctx.createLinearGradient(0, -18, 0, 20);
  gradient.addColorStop(0, '#ff8a5c');
  gradient.addColorStop(1, '#e74c3c');

  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(18, 16);
  ctx.quadraticCurveTo(0, 28, -18, 16);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawDefaultLeaves(ctx) {
  const leaves = [
    { x: -10, y: -18, rotation: -0.7, width: 10, height: 18 },
    { x: 0, y: -22, rotation: -1.57, width: 9, height: 20 },
    { x: 10, y: -18, rotation: -2.4, width: 10, height: 18 }
  ];

  for (const leaf of leaves) {
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, leaf.width / 2, leaf.height / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#27ae60';
    ctx.fill();
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

function drawPumpkinBody(ctx) {
  const gradient = ctx.createLinearGradient(-18, -8, 18, 22);
  gradient.addColorStop(0, '#ffb347');
  gradient.addColorStop(1, '#e67e22');

  ctx.beginPath();
  ctx.ellipse(0, 8, 20, 18, 0, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = '#d35400';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(211, 84, 0, 0.45)';
  ctx.lineWidth = 1.5;
  for (const x of [-10, 0, 10]) {
    ctx.beginPath();
    ctx.moveTo(x, -4);
    ctx.quadraticCurveTo(x + 4, 10, x, 24);
    ctx.stroke();
  }

  ctx.fillStyle = '#6ab04c';
  ctx.fillRect(-2, -16, 4, 8);
}

function drawPumpkinLeaves(ctx) {
  ctx.save();
  ctx.translate(0, -18);
  ctx.rotate(-0.2);
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#27ae60';
  ctx.fill();
  ctx.restore();
}

function drawEggplantBody(ctx) {
  const gradient = ctx.createLinearGradient(0, -20, 0, 24);
  gradient.addColorStop(0, '#9b59b6');
  gradient.addColorStop(1, '#6c3483');

  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.bezierCurveTo(16, -4, 14, 22, 0, 28);
  ctx.bezierCurveTo(-14, 22, -16, -4, 0, -16);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = '#512e5f';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.ellipse(-5, 2, 3, 10, -0.35, 0, Math.PI * 2);
  ctx.fill();
}

function drawEggplantLeaves(ctx) {
  const leaves = [
    { x: -8, y: -18, rotation: -0.5, width: 8, height: 12 },
    { x: 8, y: -18, rotation: -2.6, width: 8, height: 12 }
  ];

  for (const leaf of leaves) {
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, leaf.width / 2, leaf.height / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2ecc71';
    ctx.fill();
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }
}

function drawCornBody(ctx) {
  ctx.fillStyle = '#f4d03f';
  ctx.strokeStyle = '#d4ac0d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 9, 12, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f7dc6f';
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      ctx.beginPath();
      ctx.ellipse(-8 + col * 8, 0 + row * 5, 2.2, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = '#58d68d';
  ctx.beginPath();
  ctx.moveTo(-14, 4);
  ctx.lineTo(-22, 16);
  ctx.lineTo(-10, 12);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, 4);
  ctx.lineTo(22, 16);
  ctx.lineTo(10, 12);
  ctx.closePath();
  ctx.fill();
}

function drawCornLeaves(ctx) {
  ctx.fillStyle = '#27ae60';
  ctx.beginPath();
  ctx.ellipse(0, -12, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

const nailongImage = new Image();
let nailongImageReady = false;
nailongImage.onload = () => {
  nailongImageReady = nailongImage.naturalWidth > 0;
};
nailongImage.src = 'assets/1.png';

/** 奶龙：优先使用 assets/1.png，否则 Canvas 绘制 */
function drawNailongWings(ctx) {
  const wings = [
    { x: -20, y: 2, rot: -0.35 },
    { x: 20, y: 2, rot: 0.35 }
  ];
  for (const wing of wings) {
    ctx.save();
    ctx.translate(wing.x, wing.y);
    ctx.rotate(wing.rot);
    ctx.fillStyle = '#ffd93d';
    ctx.strokeStyle = '#f0b429';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-10, -8, -14, 2);
    ctx.quadraticCurveTo(-8, 10, 0, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawNailongBody(ctx) {
  if (nailongImageReady) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 4, 21, 19, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(nailongImage, -26, -20, 52, 52);
    ctx.restore();
    return;
  }

  drawNailongWings(ctx);

  const bodyGrad = ctx.createRadialGradient(-6, -8, 4, 0, 6, 24);
  bodyGrad.addColorStop(0, '#fff3a3');
  bodyGrad.addColorStop(0.55, '#ffe566');
  bodyGrad.addColorStop(1, '#f0b429');

  ctx.beginPath();
  ctx.ellipse(0, 6, 22, 20, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.strokeStyle = '#e6a817';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, 10, 14, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fill();

  const limbs = [
    { x: -16, y: 16, rot: 0.4 },
    { x: 16, y: 16, rot: -0.4 },
    { x: -8, y: 22, rot: 0.1 },
    { x: 8, y: 22, rot: -0.1 }
  ];
  ctx.fillStyle = '#ffd93d';
  ctx.strokeStyle = '#e6a817';
  ctx.lineWidth = 1.5;
  for (const limb of limbs) {
    ctx.save();
    ctx.translate(limb.x, limb.y);
    ctx.rotate(limb.rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawNailongLeaves(ctx) {
  if (nailongImageReady) return;

  ctx.fillStyle = '#ffe566';
  ctx.strokeStyle = '#f0b429';
  ctx.lineWidth = 1.5;
  for (const x of [-5, 5]) {
    ctx.beginPath();
    ctx.ellipse(x, -16, 4, 5, x < 0 ? -0.25 : 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawNailongEyes(ctx, isHurt) {
  if (nailongImageReady && !isHurt) return;

  if (isHurt) {
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-11, -2);
    ctx.lineTo(-5, 2);
    ctx.lineTo(-11, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(11, -2);
    ctx.lineTo(5, 2);
    ctx.lineTo(11, 6);
    ctx.stroke();
    return;
  }

  for (const ex of [-8, 8]) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ex, -2, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(ex + 1, -1, 2.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex - 1.5, -3, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255, 143, 163, 0.55)';
  ctx.beginPath();
  ctx.ellipse(-13, 4, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.ellipse(13, 4, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 6, 5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

const STYLE_RENDERERS = {
  default: {
    drawBody: drawDefaultBody,
    drawLeaves: drawDefaultLeaves
  },
  radish_pumpkin: {
    drawBody: drawPumpkinBody,
    drawLeaves: drawPumpkinLeaves
  },
  radish_eggplant: {
    drawBody: drawEggplantBody,
    drawLeaves: drawEggplantLeaves
  },
  radish_corn: {
    drawBody: drawCornBody,
    drawLeaves: drawCornLeaves
  },
  radish_nailong: {
    drawBody: drawNailongBody,
    drawLeaves: drawNailongLeaves,
    drawEyes: drawNailongEyes
  }
};

export function getRadishStyleRenderer(styleId) {
  return STYLE_RENDERERS[styleId] || STYLE_RENDERERS.default;
}

/** 宝石商店预览用 */
export function drawRadishStylePreview(ctx, styleId) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, '#fff9e6');
  bg.addColorStop(1, '#ffeaa7');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const renderer = getRadishStyleRenderer(styleId);
  ctx.save();
  ctx.translate(width / 2, height / 2 + 6);
  ctx.scale(1.05, 1.05);
  if (styleId === 'radish_nailong' && nailongImageReady) {
    ctx.drawImage(nailongImage, -30, -28, 60, 60);
    ctx.restore();
    return;
  }
  renderer.drawLeaves(ctx);
  renderer.drawBody(ctx);
  if (renderer.drawEyes) {
    renderer.drawEyes(ctx, false);
  } else {
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(-5, -2, 2, 0, Math.PI * 2);
    ctx.arc(5, -2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
