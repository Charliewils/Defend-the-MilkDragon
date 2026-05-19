function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parseHex(hex) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) {
    return { r: 149, g: 165, b: 166 };
  }
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function toHex({ r, g, b }) {
  const channel = (value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function blendHex(source, target, amount) {
  const from = parseHex(source);
  const to = parseHex(target);
  const mix = clamp(amount, 0, 1);
  return toHex({
    r: from.r + (to.r - from.r) * mix,
    g: from.g + (to.g - from.g) * mix,
    b: from.b + (to.b - from.b) * mix
  });
}

function quantizeHex(hex, step = 48) {
  const { r, g, b } = parseHex(hex);
  const snap = (value) => clamp(Math.round(value / step) * step, 0, 255);
  return toHex({ r: snap(r), g: snap(g), b: snap(b) });
}

function remapColor(hex, skinId) {
  switch (skinId) {
    case 'tower_skin_gold':
      return blendHex(hex, '#f1c40f', 0.58);
    case 'tower_skin_dark':
      return blendHex(hex, '#1f2933', 0.72);
    case 'tower_skin_pixel':
      return quantizeHex(blendHex(hex, '#00a8ff', 0.18), 40);
    default:
      return hex;
  }
}

export function applyTowerSkinToConfig(config, skinId) {
  if (!config || !skinId || skinId === 'default') {
    return config;
  }

  return {
    ...config,
    color: remapColor(config.color, skinId),
    stroke: remapColor(config.stroke, skinId),
    barrel: remapColor(config.barrel, skinId),
    bulletColor: remapColor(config.bulletColor, skinId)
  };
}
