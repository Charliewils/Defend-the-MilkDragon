import { audioManager } from './index.js';

const SHOOT_SOUNDS = {
  normal: 'shoot_normal',
  ice: 'shoot_ice',
  titan: 'shoot_titan',
  lava: 'shoot_lava',
  spread: 'shoot_spread',
  butter: 'shoot_butter'
};

export function playTowerShootSound(typeId) {
  audioManager.playSound(SHOOT_SOUNDS[typeId] || 'shoot_normal');
}

export function playBulletHitSound(tower) {
  if (!tower) return;
  if (tower.typeId === 'ice') {
    audioManager.playSound('hit_ice');
    return;
  }
  if (tower.typeId === 'butter') {
    audioManager.playSound('hit_butter');
    return;
  }
  audioManager.playSound('hit_normal');
}

export function playButterRootSound() {
  audioManager.playSound('butter_root');
}
