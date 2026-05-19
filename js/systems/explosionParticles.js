import { Particle } from '../entities/Particle.js';

const NORMAL_COLORS = ['#f39c12', '#e74c3c', '#e67e22'];
const BOSS_COLORS = ['#8e44ad', '#f1c40f', '#e74c3c', '#c0392b'];

function pickColor(palette) {
  return palette[Math.floor(Math.random() * palette.length)];
}

function getParticleColor(enemy) {
  if (enemy.typeId === 'boss' || enemy.isBoss) {
    return pickColor(BOSS_COLORS);
  }
  return pickColor(NORMAL_COLORS);
}

export function spawnEnemyExplosion(enemy, particles, scale = 1) {
  const { x, y } = enemy.position;
  const count = Math.round((12 + Math.floor(Math.random() * 5)) * scale);

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 80;
    particles.push(new Particle({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3 + Math.random() * 4,
      color: getParticleColor(enemy),
      lifetime: 0.5 + Math.random() * 0.3
    }));
  }
}
